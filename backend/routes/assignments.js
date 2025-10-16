import express from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../server.js';
import { extractTextFromFile } from '../utils/textExtractor.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Upload assignment endpoint
router.post('/upload', authenticateUser, upload.single('assignment'), async (req, res) => {
  try {
    const { studentName, courseName, assignmentTitle } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!studentName || !courseName || !assignmentTitle) {
      return res.status(400).json({ 
        error: 'Student name, course name, and assignment title are required' 
      });
    }

    // Ensure user exists in users table (using admin client to bypass RLS)
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them using admin client
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: userId,
            email: req.user.email,
            role: 'teacher',
            is_admin: false,
            created_at: new Date().toISOString()
          }
        ]);

      if (createUserError) {
        console.error('User creation error:', createUserError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!studentName || !courseName || !assignmentTitle) {
      return res.status(400).json({ 
        error: 'Student name, course name, and assignment title are required' 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.originalname}`;

    // Upload file to Supabase Storage (using admin client)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Extract text from file using the textExtractor utility
    let fileContent = '';
    try {
      fileContent = await extractTextFromFile(file.buffer, file.mimetype);
      if (!fileContent) {
        console.error('Text extraction returned empty result');
        fileContent = '[Text extraction failed]';
      }
    } catch (textError) {
      console.error('Text extraction error:', textError);
      fileContent = '[Text extraction failed]';
    }

    // Save assignment metadata to database (using admin client to bypass RLS)
    const { data: assignmentData, error: dbError } = await supabaseAdmin
      .from('assignments')
      .insert([
        {
          user_id: userId,
          student_name: studentName,
          course_name: courseName,
          assignment_title: assignmentTitle,
          file_name: file.originalname,
          file_path: fileName,
          file_size: file.size,
          file_type: file.mimetype,
          extracted_text: fileContent,
          status: 'uploaded',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to cleanup uploaded file
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .remove([fileName]);
      
      return res.status(500).json({ error: 'Failed to save assignment data' });
    }

    res.status(201).json({
      message: 'Assignment uploaded successfully',
      assignment: assignmentData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get assignment by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        reports (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ assignment });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all assignments for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, course } = req.query;

    let query = supabaseAdmin
      .from('assignments')
      .select(`
        *,
        reports (id, ai_probability, plagiarism_score, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Add filters
    if (status) {
      query = query.eq('status', status);
    }
    if (course) {
      query = query.ilike('course_name', `%${course}%`);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Get assignments error:', error);
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }

    res.json({ assignments });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Re-extract text from assignment file
router.post('/:id/reextract', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get assignment
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    console.log(`🔄 Re-extracting text for assignment: ${assignment.assignment_title}`);

    try {
      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .download(assignment.file_path);

      if (downloadError) {
        console.error('File download error:', downloadError);
        return res.status(500).json({ error: 'Failed to download file for re-extraction' });
      }

      // Convert to buffer
      const buffer = Buffer.from(await fileData.arrayBuffer());
      console.log(`📁 Downloaded file: ${buffer.length} bytes`);

      // Extract text
      const extractedText = await extractTextFromFile(buffer, assignment.file_type);
      console.log(`📝 Extracted text: ${extractedText.length} characters`);

      if (!extractedText || extractedText.length < 10) {
        return res.status(400).json({ 
          error: 'Text extraction returned minimal content. This may be a scanned document or image-based PDF.' 
        });
      }

      // Update assignment with new extracted text
      const { data: updatedAssignment, error: updateError } = await supabaseAdmin
        .from('assignments')
        .update({ 
          extracted_text: extractedText,
          status: 'processed'
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: 'Failed to update assignment with extracted text' });
      }

      res.json({
        message: 'Text re-extraction completed successfully',
        assignment: updatedAssignment,
        extractedLength: extractedText.length
      });

    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      res.status(500).json({ 
        error: 'Text extraction failed',
        details: extractError.message 
      });
    }

  } catch (error) {
    console.error('Re-extract text error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete assignment
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get assignment to check ownership and get file path
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('assignments')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .remove([assignment.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete assignment from database (reports will be deleted via cascade)
    const { error: deleteError } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete assignment' });
    }

    res.json({ message: 'Assignment deleted successfully' });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
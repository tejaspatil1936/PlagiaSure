import express from 'express';
import { supabase } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';
import { detectAIContent } from '../services/aiDetection.js';
import { detectPlagiarism } from '../services/plagiarismDetection.js';

const router = express.Router();

// Generate report endpoint
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const userId = req.user.id;

    if (!assignmentId) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }

    // Get assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('user_id', userId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (!assignment.extracted_text) {
      return res.status(400).json({ error: 'No text content available for analysis' });
    }

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('*')
      .eq('assignment_id', assignmentId)
      .single();

    if (existingReport && existingReport.status === 'completed') {
      return res.json({
        message: 'Report already exists',
        report: existingReport
      });
    }

    // Create or update report with processing status
    const reportData = {
      assignment_id: assignmentId,
      user_id: userId,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    let reportId;
    if (existingReport) {
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update(reportData)
        .eq('id', existingReport.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      reportId = updatedReport.id;
    } else {
      const { data: newReport, error: insertError } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      reportId = newReport.id;
    }

    // Process analysis asynchronously
    processAnalysis(reportId, assignment.extracted_text);

    res.status(202).json({
      message: 'Report generation started',
      reportId: reportId,
      status: 'processing'
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get report by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        *,
        assignments (
          student_name,
          course_name,
          assignment_title,
          file_name
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reports for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = supabase
      .from('reports')
      .select(`
        *,
        assignments (
          student_name,
          course_name,
          assignment_title,
          file_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: reports, error } = await query;

    if (error) {
      console.error('Get reports error:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    res.json({ reports });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Async function to process AI and plagiarism analysis
async function processAnalysis(reportId, text) {
  try {
    console.log(`Starting analysis for report ${reportId}`);

    // Run AI detection and plagiarism detection in parallel
    const [aiResult, plagiarismResult] = await Promise.allSettled([
      detectAIContent(text),
      detectPlagiarism(text)
    ]);

    let aiProbability = 0;
    let aiHighlight = [];
    let plagiarismScore = 0;
    let plagiarismHighlight = [];
    let verdict = 'Analysis completed';

    // Process AI detection results
    if (aiResult.status === 'fulfilled') {
      aiProbability = aiResult.value.probability || 0;
      aiHighlight = aiResult.value.highlight || [];
    } else {
      console.error('AI detection failed:', aiResult.reason);
    }

    // Process plagiarism detection results
    if (plagiarismResult.status === 'fulfilled') {
      plagiarismScore = plagiarismResult.value.score || 0;
      plagiarismHighlight = plagiarismResult.value.highlight || [];
    } else {
      console.error('Plagiarism detection failed:', plagiarismResult.reason);
    }

    // Generate verdict
    if (aiProbability > 0.7 && plagiarismScore > 0.3) {
      verdict = 'High AI probability with significant plagiarism detected';
    } else if (aiProbability > 0.7) {
      verdict = 'Likely AI-generated content';
    } else if (plagiarismScore > 0.3) {
      verdict = 'Plagiarism detected';
    } else if (aiProbability > 0.4 || plagiarismScore > 0.1) {
      verdict = 'Some concerns detected - manual review recommended';
    } else {
      verdict = 'Content appears original';
    }

    // Update report with results
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        ai_probability: aiProbability,
        ai_highlight: aiHighlight,
        plagiarism_score: plagiarismScore,
        plagiarism_highlight: plagiarismHighlight,
        verdict: verdict,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Failed to update report:', updateError);
      
      // Mark as failed
      await supabase
        .from('reports')
        .update({
          status: 'failed',
          error_message: 'Failed to save analysis results'
        })
        .eq('id', reportId);
    } else {
      console.log(`Analysis completed for report ${reportId}`);
    }

  } catch (error) {
    console.error('Analysis processing error:', error);
    
    // Mark report as failed
    await supabase
      .from('reports')
      .update({
        status: 'failed',
        error_message: error.message || 'Analysis processing failed'
      })
      .eq('id', reportId);
  }
}

export default router;
import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, type = 'general' } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Insert contact submission
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject: subject.trim(),
          message: message.trim(),
          type,
          ip_address: ipAddress,
          user_agent: userAgent
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Contact submission error:', error);
      return res.status(500).json({
        error: 'Failed to submit contact form',
        code: 'SUBMISSION_ERROR'
      });
    }

    // TODO: Send email notification to admin
    // TODO: Send auto-reply email to user

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get all contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const { page = 1, limit = 20, status, type } = req.query;

    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Get contact submissions error:', error);
      return res.status(500).json({
        error: 'Failed to fetch contact submissions',
        code: 'FETCH_ERROR'
      });
    }

    res.json({
      success: true,
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: submissions.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Update contact submission status (admin only)
router.patch('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const { id } = req.params;
    const { status, priority, response_message } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (response_message) {
      updateData.response_message = response_message;
      updateData.responded_at = new Date().toISOString();
      // TODO: Add responded_by from authenticated admin user
    }

    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update contact submission error:', error);
      return res.status(500).json({
        error: 'Failed to update contact submission',
        code: 'UPDATE_ERROR'
      });
    }

    if (!submission) {
      return res.status(404).json({
        error: 'Contact submission not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      submission
    });

  } catch (error) {
    console.error('Update contact submission error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get contact submission statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware

    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    // Get submissions by status
    const { data: statusStats } = await supabase
      .from('contact_submissions')
      .select('status')
      .then(({ data }) => {
        const stats = {};
        data?.forEach(item => {
          stats[item.status] = (stats[item.status] || 0) + 1;
        });
        return { data: stats };
      });

    // Get submissions by type
    const { data: typeStats } = await supabase
      .from('contact_submissions')
      .select('type')
      .then(({ data }) => {
        const stats = {};
        data?.forEach(item => {
          stats[item.type] = (stats[item.type] || 0) + 1;
        });
        return { data: stats };
      });

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSubmissions } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    res.json({
      success: true,
      stats: {
        total: totalSubmissions || 0,
        recent: recentSubmissions || 0,
        byStatus: statusStats || {},
        byType: typeStats || {}
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
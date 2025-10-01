import express from 'express';
import { supabase } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Subscription plans (for reference)
const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: '$29.99/month',
    checks_per_month: 100,
    features: ['100 checks per month', 'Basic AI detection', 'Plagiarism checking', 'Email support']
  },
  pro: {
    name: 'Pro Plan',
    price: '$49.99/month',
    checks_per_month: 500,
    features: ['500 checks per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing']
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: '$99.99/month',
    checks_per_month: -1, // Unlimited
    features: ['Unlimited checks', 'Custom AI models', 'API access', 'Dedicated support', 'Custom integrations']
  }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS
  });
});

// Request subscription (manual approval)
router.post('/request-subscription', authenticateUser, async (req, res) => {
  try {
    const { planType, message } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .single();

    if (existingSubscription) {
      return res.status(400).json({ 
        error: existingSubscription.status === 'active' 
          ? 'You already have an active subscription' 
          : 'You already have a pending subscription request'
      });
    }

    // Create subscription request
    const { data: subscriptionRequest, error: dbError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: planType,
          status: 'pending',
          checks_used: 0,
          checks_limit: PLANS[planType].checks_per_month,
          request_message: message || '',
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database subscription request error:', dbError);
      return res.status(500).json({ error: 'Failed to create subscription request' });
    }

    res.status(201).json({
      message: 'Subscription request submitted successfully. An admin will review your request.',
      subscription: subscriptionRequest
    });

  } catch (error) {
    console.error('Subscription request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Subscription fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    if (!subscription) {
      return res.json({
        hasSubscription: false,
        message: 'No subscription found'
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
    const isActive = subscription.status === 'active' && (!periodEnd || periodEnd > now);

    res.json({
      hasSubscription: true,
      subscription: {
        ...subscription,
        isActive,
        plan: PLANS[subscription.plan_type],
        daysRemaining: isActive && periodEnd ? Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)) : null
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription request (only for pending requests)
router.post('/cancel-request', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pending subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'No pending subscription request found' });
    }

    // Cancel the request
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to cancel subscription request' });
    }

    res.json({
      message: 'Subscription request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes (these would typically be in a separate admin router with admin authentication)

// Get all subscription requests (admin only)
router.get('/admin/requests', authenticateUser, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        users (
          email,
          school_name
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error } = await query;

    if (error) {
      console.error('Get subscription requests error:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription requests' });
    }

    res.json({ 
      requests: requests.map(req => ({
        ...req,
        plan: PLANS[req.plan_type]
      }))
    });

  } catch (error) {
    console.error('Get subscription requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve subscription request (admin only)
router.post('/admin/approve/:id', authenticateUser, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { id } = req.params;
    const { duration_months = 1 } = req.body;

    // Get the subscription request
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Subscription request not found' });
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + duration_months);

    // Approve the subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        approved_at: now.toISOString(),
        approved_by: req.user.id
      })
      .eq('id', id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to approve subscription' });
    }

    res.json({
      message: 'Subscription approved successfully',
      subscription: {
        ...subscription,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString()
      }
    });

  } catch (error) {
    console.error('Approve subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject subscription request (admin only)
router.post('/admin/reject/:id', authenticateUser, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { id } = req.params;
    const { reason } = req.body;

    // Get the subscription request
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Subscription request not found' });
    }

    // Reject the subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'No reason provided',
        rejected_at: new Date().toISOString(),
        rejected_by: req.user.id
      })
      .eq('id', id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to reject subscription' });
    }

    res.json({
      message: 'Subscription request rejected',
      subscription: {
        ...subscription,
        status: 'rejected',
        rejection_reason: reason || 'No reason provided'
      }
    });

  } catch (error) {
    console.error('Reject subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
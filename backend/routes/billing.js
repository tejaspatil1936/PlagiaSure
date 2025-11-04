import express from 'express';
import { supabase, supabaseAdmin } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Helper function to calculate subscription period
const calculateSubscriptionPeriod = (planType, customDuration = null) => {
  const plan = PLANS[planType];
  if (!plan) return null;

  const now = new Date();
  const duration = customDuration || plan.duration;

  if (duration === 0) {
    // Permanent plan (like free)
    return {
      start: now.toISOString(),
      end: null
    };
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + duration);

  return {
    start: now.toISOString(),
    end: periodEnd.toISOString()
  };
};

// Subscription plans with new pricing structure
const PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    priceDisplay: 'Free',
    duration: 0, // Permanent
    checksLimit: 2,
    features: ['2 scans only', 'Basic plagiarism checking', 'Limited AI detection'],
    restrictions: ['Watermarked reports', 'No export options', 'Basic support only']
  },
  basic_monthly: {
    name: 'Basic Plan (Monthly)',
    price: 39900, // ₹399 in paise
    priceDisplay: '₹399/month',
    duration: 1, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support', 'Report history access'],
    restrictions: ['No batch processing', 'Limited export options']
  },
  basic_yearly: {
    name: 'Basic Plan (Yearly)',
    price: 399000, // ₹3990 in paise (₹399 x 10 months - 2 months free)
    priceDisplay: '₹3,990/year',
    originalPrice: 479880, // ₹399 x 12 months
    discount: '2 months free',
    duration: 12, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support', 'Report history access', '2 months free'],
    restrictions: ['No batch processing', 'Limited export options']
  },
  pro_monthly: {
    name: 'Pro Plan (Monthly)',
    price: 59900, // ₹599 in paise
    priceDisplay: '₹599/month',
    duration: 1, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing', 'Full export options (PDF, Word)'],
    restrictions: []
  },
  pro_yearly: {
    name: 'Pro Plan (Yearly)',
    price: 599000, // ₹5990 in paise (₹599 x 10 months - 2 months free)
    priceDisplay: '₹5,990/year',
    originalPrice: 718800, // ₹599 x 12 months
    discount: '2 months free',
    duration: 12, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing', 'Full export options (PDF, Word)', '2 months free'],
    restrictions: []
  }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS
  });
});

// Get specific plan details
router.get('/plans/:planType', (req, res) => {
  const { planType } = req.params;
  
  if (!PLANS[planType]) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  res.json({
    plan: PLANS[planType]
  });
});

// Request subscription (with payment integration)
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

    const plan = PLANS[planType];

    // Handle free plan - activate immediately
    if (planType === 'free' || plan.price === 0) {
      const { data: subscriptionRequest, error: dbError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            plan_type: planType,
            status: 'active',
            checks_used: 0,
            checks_limit: plan.checksLimit,
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Free plan doesn't expire
            created_at: new Date().toISOString(),
            approved_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database subscription creation error:', dbError);
        return res.status(500).json({ error: 'Failed to create free subscription' });
      }

      return res.status(201).json({
        message: 'Free plan activated successfully!',
        subscription: subscriptionRequest,
        requiresPayment: false
      });
    }

    // For paid plans, create pending subscription that requires payment
    const { data: subscriptionRequest, error: dbError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: planType,
          status: 'pending',
          checks_used: 0,
          checks_limit: plan.checksLimit,
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

    // For paid plans, return payment information
    res.status(201).json({
      message: 'Subscription created. Payment required to activate.',
      subscription: subscriptionRequest,
      requiresPayment: true,
      plan: {
        name: plan.name,
        price: plan.price,
        priceDisplay: plan.priceDisplay,
        duration: plan.duration,
        features: plan.features
      },
      paymentInfo: {
        amount: plan.price,
        currency: 'INR',
        planType: planType
      }
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

// Activate subscription after successful payment
router.post('/activate-subscription', authenticateUser, async (req, res) => {
  try {
    const { subscriptionId, paymentId } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // Get the pending subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Pending subscription not found' });
    }

    const plan = PLANS[subscription.plan_type];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Calculate period dates based on plan duration
    const now = new Date();
    const periodEnd = new Date();
    if (plan.duration > 0) {
      periodEnd.setMonth(periodEnd.getMonth() + plan.duration);
    } else {
      // For permanent plans, set no end date
      periodEnd = null;
    }

    // Activate the subscription
    const updateData = {
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd ? periodEnd.toISOString() : null,
      approved_at: now.toISOString()
    };

    // Add payment reference if provided
    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to activate subscription' });
    }

    res.json({
      message: 'Subscription activated successfully',
      subscription: {
        ...updatedSubscription,
        plan: plan
      }
    });

  } catch (error) {
    console.error('Activate subscription error:', error);
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

// Cancel active subscription
router.post('/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    // Get active subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'User requested cancellation'
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change subscription plan (upgrade/downgrade)
router.post('/change-plan', authenticateUser, async (req, res) => {
  try {
    const { newPlanType } = req.body;
    const userId = req.user.id;

    if (!newPlanType || !PLANS[newPlanType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Get current active subscription
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError || !currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const newPlan = PLANS[newPlanType];
    const currentPlan = PLANS[currentSubscription.plan_type];

    // Handle downgrade to free plan
    if (newPlanType === 'free') {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: newPlanType,
          checks_limit: newPlan.checksLimit,
          current_period_end: null, // Free plan doesn't expire
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        return res.status(500).json({ error: 'Failed to change plan' });
      }

      return res.json({
        message: 'Plan changed to Free successfully',
        subscription: {
          ...currentSubscription,
          plan_type: newPlanType,
          checks_limit: newPlan.checksLimit,
          plan: newPlan
        },
        requiresPayment: false
      });
    }

    // For paid plan changes, create a new pending subscription
    // The old subscription will be cancelled when payment is confirmed
    const { data: newSubscription, error: createError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: newPlanType,
          status: 'pending',
          checks_used: 0,
          checks_limit: newPlan.checksLimit,
          request_message: `Plan change from ${currentPlan.name} to ${newPlan.name}`,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Database create error:', createError);
      return res.status(500).json({ error: 'Failed to create plan change request' });
    }

    res.json({
      message: 'Plan change initiated. Payment required to complete.',
      subscription: newSubscription,
      requiresPayment: true,
      plan: {
        name: newPlan.name,
        price: newPlan.price,
        priceDisplay: newPlan.priceDisplay,
        duration: newPlan.duration,
        features: newPlan.features
      },
      paymentInfo: {
        amount: newPlan.price,
        currency: 'INR',
        planType: newPlanType,
        isUpgrade: newPlan.price > currentPlan.price
      }
    });

  } catch (error) {
    console.error('Change plan error:', error);
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
        plan: PLANS[req.plan_type] || { name: 'Unknown Plan', price: 0 }
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
    const { duration_months } = req.body;

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

    // Calculate period dates using plan defaults or custom duration
    const period = calculateSubscriptionPeriod(subscription.plan_type, duration_months);
    if (!period) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Approve the subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: period.start,
        current_period_end: period.end,
        approved_at: new Date().toISOString(),
        approved_by: req.user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to approve subscription' });
    }

    res.json({
      message: 'Subscription approved successfully',
      subscription: {
        ...updatedSubscription,
        plan: PLANS[subscription.plan_type]
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
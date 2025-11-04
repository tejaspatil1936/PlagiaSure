import express from 'express';
import { supabase } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';
import {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  getRazorpayKeyId
} from '../services/razorpayService.js';

const router = express.Router();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    duration: 0, // Permanent
    checksLimit: 2,
    features: ['2 scans only', 'Basic plagiarism checking', 'Limited AI detection']
  },
  basic_monthly: {
    name: 'Basic Plan (Monthly)',
    price: 39900, // ₹399 in paise
    duration: 1, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support']
  },
  basic_yearly: {
    name: 'Basic Plan (Yearly)',
    price: 399000, // ₹3990 in paise (₹399 x 10 months - 2 months free)
    duration: 12, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support', '2 months free']
  },
  pro_monthly: {
    name: 'Pro Plan (Monthly)',
    price: 59900, // ₹599 in paise
    duration: 1, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing']
  },
  pro_yearly: {
    name: 'Pro Plan (Yearly)',
    price: 599000, // ₹5990 in paise (₹599 x 10 months - 2 months free)
    duration: 12, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing', '2 months free']
  }
};

// Input validation middleware
const validateCreateOrderInput = (req, res, next) => {
  const { planType } = req.body;
  
  if (!planType) {
    return res.status(400).json({
      error: 'Plan type is required',
      code: 'MISSING_PLAN_TYPE'
    });
  }
  
  if (!SUBSCRIPTION_PLANS[planType]) {
    return res.status(400).json({
      error: 'Invalid plan type',
      code: 'INVALID_PLAN_TYPE',
      availablePlans: Object.keys(SUBSCRIPTION_PLANS)
    });
  }
  
  if (planType === 'free') {
    return res.status(400).json({
      error: 'Free plan does not require payment',
      code: 'FREE_PLAN_NO_PAYMENT'
    });
  }
  
  next();
};

const validatePaymentVerificationInput = (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      error: 'Missing required payment verification parameters',
      code: 'MISSING_PAYMENT_PARAMS',
      required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
    });
  }
  
  next();
};

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST /api/payments/create-order - Create Razorpay order for subscription plans
router.post('/create-order', authenticateUser, validateCreateOrderInput, asyncHandler(async (req, res) => {
  const { planType } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  try {
    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planType];
    
    // Check if user already has an active subscription
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subscriptionError);
      return res.status(500).json({
        error: 'Failed to check subscription status',
        code: 'SUBSCRIPTION_CHECK_FAILED'
      });
    }

    if (existingSubscription) {
      // Check if subscription is still valid
      const now = new Date();
      const periodEnd = new Date(existingSubscription.current_period_end);
      
      if (periodEnd > now) {
        return res.status(400).json({
          error: 'You already have an active subscription',
          code: 'ACTIVE_SUBSCRIPTION_EXISTS',
          subscription: {
            planType: existingSubscription.plan_type,
            expiresAt: existingSubscription.current_period_end
          }
        });
      }
    }

    // Check for pending payments for this user
    const { data: pendingPayment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'created')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentError && paymentError.code !== 'PGRST116') {
      console.error('Error checking pending payments:', paymentError);
      return res.status(500).json({
        error: 'Failed to check payment status',
        code: 'PAYMENT_CHECK_FAILED'
      });
    }

    // If there's a recent pending payment (within 30 minutes), return it
    if (pendingPayment) {
      const paymentAge = Date.now() - new Date(pendingPayment.created_at).getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (paymentAge < thirtyMinutes) {
        return res.json({
          orderId: pendingPayment.razorpay_order_id,
          amount: pendingPayment.amount,
          currency: pendingPayment.currency,
          key: getRazorpayKeyId(),
          subscriptionId: pendingPayment.subscription_id,
          planType: planType,
          planName: plan.name,
          message: 'Using existing pending payment order'
        });
      }
    }

    // Create subscription record first
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + plan.duration);

    const { data: subscription, error: subscriptionCreateError } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_type: planType,
        status: 'pending',
        checks_used: 0,
        checks_limit: plan.checksLimit,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        auto_renewal: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (subscriptionCreateError) {
      console.error('Error creating subscription:', subscriptionCreateError);
      return res.status(500).json({
        error: 'Failed to create subscription record',
        code: 'SUBSCRIPTION_CREATE_FAILED'
      });
    }

    // Create Razorpay order
    const orderData = {
      amount: plan.price,
      currency: process.env.PAYMENT_CURRENCY || 'INR',
      receipt: `sub_${subscription.id}_${Date.now()}`,
      notes: {
        user_id: userId,
        user_email: userEmail,
        subscription_id: subscription.id,
        plan_type: planType,
        plan_name: plan.name
      }
    };

    const orderResult = await createOrder(orderData);

    if (!orderResult.success) {
      // Rollback subscription creation
      await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscription.id);

      return res.status(500).json({
        error: 'Failed to create payment order',
        code: 'ORDER_CREATE_FAILED',
        details: orderResult.error
      });
    }

    // Store payment record in database
    const { data: payment, error: paymentCreateError } = await supabase
      .from('payments')
      .insert([{
        user_id: userId,
        subscription_id: subscription.id,
        razorpay_order_id: orderResult.order.id,
        amount: plan.price,
        currency: orderData.currency,
        status: 'created',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (paymentCreateError) {
      console.error('Error creating payment record:', paymentCreateError);
      
      // Rollback subscription creation
      await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscription.id);

      return res.status(500).json({
        error: 'Failed to create payment record',
        code: 'PAYMENT_RECORD_CREATE_FAILED'
      });
    }

    // Return order data for frontend checkout
    res.status(201).json({
      orderId: orderResult.order.id,
      amount: orderResult.order.amount,
      currency: orderResult.order.currency,
      key: getRazorpayKeyId(),
      subscriptionId: subscription.id,
      planType: planType,
      planName: plan.name,
      receipt: orderResult.order.receipt,
      notes: orderResult.order.notes
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// POST /api/payments/verify-payment - Verify payment signature and update subscription
router.post('/verify-payment', authenticateUser, validatePaymentVerificationInput, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  try {
    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment record not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Check if payment is already verified
    if (payment.status === 'paid' && payment.verified_at) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment: {
          id: payment.id,
          status: payment.status,
          verifiedAt: payment.verified_at
        },
        subscription: {
          id: payment.subscriptions.id,
          status: payment.subscriptions.status,
          planType: payment.subscriptions.plan_type
        }
      });
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isSignatureValid) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      return res.status(400).json({
        error: 'Payment signature verification failed',
        code: 'SIGNATURE_VERIFICATION_FAILED'
      });
    }

    // Get additional payment details from Razorpay
    const paymentDetailsResult = await getPaymentDetails(razorpay_payment_id);
    let paymentMethod = null;
    
    if (paymentDetailsResult.success) {
      paymentMethod = paymentDetailsResult.payment.method;
    }

    // Update payment record with verification details
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        payment_method: paymentMethod,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('Error updating payment record:', paymentUpdateError);
      return res.status(500).json({
        error: 'Failed to update payment record',
        code: 'PAYMENT_UPDATE_FAILED'
      });
    }

    // Activate subscription
    const { error: subscriptionUpdateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        payment_id: payment.id,
        payment_method: paymentMethod,
        auto_renewal: false, // Manual renewal for now
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.subscription_id);

    if (subscriptionUpdateError) {
      console.error('Error updating subscription:', subscriptionUpdateError);
      return res.status(500).json({
        error: 'Failed to activate subscription',
        code: 'SUBSCRIPTION_UPDATE_FAILED'
      });
    }

    // Deactivate any other active subscriptions for this user
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('id', payment.subscription_id);

    // Get updated subscription details
    const { data: updatedSubscription, error: subscriptionFetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', payment.subscription_id)
      .single();

    if (subscriptionFetchError) {
      console.error('Error fetching updated subscription:', subscriptionFetchError);
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      payment: {
        id: payment.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        status: 'paid',
        paymentMethod: paymentMethod,
        verifiedAt: new Date().toISOString()
      },
      subscription: updatedSubscription ? {
        id: updatedSubscription.id,
        planType: updatedSubscription.plan_type,
        status: updatedSubscription.status,
        checksLimit: updatedSubscription.checks_limit,
        checksUsed: updatedSubscription.checks_used,
        currentPeriodStart: updatedSubscription.current_period_start,
        currentPeriodEnd: updatedSubscription.current_period_end,
        autoRenewal: updatedSubscription.auto_renewal
      } : null
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/payments/status/:orderId - Get payment status and subscription details
router.get('/status/:orderId', authenticateUser, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    // Get payment record with subscription details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('razorpay_order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Get current month usage statistics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage data:', usageError);
    }

    // Get total lifetime usage
    const { data: lifetimeUsage, error: lifetimeError } = await supabase
      .from('user_usage')
      .select('lifetime_usage_count')
      .eq('user_id', userId)
      .order('lifetime_usage_count', { ascending: false })
      .limit(1)
      .single();

    if (lifetimeError && lifetimeError.code !== 'PGRST116') {
      console.error('Error fetching lifetime usage:', lifetimeError);
    }

    // Prepare usage statistics
    const usageStats = {
      monthlyUsage: usageData ? usageData.monthly_usage_count : 0,
      lifetimeUsage: lifetimeUsage ? lifetimeUsage.lifetime_usage_count : 0,
      lastScanAt: usageData ? usageData.last_scan_at : null,
      currentMonth: currentMonth
    };

    // Get plan details
    const plan = payment.subscriptions ? SUBSCRIPTION_PLANS[payment.subscriptions.plan_type] : null;

    // Prepare subscription details
    let subscriptionDetails = null;
    if (payment.subscriptions) {
      const subscription = payment.subscriptions;
      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);
      const isActive = subscription.status === 'active' && periodEnd > now;
      
      subscriptionDetails = {
        id: subscription.id,
        planType: subscription.plan_type,
        planName: plan ? plan.name : subscription.plan_type,
        status: subscription.status,
        isActive: isActive,
        checksLimit: subscription.checks_limit,
        checksUsed: subscription.checks_used,
        checksRemaining: Math.max(0, subscription.checks_limit - subscription.checks_used),
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        autoRenewal: subscription.auto_renewal,
        paymentMethod: subscription.payment_method,
        daysRemaining: isActive ? Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)) : 0,
        features: plan ? plan.features : []
      };
    }

    // Prepare payment details
    const paymentDetails = {
      id: payment.id,
      orderId: payment.razorpay_order_id,
      paymentId: payment.razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      verifiedAt: payment.verified_at,
      webhookReceivedAt: payment.webhook_received_at
    };

    res.json({
      success: true,
      payment: paymentDetails,
      subscription: subscriptionDetails,
      usage: usageStats,
      plan: plan
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}));

export default router;
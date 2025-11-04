import express from 'express';
import { supabase } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';
import {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  getRazorpayKeyId,
  getPaymentUrls
} from '../services/razorpayService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';

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

    // Create Razorpay order with short receipt (max 40 chars)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const shortReceipt = `s${subscription.id}_${timestamp}`.slice(0, 40); // Ensure max 40 chars
    
    const orderData = {
      amount: plan.price,
      currency: process.env.PAYMENT_CURRENCY || 'INR',
      receipt: shortReceipt,
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
    console.log('Creating payment record:', {
      user_id: userId,
      subscription_id: subscription.id,
      razorpay_order_id: orderResult.order.id,
      amount: plan.price,
      currency: orderData.currency,
      status: 'created'
    });

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

    if (payment) {
      console.log('Payment record created successfully:', payment.id);
    }

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
    console.log('Payment verification request:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: userId,
      userEmail: req.user.email,
      timestamp: new Date().toISOString()
    });

    // First, try to get payment record with user filter
    let { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions!payments_subscription_id_fkey (*)
      `)
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userId)
      .single();

    // If not found with user filter, try without user filter to debug
    if (paymentError || !payment) {
      console.log('Payment not found with user filter, trying without user filter...');
      
      const { data: anyPayment, error: anyPaymentError } = await supabase
        .from('payments')
        .select(`
          *,
          subscriptions!payments_subscription_id_fkey (*)
        `)
        .eq('razorpay_order_id', razorpay_order_id)
        .single();

      if (anyPaymentError || !anyPayment) {
        console.log('Payment record not found in database at all:', {
          orderId: razorpay_order_id,
          paymentError,
          anyPaymentError
        });
        
        return res.status(404).json({
          error: 'Payment record not found',
          code: 'PAYMENT_NOT_FOUND',
          debug: {
            orderId: razorpay_order_id,
            userId: userId,
            searchedWithUserFilter: true,
            searchedWithoutUserFilter: true,
            paymentError: paymentError?.message,
            anyPaymentError: anyPaymentError?.message,
            suggestion: `Try visiting /api/payments/search/${razorpay_order_id} to check if payment record exists`
          }
        });
      }

      // Payment exists but user doesn't match - check if it's the same email
      if (anyPayment.user_id !== userId) {
        console.log('Payment found but user mismatch, checking email match:', {
          orderId: razorpay_order_id,
          expectedUserId: userId,
          actualUserId: anyPayment.user_id,
          currentUserEmail: req.user.email
        });

        // Get the user who owns the payment record
        const { data: paymentOwner, error: ownerError } = await supabase
          .from('users')
          .select('email')
          .eq('id', anyPayment.user_id)
          .single();

        if (!ownerError && paymentOwner && paymentOwner.email === req.user.email) {
          console.log('Email matches, allowing payment verification for duplicate account');
          // Use the payment found - same email, different user ID (duplicate account scenario)
          payment = anyPayment;
        } else {
          return res.status(403).json({
            error: 'Payment belongs to different user',
            code: 'PAYMENT_USER_MISMATCH',
            debug: {
              orderId: razorpay_order_id,
              expectedUserId: userId,
              actualUserId: anyPayment.user_id,
              emailMatch: paymentOwner?.email === req.user.email
            }
          });
        }
      } else {
        // Use the payment found without user filter
        payment = anyPayment;
      }
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

    // Deactivate any other active subscriptions for this user (use the payment owner's user ID)
    const subscriptionUserId = payment.user_id || userId;
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', subscriptionUserId)
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

// GET /api/payments/config - Get payment configuration for frontend
router.get('/config', (req, res) => {
  try {
    const paymentUrls = getPaymentUrls();
    
    res.json({
      success: true,
      config: {
        currency: process.env.PAYMENT_CURRENCY || 'INR',
        keyId: getRazorpayKeyId(),
        urls: paymentUrls,
        plans: Object.keys(SUBSCRIPTION_PLANS).reduce((acc, key) => {
          if (key !== 'free') { // Don't include free plan in payment config
            acc[key] = {
              name: SUBSCRIPTION_PLANS[key].name,
              price: SUBSCRIPTION_PLANS[key].price,
              duration: SUBSCRIPTION_PLANS[key].duration,
              checksLimit: SUBSCRIPTION_PLANS[key].checksLimit,
              features: SUBSCRIPTION_PLANS[key].features
            };
          }
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error getting payment config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment configuration'
    });
  }
});

// GET /api/payments/test - Test endpoint to verify payments route is working
router.get('/test', (req, res) => {
  res.json({
    message: 'Payments route is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/payments/config',
      'POST /api/payments/create-order',
      'POST /api/payments/verify-payment',
      'GET /api/payments/status/:orderId',
      'GET /api/payments/debug/:orderId'
    ]
  });
});

// GET /api/payments/test-db-relationship - Test database relationship fix
router.get('/test-db-relationship/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    // Test the fixed database relationship query
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions!payments_subscription_id_fkey (*)
      `)
      .eq('razorpay_order_id', orderId)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    res.json({
      success: true,
      message: 'Database relationship query works correctly',
      payment: payment,
      hasSubscription: !!payment.subscriptions
    });

  } catch (error) {
    console.error('Test DB relationship error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// GET /api/payments/search/:orderId - Search for payment record without authentication (temporary debug)
router.get('/search/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    // Search for payment record without user filter
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId);

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        details: error.message
      });
    }

    res.json({
      orderId,
      found: payments.length > 0,
      payments: payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search error',
      details: error.message
    });
  }
}));

// POST /api/payments/verify-payment-by-email - Verify payment by email match (for duplicate account scenarios)
router.post('/verify-payment-by-email', authenticateUser, validatePaymentVerificationInput, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userEmail = req.user.email;

  try {
    console.log('Payment verification by email:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userEmail: userEmail,
      timestamp: new Date().toISOString()
    });

    // Get payment record and check if the email matches
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions!payments_subscription_id_fkey (*),
        users!payments_user_id_fkey (email)
      `)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment record not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Check if the email matches
    if (payment.users.email !== userEmail) {
      return res.status(403).json({
        error: 'Payment belongs to different email address',
        code: 'EMAIL_MISMATCH'
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
        auto_renewal: false,
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

    // Deactivate any other active subscriptions for the payment owner
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', payment.user_id)
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
      message: 'Payment verified and subscription activated successfully (email match)',
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
      } : null,
      note: 'Payment verified using email match due to duplicate account scenario'
    });

  } catch (error) {
    console.error('Payment verification by email error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/payments/debug/:orderId - Debug payment record (temporary)
router.get('/debug/:orderId', authenticateUser, asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    // Get all payment records for this user
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get specific payment record
    const { data: specificPayment, error: specificError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', userId);

    // Get payment record without user filter
    const { data: anyPayment, error: anyError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId);

    res.json({
      debug: true,
      orderId,
      userId,
      allPayments: allPayments || [],
      specificPayment: specificPayment || [],
      anyPayment: anyPayment || [],
      errors: {
        allPaymentsError,
        specificError,
        anyError
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      error: 'Debug error',
      details: error.message
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
        subscriptions!payments_subscription_id_fkey (*)
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


// Download PDF invoice for a payment
router.get('/invoice/:paymentId/pdf', authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Get payment details from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions (
          plan_type,
          user_id
        )
      `)
      .eq('razorpay_payment_id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, school_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(payment, user);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate PDF invoice error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF invoice',
      code: 'PDF_GENERATION_ERROR'
    });
  }
});

// Get invoice for a payment (HTML version)
router.get('/invoice/:paymentId', authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Get payment details from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        subscriptions (
          plan_type,
          user_id
        )
      `)
      .eq('razorpay_payment_id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    try {
      // Try to get Razorpay invoice/receipt
      const razorpayPayment = await getPaymentDetails(paymentId);
      
      if (razorpayPayment && razorpayPayment.invoice_id) {
        // If Razorpay has an invoice, redirect to it
        return res.redirect(razorpayPayment.invoice_url || `https://dashboard.razorpay.com/app/invoices/${razorpayPayment.invoice_id}`);
      }
    } catch (razorpayError) {
      console.log('Razorpay invoice not available, generating custom invoice');
    }

    // Generate custom invoice HTML
    const planNames = {
      'basic_monthly': 'Basic Plan (Monthly)',
      'basic_yearly': 'Basic Plan (Yearly)', 
      'pro_monthly': 'Pro Plan (Monthly)',
      'pro_yearly': 'Pro Plan (Yearly)'
    };

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - PlagiaSure</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .invoice-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #2D4B7C 0%, #3282B8 50%, #3AB795 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        .logo { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        .invoice-title { 
            font-size: 24px; 
            margin: 10px 0;
            position: relative;
            z-index: 1;
        }
        .content { 
            padding: 40px; 
        }
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .company-info, .invoice-details {
            background: #f8f9fa;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #3282B8;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2D4B7C;
            margin-bottom: 16px;
        }
        .details-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .details-table th { 
            background: linear-gradient(135deg, #3282B8, #3AB795);
            color: white; 
            padding: 16px; 
            text-align: left;
            font-weight: 600;
        }
        .details-table td { 
            padding: 16px; 
            border-bottom: 1px solid #e9ecef;
        }
        .details-table tr:last-child td {
            border-bottom: none;
        }
        .details-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .amount { 
            font-size: 24px; 
            font-weight: bold; 
            color: #52DE97;
        }
        .status { 
            display: inline-block;
            padding: 8px 16px;
            background: #d4edda;
            color: #155724;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding: 30px;
            background: #f8f9fa;
            border-radius: 12px;
            color: #666;
        }
        .footer h3 {
            color: #2D4B7C;
            margin-bottom: 16px;
        }
        @media print {
            body { background: white; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">🔍 PlagiaSure</div>
            <div class="invoice-title">Payment Invoice</div>
            <p style="margin: 0; opacity: 0.9;">Advanced AI & Plagiarism Detection Platform</p>
        </div>
        
        <div class="content">
            <div class="invoice-info">
                <div class="company-info">
                    <div class="section-title">From</div>
                    <p><strong>PlagiaSure</strong></p>
                    <p>AI Detection Suite</p>
                    <p>Advanced Plagiarism Detection</p>
                    <p>Email: support@plagiasure.com</p>
                </div>
                
                <div class="invoice-details">
                    <div class="section-title">Invoice Details</div>
                    <p><strong>Invoice Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                    <p><strong>Payment ID:</strong> ${payment.razorpay_payment_id}</p>
                    <p><strong>Order ID:</strong> ${payment.razorpay_order_id}</p>
                    <p><strong>Status:</strong> <span class="status">Paid</span></p>
                </div>
            </div>
            
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Plan Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${planNames[payment.subscriptions?.plan_type] || 'Subscription Plan'}</strong>
                            <br>
                            <small style="color: #666;">Premium AI & Plagiarism Detection Service</small>
                        </td>
                        <td>${payment.subscriptions?.plan_type || 'N/A'}</td>
                        <td class="amount">₹${(payment.amount / 100).toFixed(0)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                <p style="margin: 0; font-size: 18px;"><strong>Total Amount: <span class="amount">₹${(payment.amount / 100).toFixed(0)}</span></strong></p>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">Amount paid via ${payment.payment_method || 'Razorpay'}</p>
            </div>
        </div>
        
        <div class="footer">
            <h3>Thank you for choosing PlagiaSure!</h3>
            <p>This invoice was generated automatically. For any queries, please contact our support team.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Generated on ${new Date().toLocaleString()} | PlagiaSure - Advanced AI Detection Platform
            </p>
        </div>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.html"`);
    res.send(invoiceHTML);

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      error: 'Failed to generate invoice',
      code: 'INVOICE_ERROR'
    });
  }
});

export default router;
import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../server.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription plans
const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 2999, // $29.99 in cents
    checks_per_month: 100,
    stripe_price_id: 'price_basic_monthly' // Replace with actual Stripe price ID
  },
  pro: {
    name: 'Pro Plan',
    price: 4999, // $49.99 in cents
    checks_per_month: 500,
    stripe_price_id: 'price_pro_monthly' // Replace with actual Stripe price ID
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 9999, // $99.99 in cents
    checks_per_month: -1, // Unlimited
    stripe_price_id: 'price_enterprise_monthly' // Replace with actual Stripe price ID
  }
};

// Create subscription
router.post('/subscribe', authenticateUser, async (req, res) => {
  try {
    const { planType, paymentMethodId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Create or get Stripe customer
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PLANS[planType].stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          checks_used: 0,
          checks_limit: PLANS[planType].checks_per_month,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database subscription error:', dbError);
      // Cancel the Stripe subscription if DB save fails
      await stripe.subscriptions.del(subscription.id);
      return res.status(500).json({ error: 'Failed to create subscription' });
    }

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: dbSubscription,
      client_secret: subscription.latest_invoice.payment_intent.client_secret
    });

  } catch (error) {
    console.error('Subscription error:', error);
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
        message: 'No active subscription found'
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    const isActive = subscription.status === 'active' && periodEnd > now;

    res.json({
      hasSubscription: true,
      subscription: {
        ...subscription,
        isActive,
        daysRemaining: isActive ? Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24)) : 0
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

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

    // Cancel subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription status' });
    }

    res.json({
      message: 'Subscription canceled successfully',
      subscription: {
        ...subscription,
        status: 'canceled',
        will_end_at: new Date(canceledSubscription.current_period_end * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook helper functions
async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      last_payment_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      last_payment_failed_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handleSubscriptionUpdated(subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
}

export default router;
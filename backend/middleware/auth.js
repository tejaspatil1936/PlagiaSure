import { supabase } from '../server.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Subscription check error:', error);
      return res.status(500).json({ error: 'Failed to check subscription' });
    }

    if (!subscription) {
      return res.status(403).json({ 
        error: 'Active subscription required',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    if (periodEnd <= now) {
      return res.status(403).json({ 
        error: 'Subscription has expired',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Check usage limits (if not unlimited)
    if (subscription.checks_limit > 0 && subscription.checks_used >= subscription.checks_limit) {
      return res.status(403).json({ 
        error: 'Monthly check limit exceeded',
        code: 'LIMIT_EXCEEDED',
        checksUsed: subscription.checks_used,
        checksLimit: subscription.checks_limit
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    next();

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Subscription check failed' });
  }
};

export const incrementUsage = async (userId) => {
  try {
    // Increment checks_used for the user's active subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        checks_used: supabase.sql`checks_used + 1`,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Usage increment error:', error);
    }
  } catch (error) {
    console.error('Usage increment error:', error);
  }
};
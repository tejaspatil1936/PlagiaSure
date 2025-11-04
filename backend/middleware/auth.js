import { supabase } from '../server.js';
import { checkUsageLimits, incrementUsageCount } from '../services/usageService.js';

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

export const checkAdminRole = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user profile to check admin status
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Admin check error:', error);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    if (!user || (!user.is_admin && user.role !== 'admin')) {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

/**
 * Middleware to check if user has exceeded their usage limits
 * This should be applied to routes that consume user's scan quota
 */
export const checkUsageLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check usage limits
    const limitCheck = await checkUsageLimits(userId);

    if (limitCheck.limitExceeded) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        message: limitCheck.message,
        limitType: limitCheck.limitType,
        currentUsage: limitCheck.currentUsage,
        limit: limitCheck.limit,
        upgradeRequired: limitCheck.limitType === 'lifetime' || 
                        (limitCheck.planType && limitCheck.planType.includes('basic'))
      });
    }

    // Store limit check result in request for later use
    req.usageLimitCheck = limitCheck;
    next();

  } catch (error) {
    console.error('Usage limit check error:', error);
    res.status(500).json({ 
      error: 'Failed to check usage limits',
      message: 'Unable to verify your usage limits. Please try again.'
    });
  }
};

/**
 * Middleware to increment usage count after successful scan
 * This should be called after a successful plagiarism/AI check
 */
export const incrementUsageAfterScan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Increment usage count
    const updatedUsage = await incrementUsageCount(userId);

    if (!updatedUsage) {
      console.error('Failed to increment usage count for user:', userId);
      // Don't fail the request, just log the error
    }

    // Store updated usage in request for response
    req.updatedUsage = updatedUsage;
    next();

  } catch (error) {
    console.error('Usage increment error:', error);
    // Don't fail the request, just log the error
    next();
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
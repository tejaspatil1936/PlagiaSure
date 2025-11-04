import { supabase, supabaseAdmin } from '../server.js';

/**
 * Get user's current subscription details
 * @param {string} userId - User ID
 * @returns {Object|null} Subscription object or null if no active subscription
 */
export const getUserSubscription = async (userId) => {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get subscription error:', error);
      return null;
    }

    // Check if subscription is still valid (not expired)
    if (subscription && subscription.current_period_end) {
      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);
      
      if (periodEnd <= now) {
        // Subscription has expired
        return null;
      }
    }

    return subscription;
  } catch (error) {
    console.error('Get user subscription error:', error);
    return null;
  }
};

/**
 * Get user's total lifetime usage count
 * @param {string} userId - User ID
 * @returns {number} Total lifetime usage count
 */
export const getTotalUsageCount = async (userId) => {
  try {
    const { data: usage, error } = await supabaseAdmin
      .from('user_usage')
      .select('lifetime_usage_count')
      .eq('user_id', userId)
      .order('lifetime_usage_count', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get total usage error:', error);
      return 0;
    }

    return usage ? usage.lifetime_usage_count : 0;
  } catch (error) {
    console.error('Get total usage count error:', error);
    return 0;
  }
};

/**
 * Get user's monthly usage count for current month
 * @param {string} userId - User ID
 * @returns {number} Monthly usage count for current month
 */
export const getMonthlyUsageCount = async (userId) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const { data: usage, error } = await supabaseAdmin
      .from('user_usage')
      .select('monthly_usage_count')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get monthly usage error:', error);
      return 0;
    }

    return usage ? usage.monthly_usage_count : 0;
  } catch (error) {
    console.error('Get monthly usage count error:', error);
    return 0;
  }
};

/**
 * Increment user's usage count (both monthly and lifetime)
 * @param {string} userId - User ID
 * @returns {Object|null} Updated usage record or null if failed
 */
export const incrementUsageCount = async (userId) => {
  try {
    // Use the database function to increment usage
    const { data, error } = await supabaseAdmin
      .rpc('increment_usage_count', { p_user_id: userId });

    if (error) {
      console.error('Increment usage error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Increment usage count error:', error);
    return null;
  }
};

/**
 * Get or create monthly usage record for current month
 * @param {string} userId - User ID
 * @returns {Object|null} Usage record or null if failed
 */
export const getOrCreateMonthlyUsage = async (userId) => {
  try {
    // Use the database function to get or create monthly usage
    const { data, error } = await supabaseAdmin
      .rpc('get_or_create_monthly_usage', { p_user_id: userId });

    if (error) {
      console.error('Get or create monthly usage error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get or create monthly usage error:', error);
    return null;
  }
};

/**
 * Get user's usage statistics including current month and lifetime counts
 * @param {string} userId - User ID
 * @returns {Object} Usage statistics object
 */
export const getUserUsageStats = async (userId) => {
  try {
    const [subscription, monthlyUsage, totalUsage] = await Promise.all([
      getUserSubscription(userId),
      getMonthlyUsageCount(userId),
      getTotalUsageCount(userId)
    ]);

    return {
      subscription,
      monthlyUsage,
      totalUsage,
      hasActiveSubscription: !!subscription,
      isFreeUser: !subscription
    };
  } catch (error) {
    console.error('Get user usage stats error:', error);
    return {
      subscription: null,
      monthlyUsage: 0,
      totalUsage: 0,
      hasActiveSubscription: false,
      isFreeUser: true
    };
  }
};

/**
 * Check if user has exceeded their usage limits
 * @param {string} userId - User ID
 * @returns {Object} Usage limit check result
 */
export const checkUsageLimits = async (userId) => {
  try {
    const stats = await getUserUsageStats(userId);
    
    if (stats.isFreeUser) {
      // Free users are limited to 2 scans total (lifetime limit)
      const limitExceeded = stats.totalUsage >= 2;
      return {
        limitExceeded,
        limitType: 'lifetime',
        currentUsage: stats.totalUsage,
        limit: 2,
        message: limitExceeded 
          ? 'Free users are limited to 2 scans. Please upgrade to continue.'
          : `You have ${2 - stats.totalUsage} scans remaining.`
      };
    } else {
      // Paid users have monthly limits based on their plan
      const plan = stats.subscription;
      const monthlyLimit = plan.checks_limit;
      const limitExceeded = stats.monthlyUsage >= monthlyLimit;
      
      return {
        limitExceeded,
        limitType: 'monthly',
        currentUsage: stats.monthlyUsage,
        limit: monthlyLimit,
        planType: plan.plan_type,
        message: limitExceeded 
          ? `You have reached your monthly limit of ${monthlyLimit} reports.`
          : `You have ${monthlyLimit - stats.monthlyUsage} reports remaining this month.`
      };
    }
  } catch (error) {
    console.error('Check usage limits error:', error);
    return {
      limitExceeded: true,
      limitType: 'error',
      currentUsage: 0,
      limit: 0,
      message: 'Unable to check usage limits. Please try again.'
    };
  }
};
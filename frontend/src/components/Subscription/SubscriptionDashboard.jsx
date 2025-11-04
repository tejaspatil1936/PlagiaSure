import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Calendar, 
  BarChart3, 
  CreditCard, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { billingAPI, paymentAPI } from '../../services/api';

const SubscriptionDashboard = ({ onUpgrade, onManagePayment }) => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load subscription status and usage data
      const statusResponse = await billingAPI.getStatus();
      const data = statusResponse.data;
      
      setSubscription(data.subscription);
      setUsage(data.usage);
      
      // Load payment history if user has payments
      if (data.subscription?.payment_id) {
        try {
          // This would need to be implemented in the backend
          // For now, we'll show mock data structure
          setPaymentHistory([]);
        } catch (paymentError) {
          console.warn('Could not load payment history:', paymentError);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayName = (planType) => {
    const planNames = {
      'free': 'Free Plan',
      'basic_monthly': 'Basic Plan (Monthly)',
      'basic_yearly': 'Basic Plan (Yearly)',
      'pro_monthly': 'Pro Plan (Monthly)',
      'pro_yearly': 'Pro Plan (Yearly)'
    };
    return planNames[planType] || planType;
  };

  const getUsagePercentage = () => {
    if (!usage || !subscription) return 0;
    if (subscription.checks_limit === -1) return 0; // Unlimited
    return Math.min((usage.monthly_usage / subscription.checks_limit) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
      case 'expired':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isFreePlan = !subscription || subscription.plan_type === 'free';
  const isBasicPlan = subscription?.plan_type?.includes('basic');
  const isProPlan = subscription?.plan_type?.includes('pro');

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Crown className="h-6 w-6 mr-2 text-indigo-600" />
              Current Plan
            </h2>
            {subscription?.status && (
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1",
                getStatusColor(subscription.status)
              )}>
                {getStatusIcon(subscription.status)}
                <span className="capitalize">{subscription.status}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {subscription ? getPlanDisplayName(subscription.plan_type) : 'Free Plan'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isFreePlan && 'Limited features with 2 scans total'}
                  {isBasicPlan && '50 reports per month with basic features'}
                  {isProPlan && '200 reports per month with advanced features'}
                </p>
              </div>

              {subscription?.current_period_end && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {subscription.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              )}
            </div>

            {/* Usage Statistics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Usage This Month</span>
                  <span className="text-sm text-gray-500">
                    {usage?.monthly_usage || 0} / {subscription?.checks_limit === -1 ? '∞' : (subscription?.checks_limit || 2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      getUsagePercentage() > 80 ? "bg-red-500" : 
                      getUsagePercentage() > 60 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
              </div>

              {usage?.lifetime_usage !== undefined && (
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Total scans: {usage.lifetime_usage}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isFreePlan && (
                <button
                  onClick={() => onUpgrade?.()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  <span>Upgrade Plan</span>
                </button>
              )}

              {isBasicPlan && (
                <button
                  onClick={() => onUpgrade?.()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  <span>Upgrade to Pro</span>
                </button>
              )}

              {subscription?.status === 'active' && (
                <button
                  onClick={() => onManagePayment?.()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Manage Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-700">Feature</th>
                  <th className="text-center py-2 font-medium text-gray-700">Free</th>
                  <th className="text-center py-2 font-medium text-gray-700">Basic</th>
                  <th className="text-center py-2 font-medium text-gray-700">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 text-gray-600">Monthly Reports</td>
                  <td className="text-center py-3">2 total</td>
                  <td className="text-center py-3">50</td>
                  <td className="text-center py-3">200</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">AI Detection</td>
                  <td className="text-center py-3">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓ Advanced</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Detailed Reports</td>
                  <td className="text-center py-3">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Priority Support</td>
                  <td className="text-center py-3">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="text-center py-3">Email</td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓ Priority</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Batch Processing</td>
                  <td className="text-center py-3">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-red-500">✗</span>
                  </td>
                  <td className="text-center py-3">
                    <span className="text-green-500">✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {subscription?.status === 'active' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{payment.amount}</p>
                      <p className={cn(
                        "text-sm",
                        payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment history available</p>
                <p className="text-sm">Payment history will appear here after your first transaction</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
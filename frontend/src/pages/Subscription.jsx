import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import { PaymentModal } from '../components/Payment';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Check,
  X,
  Crown,
  Zap,
  Shield
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [statusRes, plansRes] = await Promise.allSettled([
        billingAPI.getStatus(),
        billingAPI.getPlans()
      ]);

      if (statusRes.status === 'fulfilled') {
        setSubscription(statusRes.value.data.subscription);
      }

      if (plansRes.status === 'fulfilled') {
        setPlans(plansRes.value.data.plans);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setPaymentSuccess(true);
    setShowPaymentModal(false);
    
    // Reload subscription data after successful payment
    setTimeout(() => {
      loadSubscriptionData();
      setPaymentSuccess(false);
    }, 2000);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setError(error.message || 'Payment failed. Please try again.');
    setShowPaymentModal(false);
  };

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel your subscription request?')) {
      return;
    }

    try {
      await billingAPI.cancelRequest();
      loadSubscriptionData();
    } catch (error) {
      console.error('Cancel failed:', error);
      setError('Failed to cancel request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'cancelled':
        return <X className="h-6 w-6 text-gray-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your PlagiaSure subscription and access to premium features
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription ? (
        <div className={cn("rounded-lg border p-6", getStatusColor(subscription.status))}>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {getStatusIcon(subscription.status)}
              <div className="ml-4">
                <h2 className="text-lg font-medium">
                  {subscription.status === 'active' && 'Active Subscription'}
                  {subscription.status === 'pending' && 'Subscription Request Pending'}
                  {subscription.status === 'rejected' && 'Subscription Request Rejected'}
                  {subscription.status === 'cancelled' && 'Subscription Cancelled'}
                </h2>
                <p className="text-sm opacity-75">
                  {subscription.plan && `${subscription.plan.name} - ${subscription.plan.price}`}
                </p>
              </div>
            </div>
            
            {subscription.status === 'pending' && (
              <button
                onClick={handleCancelRequest}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancel Request
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscription.status === 'active' && (
              <>
                <div>
                  <p className="text-sm font-medium opacity-75">Usage</p>
                  <p className="text-lg font-semibold">
                    {subscription.checks_used} / {subscription.checks_limit === -1 ? '∞' : subscription.checks_limit}
                  </p>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <p className="text-sm font-medium opacity-75">Renewal Date</p>
                    <p className="text-lg font-semibold">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                )}
                {subscription.daysRemaining && (
                  <div>
                    <p className="text-sm font-medium opacity-75">Days Remaining</p>
                    <p className="text-lg font-semibold">
                      {subscription.daysRemaining} days
                    </p>
                  </div>
                )}
              </>
            )}
            
            {subscription.status === 'pending' && (
              <div className="md:col-span-3">
                <p className="text-sm opacity-75">
                  Your subscription request is being reviewed by an administrator. 
                  You will be notified once it's approved.
                </p>
                {subscription.request_message && (
                  <div className="mt-2">
                    <p className="text-sm font-medium opacity-75">Your Message:</p>
                    <p className="text-sm opacity-75 italic">"{subscription.request_message}"</p>
                  </div>
                )}
              </div>
            )}
            
            {subscription.status === 'rejected' && subscription.rejection_reason && (
              <div className="md:col-span-3">
                <p className="text-sm font-medium opacity-75">Rejection Reason:</p>
                <p className="text-sm opacity-75">{subscription.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          <p>You don't have an active subscription. Choose a plan below to get started.</p>
        </div>
      )}

      {/* Payment Success Message */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Payment successful! Your subscription has been activated.
        </div>
      )}

      {/* Available Plans */}
      {(!subscription || subscription.status === 'rejected') && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
          
          {/* Plan Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md shadow-sm">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500">
                Yearly (Save 17%)
              </button>
            </div>
          </div>

          <PricingPlans onSelectPlan={handleUpgrade} />
        </div>
      )}

      {/* Upgrade Option for Active Users */}
      {subscription && subscription.status === 'active' && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Crown className="h-5 w-5 text-indigo-500 mr-2" />
                Upgrade Your Plan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Get more features and higher limits with our premium plans
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
};

const PricingPlans = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Updated plan structure with new pricing
  const planStructure = {
    free: {
      name: 'Free Plan',
      price: { monthly: 0, yearly: 0 },
      priceDisplay: { monthly: 'Free', yearly: 'Free' },
      features: ['2 scans only', 'Basic plagiarism checking', 'Limited AI detection'],
      restrictions: ['Watermarked reports', 'No export options', 'Basic support only'],
      popular: false,
      icon: Shield
    },
    basic: {
      name: 'Basic Plan',
      price: { monthly: 399, yearly: 3990 },
      priceDisplay: { monthly: '₹399/month', yearly: '₹3,990/year' },
      originalPrice: { yearly: 4788 },
      features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support', 'Report history access'],
      yearlyBonus: '2 months free',
      popular: false,
      icon: Check
    },
    pro: {
      name: 'Pro Plan',
      price: { monthly: 599, yearly: 5990 },
      priceDisplay: { monthly: '₹599/month', yearly: '₹5,990/year' },
      originalPrice: { yearly: 7188 },
      features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing', 'Full export options'],
      yearlyBonus: '2 months free',
      popular: true,
      icon: Crown
    }
  };

  return (
    <div>
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              billingCycle === 'monthly'
                ? "text-indigo-600 bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              billingCycle === 'yearly'
                ? "text-indigo-600 bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(planStructure).map(([planKey, plan]) => {
          const IconComponent = plan.icon;
          const isYearly = billingCycle === 'yearly';
          const currentPrice = plan.price[billingCycle];
          const originalPrice = plan.originalPrice?.[billingCycle];

          return (
            <div
              key={planKey}
              className={cn(
                "relative rounded-lg border-2 p-6 transition-all",
                plan.popular
                  ? "border-indigo-500 shadow-lg ring-2 ring-indigo-500 ring-opacity-20"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isYearly && plan.yearlyBonus && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                    {plan.yearlyBonus}
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-full",
                    plan.popular ? "bg-indigo-100" : "bg-gray-100"
                  )}>
                    <IconComponent className={cn(
                      "h-6 w-6",
                      plan.popular ? "text-indigo-600" : "text-gray-600"
                    )} />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                
                <div className="mt-4">
                  {currentPrice === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">₹{currentPrice}</span>
                      {originalPrice && originalPrice > currentPrice && (
                        <span className="ml-2 text-lg text-gray-500 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {isYearly ? 'per year' : 'per month'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.restrictions && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {plan.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-500">
                        <X className="h-3 w-3 text-red-400 mr-2 flex-shrink-0" />
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => planKey !== 'free' && onSelectPlan()}
                disabled={planKey === 'free'}
                className={cn(
                  "mt-8 w-full py-3 px-4 rounded-md text-sm font-medium transition-colors",
                  planKey === 'free'
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                )}
              >
                {planKey === 'free' ? 'Current Plan' : 'Get Started'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Features
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900">
                  Free
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900">
                  Basic
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">Monthly Reports</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">2 total</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">50</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">200</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">AI Detection</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Limited</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Basic</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Advanced</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">Export Options</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">❌</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Limited</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Full (PDF, Word)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">Batch Processing</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">❌</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">❌</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">✅</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">Support</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Basic</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Email</td>
                <td className="border border-gray-200 px-4 py-3 text-center text-sm">Priority</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
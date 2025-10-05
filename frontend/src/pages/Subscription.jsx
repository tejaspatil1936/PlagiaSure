import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

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

  const handleRequestSubscription = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setError('');

    try {
      await billingAPI.requestSubscription({
        planType: selectedPlan,
        message: requestMessage
      });

      setShowRequestModal(false);
      setSelectedPlan('');
      setRequestMessage('');
      
      // Reload subscription data
      loadSubscriptionData();
    } catch (error) {
      console.error('Request failed:', error);
      setError(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
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

      {/* Available Plans */}
      {(!subscription || subscription.status === 'rejected') && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([planKey, plan]) => (
              <PlanCard
                key={planKey}
                planKey={planKey}
                plan={plan}
                onSelect={() => {
                  setSelectedPlan(planKey);
                  setShowRequestModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request {plans[selectedPlan]?.name}
              </h3>
              <form onSubmit={handleRequestSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Administrator (Optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Tell us why you need this subscription..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Plan Details:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plans[selectedPlan]?.features?.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requesting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {requesting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlanCard = ({ planKey, plan, onSelect }) => {
  const isPopular = planKey === 'pro';

  return (
    <div className={cn(
      "relative rounded-lg border p-6",
      isPopular 
        ? "border-indigo-500 shadow-lg" 
        : "border-gray-200"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{plan.price}</p>
        <p className="text-sm text-gray-500">per month</p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features?.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={cn(
          "mt-8 w-full py-2 px-4 rounded-md text-sm font-medium",
          isPopular
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}
      >
        Request This Plan
      </button>
    </div>
  );
};

export default Subscription;
import React from 'react';
import { X, AlertTriangle, Crown, ArrowUpCircle, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const UsageLimitModal = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  limitType = 'monthly', // 'monthly' or 'lifetime'
  currentUsage = 0,
  limit = 0,
  planType = 'free',
  upgradeRequired = true 
}) => {
  if (!isOpen) return null;

  const isFreePlan = planType === 'free';
  const isBasicPlan = planType.includes('basic');
  
  const getTitle = () => {
    if (limitType === 'lifetime' && isFreePlan) {
      return 'Free Plan Limit Reached';
    }
    return 'Monthly Limit Reached';
  };

  const getMessage = () => {
    if (limitType === 'lifetime' && isFreePlan) {
      return `You've used all ${limit} scans available in the free plan. Upgrade to continue checking your documents for plagiarism and AI content.`;
    }
    return `You've reached your monthly limit of ${limit} reports. ${upgradeRequired ? 'Upgrade your plan to get more reports.' : 'Your limit will reset next month.'}`;
  };

  const getUpgradeOptions = () => {
    if (isFreePlan) {
      return [
        {
          name: 'Basic Plan',
          price: '₹399/month',
          features: ['50 reports per month', 'Basic AI detection', 'Email support'],
          recommended: false
        },
        {
          name: 'Pro Plan',
          price: '₹599/month',
          features: ['200 reports per month', 'Advanced AI detection', 'Priority support', 'Batch processing'],
          recommended: true
        }
      ];
    } else if (isBasicPlan) {
      return [
        {
          name: 'Pro Plan',
          price: '₹599/month',
          features: ['200 reports per month', 'Advanced AI detection', 'Priority support', 'Batch processing'],
          recommended: true
        }
      ];
    }
    return [];
  };

  const upgradeOptions = getUpgradeOptions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Usage Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Usage</span>
              <span className="text-sm text-gray-500">{currentUsage} / {limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 bg-red-500 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex items-center mt-2 text-sm text-red-600">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span>Limit exceeded</span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">{getMessage()}</p>
          </div>

          {/* Upgrade Options */}
          {upgradeRequired && upgradeOptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-indigo-600" />
                Upgrade Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgradeOptions.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "border rounded-lg p-4 relative",
                      option.recommended
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    )}
                  >
                    {option.recommended && (
                      <div className="absolute -top-2 left-4">
                        <span className="bg-indigo-500 text-white px-2 py-1 text-xs font-medium rounded">
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                      <p className="text-2xl font-bold text-indigo-600">{option.price}</p>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {option.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => onUpgrade?.(option.name.toLowerCase().includes('basic') ? 'basic' : 'pro')}
                      className={cn(
                        "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
                        option.recommended
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      )}
                    >
                      Choose {option.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
            {upgradeRequired && (
              <button
                onClick={() => onUpgrade?.()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center space-x-2"
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span>Upgrade Now</span>
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Why upgrade?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Get more reports to check all your documents</li>
                  <li>• Access advanced AI detection features</li>
                  <li>• Receive priority customer support</li>
                  <li>• Export reports in multiple formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
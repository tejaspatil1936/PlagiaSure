import React from 'react';
import { AlertTriangle, BarChart3, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

const UsageNotification = ({ 
  currentUsage = 0, 
  limit = 0, 
  planType = 'free',
  onUpgrade,
  className = ''
}) => {
  const isFreePlan = planType === 'free';
  const usagePercentage = limit > 0 ? Math.min((currentUsage / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - currentUsage, 0);
  
  // Don't show notification if usage is low
  if (usagePercentage < 70) {
    return null;
  }

  const getNotificationLevel = () => {
    if (usagePercentage >= 100) return 'critical';
    if (usagePercentage >= 90) return 'warning';
    return 'info';
  };

  const getNotificationStyles = () => {
    const level = getNotificationLevel();
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getProgressBarColor = () => {
    const level = getNotificationLevel();
    switch (level) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getMessage = () => {
    if (usagePercentage >= 100) {
      return isFreePlan 
        ? 'You\'ve used all your free scans. Upgrade to continue.'
        : 'Monthly limit reached. Upgrade for more reports or wait for next month.';
    }
    if (usagePercentage >= 90) {
      return `Only ${remaining} ${remaining === 1 ? 'scan' : 'scans'} remaining this ${isFreePlan ? 'lifetime' : 'month'}.`;
    }
    return `${remaining} ${remaining === 1 ? 'scan' : 'scans'} remaining this ${isFreePlan ? 'lifetime' : 'month'}.`;
  };

  return (
    <div className={cn(
      "rounded-lg border p-4",
      getNotificationStyles(),
      className
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {usagePercentage >= 100 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <BarChart3 className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Usage: {currentUsage} / {limit === -1 ? '∞' : limit}
            </p>
            <span className="text-xs font-medium">
              {usagePercentage.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-3">
            <div
              className={cn("h-2 rounded-full transition-all duration-300", getProgressBarColor())}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          
          <p className="text-sm mb-3">
            {getMessage()}
          </p>
          
          {(usagePercentage >= 90 || (isFreePlan && usagePercentage >= 100)) && onUpgrade && (
            <button
              onClick={onUpgrade}
              className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
            >
              <Crown className="h-4 w-4" />
              <span>
                {isFreePlan ? 'Upgrade to continue' : 'Upgrade for more reports'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageNotification;
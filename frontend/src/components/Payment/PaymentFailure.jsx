import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, CreditCard, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Extract error details from URL params
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');
  const orderId = searchParams.get('order_id');
  const planType = searchParams.get('plan_type');

  const getErrorMessage = (code) => {
    const errorMessages = {
      'PAYMENT_FAILED': 'Your payment could not be processed. Please try again.',
      'INSUFFICIENT_FUNDS': 'Insufficient funds in your account. Please check your balance.',
      'CARD_DECLINED': 'Your card was declined. Please try with a different payment method.',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
      'INVALID_CARD': 'Invalid card details. Please check your card information.',
      'EXPIRED_CARD': 'Your card has expired. Please use a different card.',
      'AUTHENTICATION_FAILED': 'Payment authentication failed. Please try again.',
      'TRANSACTION_TIMEOUT': 'Transaction timed out. Please try again.',
      'BANK_ERROR': 'Bank server error. Please try again later.',
      'CANCELLED_BY_USER': 'Payment was cancelled. You can try again anytime.'
    };
    return errorMessages[code] || 'An unexpected error occurred during payment processing.';
  };

  const getErrorSolution = (code) => {
    const solutions = {
      'PAYMENT_FAILED': 'Try using a different payment method or contact your bank.',
      'INSUFFICIENT_FUNDS': 'Add funds to your account or use a different payment method.',
      'CARD_DECLINED': 'Contact your bank or try with a different card.',
      'NETWORK_ERROR': 'Check your internet connection and try again.',
      'INVALID_CARD': 'Verify your card number, expiry date, and CVV.',
      'EXPIRED_CARD': 'Use a card that hasn\'t expired.',
      'AUTHENTICATION_FAILED': 'Complete the authentication process with your bank.',
      'TRANSACTION_TIMEOUT': 'Try again with a stable internet connection.',
      'BANK_ERROR': 'Wait a few minutes and try again, or contact your bank.',
      'CANCELLED_BY_USER': 'You can restart the payment process anytime.'
    };
    return solutions[code] || 'Please try again or contact our support team for assistance.';
  };

  const handleRetryPayment = () => {
    setRetryAttempts(prev => prev + 1);
    // Navigate back to subscription page to retry payment
    navigate('/subscription');
  };

  const handleContactSupport = () => {
    // In a real app, this might open a support chat or email
    window.open('mailto:support@plagiasure.com?subject=Payment Issue&body=Order ID: ' + orderId, '_blank');
  };

  const getPlanDisplayName = (planType) => {
    const planNames = {
      'basic_monthly': 'Basic Plan (Monthly)',
      'basic_yearly': 'Basic Plan (Yearly)',
      'pro_monthly': 'Pro Plan (Monthly)',
      'pro_yearly': 'Pro Plan (Yearly)'
    };
    return planNames[planType] || planType;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {getErrorMessage(errorCode)}
        </p>

        {/* Error Details (Collapsible) */}
        {(errorCode || orderId) && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
            
            {showDetails && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2 text-sm">
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-xs">{orderId}</span>
                    </div>
                  )}
                  {planType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span>{getPlanDisplayName(planType)}</span>
                    </div>
                  )}
                  {errorCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Code:</span>
                      <span className="font-mono text-xs">{errorCode}</span>
                    </div>
                  )}
                  {errorDescription && (
                    <div className="mt-2">
                      <span className="text-gray-600 block mb-1">Description:</span>
                      <span className="text-xs text-gray-500">{errorDescription}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solution Suggestion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-medium text-blue-900 mb-1">What can you do?</h3>
              <p className="text-sm text-blue-700">
                {getErrorSolution(errorCode)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
            {retryAttempts > 0 && (
              <span className="text-xs opacity-75">({retryAttempts + 1})</span>
            )}
          </button>

          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Choose Different Plan</span>
          </button>

          <button
            onClick={handleContactSupport}
            className="w-full text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Contact Support
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Common Issues Help */}
        <div className="mt-6 text-left">
          <h4 className="font-medium text-gray-900 mb-3">Common Issues:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Check if your card has sufficient balance</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Ensure your card is enabled for online transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Verify card details (number, expiry, CVV)</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Try using a different browser or device</span>
            </li>
          </ul>
        </div>

        {/* Retry Limit Warning */}
        {retryAttempts >= 3 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="text-left">
                <p className="text-sm text-yellow-800">
                  Multiple retry attempts detected. If the issue persists, please contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFailure;
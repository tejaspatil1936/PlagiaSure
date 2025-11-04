import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  // Extract payment details from URL params
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const planType = searchParams.get('plan_type');

  useEffect(() => {
    // Simulate loading payment details
    const loadPaymentDetails = async () => {
      try {
        // In a real implementation, you would fetch payment details from the API
        // For now, we'll use the URL parameters
        setPaymentDetails({
          orderId: orderId || 'order_' + Date.now(),
          paymentId: paymentId || 'pay_' + Date.now(),
          planType: planType || 'pro_monthly',
          amount: planType?.includes('basic') ? (planType.includes('yearly') ? 3990 : 399) : (planType?.includes('yearly') ? 5990 : 599),
          currency: 'INR',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to load payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentDetails();
  }, [orderId, paymentId, planType]);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleDownloadReceipt = () => {
    // Generate a simple receipt
    const receiptData = {
      orderId: paymentDetails?.orderId,
      paymentId: paymentDetails?.paymentId,
      planType: paymentDetails?.planType,
      amount: paymentDetails?.amount,
      currency: paymentDetails?.currency,
      timestamp: paymentDetails?.timestamp,
      status: 'Success'
    };

    const receiptText = `
PAYMENT RECEIPT
===============

Order ID: ${receiptData.orderId}
Payment ID: ${receiptData.paymentId}
Plan: ${receiptData.planType}
Amount: ₹${(receiptData.amount / 100).toFixed(0)}
Currency: ${receiptData.currency}
Date: ${new Date(receiptData.timestamp).toLocaleString()}
Status: ${receiptData.status}

Thank you for your payment!
PlagiaSure Team
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your subscription has been activated successfully. You can now access all premium features.
        </p>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{getPlanDisplayName(paymentDetails.planType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{(paymentDetails.amount / 100).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentDetails.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(paymentDetails.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadReceipt}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Receipt</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/subscription')}
            className="w-full text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
          >
            <span>View Subscription</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Redirecting to dashboard in {countdown} seconds...</p>
          <button
            onClick={() => setCountdown(0)}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Skip countdown
          </button>
        </div>

        {/* Success Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">What's Next?</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Access to premium features
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Higher usage limits
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Priority customer support
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
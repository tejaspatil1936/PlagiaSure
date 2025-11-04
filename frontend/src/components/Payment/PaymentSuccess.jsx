import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Home, Sparkles, Shield, Zap, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { paymentAPI } from '../../services/api';

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

  const handleDownloadReceipt = async () => {
    try {
      // Download PDF invoice from our backend
      if (paymentDetails?.paymentId) {
        const response = await paymentAPI.downloadInvoice(paymentDetails.paymentId);
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${paymentDetails.paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (error) {
      console.error('Failed to download PDF invoice:', error);
    }

    // Fallback: Generate a custom receipt
    const receiptData = {
      orderId: paymentDetails?.orderId,
      paymentId: paymentDetails?.paymentId,
      planType: paymentDetails?.planType,
      amount: paymentDetails?.amount,
      currency: paymentDetails?.currency,
      timestamp: paymentDetails?.timestamp,
      status: 'Success'
    };

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt - PlagiaSure</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #3282B8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #2D4B7C; font-size: 24px; font-weight: bold; }
        .receipt-title { color: #3282B8; font-size: 20px; margin: 10px 0; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { color: #666; }
        .value { font-weight: bold; color: #333; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success { color: #52DE97; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🔍 PlagiaSure</div>
        <div class="receipt-title">Payment Receipt</div>
    </div>
    
    <div class="details">
        <div class="row">
            <span class="label">Order ID:</span>
            <span class="value">${receiptData.orderId}</span>
        </div>
        <div class="row">
            <span class="label">Payment ID:</span>
            <span class="value">${receiptData.paymentId}</span>
        </div>
        <div class="row">
            <span class="label">Plan:</span>
            <span class="value">${getPlanDisplayName(receiptData.planType)}</span>
        </div>
        <div class="row">
            <span class="label">Amount:</span>
            <span class="value">₹${(receiptData.amount / 100).toFixed(0)}</span>
        </div>
        <div class="row">
            <span class="label">Date:</span>
            <span class="value">${new Date(receiptData.timestamp).toLocaleString()}</span>
        </div>
        <div class="row">
            <span class="label">Status:</span>
            <span class="value success">${receiptData.status}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for choosing PlagiaSure!</p>
        <p>Advanced AI & Plagiarism Detection Platform</p>
    </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.orderId}.html`;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-[#52DE97] via-[#3AB795] to-[#3282B8] p-8 text-center overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2D4B7C] rounded-full blur-xl translate-y-12 -translate-x-12 animate-float"></div>
            </div>
            
            <div className="relative z-10">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="bg-white bg-opacity-20 rounded-full p-6 backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                    <CheckCircle className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">Payment Successful!</h1>
              <p className="text-white text-opacity-90 text-lg">
                Welcome to PlagiaSure Premium! 🎉
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Success Message */}
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Your subscription has been activated successfully. You now have access to all premium features and enhanced limits.
              </p>
            </div>

            {/* Payment Details */}
            {paymentDetails && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-[#3282B8] mr-2" />
                  <h3 className="font-bold text-gray-900">Payment Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Plan:</span>
                    <span className="font-bold text-[#3282B8]">{getPlanDisplayName(paymentDetails.planType)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Amount:</span>
                    <span className="font-bold text-[#52DE97] text-lg">₹{(paymentDetails.amount / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Payment ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Date:</span>
                    <span className="font-medium">{new Date(paymentDetails.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Features */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 text-[#52DE97] mr-2" />
                <h4 className="font-bold text-gray-900">Premium Features Unlocked</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-[#52DE97] mr-3" />
                  <span className="text-gray-700">Enhanced AI detection limits</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-[#3282B8] mr-3" />
                  <span className="text-gray-700">Advanced plagiarism analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#3AB795] mr-3" />
                  <span className="text-gray-700">Priority customer support</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleDownloadReceipt}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center space-x-3 font-semibold shadow-md hover:shadow-lg"
              >
                <Download className="h-5 w-5" />
                <span>Download Invoice</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-[#3282B8] to-[#52DE97] text-white py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 font-semibold shadow-lg"
              >
                <Home className="h-5 w-5" />
                <span>Go to Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/subscription')}
                className="w-full text-[#3282B8] py-3 px-6 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-3 font-semibold"
              >
                <span>View Subscription Details</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Auto-redirect Notice */}
            <div className="mt-8 text-center">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">
                  Redirecting to dashboard in <span className="font-bold text-[#3282B8]">{countdown}</span> seconds...
                </p>
                <button
                  onClick={() => setCountdown(0)}
                  className="text-[#3282B8] hover:text-[#2D4B7C] underline text-sm font-medium"
                >
                  Skip countdown
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
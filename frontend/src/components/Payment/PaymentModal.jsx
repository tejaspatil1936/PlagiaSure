import React, { useState, useEffect } from "react";
import { X, Check, CreditCard, Clock, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { createPaymentUrl } from "../../utils/paymentConfig";

const PaymentModal = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, failed

  // Plan configuration matching the backend design
  const SUBSCRIPTION_PLANS = {
    basic_monthly: {
      name: "Basic Plan (Monthly)",
      price: 399,
      originalPrice: 399,
      duration: 1,
      checksLimit: 50,
      features: [
        "50 reports per month",
        "Basic AI detection",
        "Plagiarism checking",
        "Email support",
      ],
      popular: false,
    },
    basic_yearly: {
      name: "Basic Plan (Yearly)",
      price: 3990,
      originalPrice: 4788, // 399 * 12
      duration: 12,
      checksLimit: 50,
      features: [
        "50 reports per month",
        "Basic AI detection",
        "Plagiarism checking",
        "Email support",
        "2 months free",
      ],
      popular: false,
      savings: "17% off",
    },
    pro_monthly: {
      name: "Pro Plan (Monthly)",
      price: 599,
      originalPrice: 599,
      duration: 1,
      checksLimit: 200,
      features: [
        "200 reports per month",
        "Advanced AI detection",
        "Detailed plagiarism reports",
        "Priority support",
        "Batch processing",
      ],
      popular: true,
    },
    pro_yearly: {
      name: "Pro Plan (Yearly)",
      price: 5990,
      originalPrice: 7188, // 599 * 12
      duration: 12,
      checksLimit: 200,
      features: [
        "200 reports per month",
        "Advanced AI detection",
        "Detailed plagiarism reports",
        "Priority support",
        "Batch processing",
        "2 months free",
      ],
      popular: false,
      savings: "17% off",
    },
  };

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedPlan("pro_monthly"); // Default to popular plan
      setError("");
      setPaymentStatus("idle");
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Load Razorpay script when component mounts
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    setLoading(true);
    setError("");
    setPaymentStatus("processing");

    try {
      // Create order on backend
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5001"
        }/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            planType: selectedPlan,
            currency: "INR",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const orderData = await response.json();

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PlagiaSure",
        description: SUBSCRIPTION_PLANS[selectedPlan].name,
        order_id: orderData.orderId,
        prefill: {
          name:
            JSON.parse(localStorage.getItem("user_data") || "{}").name || "",
          email:
            JSON.parse(localStorage.getItem("user_data") || "{}").email || "",
        },
        theme: {
          color: "#4F46E5",
        },
        handler: async (response) => {
          // Payment successful, verify on backend
          await verifyPayment(response);
        },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            setPaymentStatus("idle");

            // Redirect to failure page when user cancels payment
            const failureUrl = await createPaymentUrl("failure", {
              error_code: "CANCELLED_BY_USER",
              error_description: "Payment was cancelled by user",
              order_id: orderData.orderId || "",
              plan_type: selectedPlan,
            });
            window.location.href = failureUrl;
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setError(error.message || "Failed to initiate payment");
      setPaymentStatus("failed");
      setLoading(false);

      // Redirect to failure page for payment initiation errors
      setTimeout(async () => {
        const failureUrl = await createPaymentUrl("failure", {
          error_code: "PAYMENT_FAILED",
          error_description: error.message || "Failed to initiate payment",
          plan_type: selectedPlan,
        });
        window.location.href = failureUrl;
      }, 2000);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const apiUrl = `${baseUrl}/api/payments/verify-payment`;
      console.log("PaymentModal: Attempting to verify payment at:", apiUrl);
      console.log(
        "PaymentModal: Auth token:",
        localStorage.getItem("auth_token") ? "Present" : "Missing"
      );

      const paymentData = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      };

      let response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(paymentData),
      });

      // If regular verification fails with 404 or 403, try email-based verification
      if (
        !response.ok &&
        (response.status === 404 || response.status === 403)
      ) {
        console.log(
          "PaymentModal: Regular verification failed, trying email-based verification..."
        );

        const emailApiUrl = `${baseUrl}/api/payments/verify-payment-by-email`;
        response = await fetch(emailApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(paymentData),
        });
      }

      if (!response.ok) {
        console.log(
          "PaymentModal: Response not OK. Status:",
          response.status,
          "StatusText:",
          response.statusText
        );
        console.log("PaymentModal: Response headers:", [
          ...response.headers.entries(),
        ]);

        let errorData;
        try {
          errorData = await response.json();
          console.log("PaymentModal: Error response body:", errorData);
        } catch (e) {
          console.log("PaymentModal: Could not parse error response as JSON");
          const textResponse = await response.text();
          console.log("PaymentModal: Error response text:", textResponse);
          errorData = { message: textResponse || `HTTP ${response.status}` };
        }

        throw new Error(errorData.message || "Payment verification failed");
      }

      const verificationData = await response.json();

      setPaymentStatus("success");
      setLoading(false);

      // Call success callback and redirect to success page
      onPaymentSuccess?.(verificationData);

      // Redirect to success page with payment details
      setTimeout(async () => {
        const successUrl = await createPaymentUrl("success", {
          order_id: paymentResponse.razorpay_order_id,
          payment_id: paymentResponse.razorpay_payment_id,
          plan_type: selectedPlan,
        });
        window.location.href = successUrl;
      }, 1500);
    } catch (error) {
      console.error("Payment verification failed:", error);
      setError(error.message || "Payment verification failed");
      setPaymentStatus("failed");
      setLoading(false);
      onPaymentFailure?.(error);

      // Redirect to failure page with error details
      setTimeout(async () => {
        const failureUrl = await createPaymentUrl("failure", {
          error_code: "PAYMENT_VERIFICATION_FAILED",
          error_description: error.message || "Payment verification failed",
          order_id: paymentResponse?.razorpay_order_id || "",
          plan_type: selectedPlan,
        });
        window.location.href = failureUrl;
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Payment Status */}
        {paymentStatus === "processing" && (
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            Processing payment...
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <Check className="h-5 w-5 mr-2" />
            Payment successful! Redirecting...
          </div>
        )}

        {/* Plan Selection */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => (
              <PlanCard
                key={planKey}
                planKey={planKey}
                plan={plan}
                selected={selectedPlan === planKey}
                onSelect={() => setSelectedPlan(planKey)}
                disabled={loading}
              />
            ))}
          </div>

          {/* Payment Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handlePayment}
              disabled={!selectedPlan || loading || paymentStatus === "success"}
              className={cn(
                "px-8 py-3 rounded-lg font-medium text-white flex items-center space-x-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                selectedPlan && !loading && paymentStatus !== "success"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400"
              )}
            >
              {loading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : paymentStatus === "success" ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Payment Successful</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>
                    Pay ₹
                    {selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan].price : 0}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Secure payment powered by Razorpay</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ planKey, plan, selected, onSelect, disabled }) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 p-6 cursor-pointer transition-all",
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 hover:border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        plan.popular && "ring-2 ring-indigo-500"
      )}
      onClick={() => !disabled && onSelect()}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {plan.savings && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
            {plan.savings}
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{plan.price}
          </span>
          {plan.originalPrice > plan.price && (
            <span className="ml-2 text-lg text-gray-500 line-through">
              ₹{plan.originalPrice}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {plan.duration === 1 ? "per month" : "per year"}
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {selected && (
        <div className="absolute top-4 right-4">
          <div className="bg-indigo-500 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;

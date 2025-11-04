import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization of Razorpay instance
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

  }
  return razorpay;
};

/**
 * Create a Razorpay order for payment processing
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in paise (smallest currency unit)
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.receipt - Unique receipt identifier
 * @param {Object} orderData.notes - Additional notes for the order
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (orderData) => {
  try {
    const options = {
      amount: orderData.amount, // amount in paise
      currency: orderData.currency || process.env.PAYMENT_CURRENCY || 'INR',
      receipt: orderData.receipt,
      notes: orderData.notes || {},
    };

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create(options);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify payment signature to ensure payment authenticity
 * @param {Object} paymentData - Payment verification data
 * @param {string} paymentData.razorpay_order_id - Razorpay order ID
 * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {string} paymentData.razorpay_signature - Razorpay signature
 * @returns {boolean} True if signature is valid, false otherwise
 */
const verifyPaymentSignature = (paymentData) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = paymentData;

    // Create expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Compare signatures
    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

/**
 * Verify webhook signature to ensure webhook authenticity
 * @param {string} body - Raw webhook body
 * @param {string} signature - Webhook signature from headers
 * @returns {boolean} True if webhook signature is valid, false otherwise
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const getPaymentDetails = async (paymentId) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
const getOrderDetails = async (orderId) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.fetch(orderId);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get Razorpay key ID for frontend integration
 * @returns {string} Razorpay key ID
 */
const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID;
};

/**
 * Get payment URLs dynamically based on environment
 * @returns {Object} Payment URLs object
 */
const getPaymentUrls = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return {
    successUrl: `${frontendUrl}/payment/success`,
    cancelUrl: `${frontendUrl}/payment/cancel`,
    failureUrl: `${frontendUrl}/payment/failure`,
  };
};

export {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentDetails,
  getOrderDetails,
  getRazorpayKeyId,
  getPaymentUrls,
};
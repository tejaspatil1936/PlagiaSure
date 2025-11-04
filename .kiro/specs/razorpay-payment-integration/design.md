# Design Document - Razorpay Payment Integration

## Overview

This document outlines the design for integrating Razorpay payment gateway into the existing plagiarism detection application. The integration will replace the current manual subscription approval system with automated payment processing, enabling users to instantly access premium features upon successful payment.

The design leverages the existing Express.js backend with Supabase database and React frontend, adding Razorpay payment capabilities while maintaining the current application architecture and user experience.

## Architecture

### High-Level Architecture

```
Frontend (React/Vite)
    ↓ Payment Request
Backend (Express.js)
    ↓ Create Order
Razorpay API
    ↓ Payment Processing
User Payment Interface
    ↓ Payment Completion
Backend Webhook/Verification
    ↓ Update Database
Supabase Database
```

### Integration Points

1. **Frontend Integration**: React components for payment initiation and status display
2. **Backend API**: Express.js routes for order creation, payment verification, and webhook handling
3. **Database Integration**: Supabase tables for payment tracking and subscription management
4. **External Service**: Razorpay API for payment processing and verification

## Usage Restrictions and Plan Enforcement

### Plan-Based Access Control
The application will enforce usage limits based on user subscription status:

1. **Free Users (No Subscription)**
   - Limited to 2 scans total (lifetime limit)
   - Basic plagiarism checking only
   - No AI detection features
   - Watermarked reports

2. **Basic Plan Users**
   - 50 reports per month
   - Basic AI detection
   - Full plagiarism checking
   - Email support
   - Report history access

3. **Pro Plan Users**
   - 200 reports per month
   - Advanced AI detection
   - Detailed plagiarism reports
   - Priority support
   - Batch processing capabilities
   - Export options (PDF, Word)

### Usage Tracking Implementation
```javascript
// Middleware to check usage limits
const checkUsageLimit = async (req, res, next) => {
  const userId = req.user.id;
  
  // Get user's current subscription
  const subscription = await getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') {
    // Free user - check lifetime usage
    const totalUsage = await getTotalUsageCount(userId);
    if (totalUsage >= 2) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        message: 'Free users are limited to 2 scans. Please upgrade to continue.',
        upgradeRequired: true
      });
    }
  } else {
    // Paid user - check monthly usage
    const monthlyUsage = await getMonthlyUsageCount(userId);
    const plan = SUBSCRIPTION_PLANS[subscription.plan_type];
    
    if (monthlyUsage >= plan.checksLimit) {
      return res.status(403).json({
        error: 'Monthly limit exceeded',
        message: `You have reached your monthly limit of ${plan.checksLimit} reports.`,
        upgradeRequired: subscription.plan_type.includes('basic')
      });
    }
  }
  
  next();
};
```

## Components and Interfaces

### Backend Components

#### 1. Payment Routes (`/routes/payments.js`)
- **POST /api/payments/create-order**: Creates Razorpay order for subscription plans
- **POST /api/payments/verify-payment**: Verifies payment signature and updates subscription
- **POST /api/payments/webhook**: Handles Razorpay webhook notifications
- **GET /api/payments/status/:orderId**: Retrieves payment status for an order

#### 2. Payment Service (`/services/razorpayService.js`)
- **createOrder()**: Interfaces with Razorpay Orders API
- **verifyPaymentSignature()**: Validates payment authenticity
- **updateSubscriptionStatus()**: Updates user subscription after successful payment
- **handleWebhook()**: Processes Razorpay webhook events

#### 3. Database Schema Extensions

**New Table: `payments`**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in paise
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created', -- created, paid, failed, refunded
  payment_method VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  webhook_received_at TIMESTAMP
);
```

**Updated Table: `subscriptions`**
```sql
-- Add payment-related columns
ALTER TABLE subscriptions 
ADD COLUMN payment_id UUID REFERENCES payments(id),
ADD COLUMN auto_renewal BOOLEAN DEFAULT false,
ADD COLUMN payment_method VARCHAR(100);
```

### Frontend Components

#### 1. Payment Component (`/components/Payment/PaymentModal.jsx`)
- Displays subscription plans with pricing
- Integrates Razorpay checkout interface
- Handles payment success/failure states
- Shows payment confirmation

#### 2. Subscription Management (`/components/Subscription/SubscriptionDashboard.jsx`)
- Displays current subscription status
- Shows payment history
- Provides upgrade/downgrade options
- Handles subscription cancellation

#### 3. Payment Status (`/components/Payment/PaymentStatus.jsx`)
- Shows real-time payment processing status
- Displays payment confirmation details
- Handles payment failure scenarios

### API Interfaces

#### Payment Creation Request
```javascript
POST /api/payments/create-order
{
  "planType": "pro", // basic, pro, enterprise
  "duration": 1, // months
  "currency": "INR"
}
```

#### Payment Creation Response
```javascript
{
  "orderId": "order_xyz123",
  "amount": 4999, // in paise
  "currency": "INR",
  "key": "rzp_test_...", // Razorpay key for frontend
  "subscriptionId": "uuid"
}
```

#### Payment Verification Request
```javascript
POST /api/payments/verify-payment
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

## Data Models

### Payment Model
```javascript
{
  id: "uuid",
  userId: "uuid",
  subscriptionId: "uuid",
  razorpayOrderId: "order_xyz123",
  razorpayPaymentId: "pay_abc456",
  razorpaySignature: "signature_hash",
  amount: 4999, // paise
  currency: "INR",
  status: "paid", // created, paid, failed, refunded
  paymentMethod: "card",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  verifiedAt: "2024-01-01T00:00:00Z",
  webhookReceivedAt: "2024-01-01T00:00:00Z"
}
```

### Enhanced Subscription Model
```javascript
{
  id: "uuid",
  userId: "uuid",
  planType: "pro",
  status: "active", // pending, active, cancelled, expired
  checksUsed: 0,
  checksLimit: 500,
  currentPeriodStart: "2024-01-01T00:00:00Z",
  currentPeriodEnd: "2024-02-01T00:00:00Z",
  paymentId: "uuid", // Reference to payment
  autoRenewal: true,
  paymentMethod: "card",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Error Handling

### Payment Errors
1. **Order Creation Failures**
   - Invalid plan type or amount
   - Razorpay API connectivity issues
   - Database insertion errors

2. **Payment Verification Failures**
   - Invalid signature verification
   - Missing payment parameters
   - Database update failures

3. **Webhook Processing Errors**
   - Signature validation failures
   - Duplicate webhook processing
   - Database consistency issues

### Error Response Format
```javascript
{
  "error": true,
  "message": "Payment verification failed",
  "code": "PAYMENT_VERIFICATION_FAILED",
  "details": {
    "orderId": "order_xyz123",
    "reason": "Invalid signature"
  }
}
```

### Retry Mechanisms
- **Payment Verification**: Retry up to 3 times with exponential backoff
- **Webhook Processing**: Implement idempotency keys to prevent duplicate processing
- **Database Operations**: Use transactions to ensure data consistency

## Testing Strategy

### Unit Tests
1. **Payment Service Tests**
   - Order creation with valid/invalid parameters
   - Payment signature verification
   - Subscription status updates

2. **Route Handler Tests**
   - Authentication middleware integration
   - Request validation
   - Error handling scenarios

### Integration Tests
1. **Razorpay API Integration**
   - Order creation end-to-end flow
   - Payment verification process
   - Webhook handling

2. **Database Integration**
   - Payment record creation and updates
   - Subscription status synchronization
   - Data consistency across tables

### End-to-End Tests
1. **Complete Payment Flow**
   - User selects subscription plan
   - Payment processing through Razorpay
   - Subscription activation
   - Feature access verification

2. **Error Scenarios**
   - Payment failures and user feedback
   - Network connectivity issues
   - Invalid payment attempts

### Test Environment Setup
- Use Razorpay test API keys for all testing
- Implement test data fixtures for consistent testing
- Mock external API calls for unit tests
- Use separate test database for integration tests

## Security Considerations

### API Security
- **Environment Variables**: Store Razorpay credentials securely
- **HTTPS Only**: Enforce HTTPS for all payment-related endpoints
- **Rate Limiting**: Implement rate limiting on payment endpoints
- **Input Validation**: Validate all payment-related inputs

### Payment Security
- **Signature Verification**: Always verify Razorpay signatures
- **Webhook Security**: Validate webhook signatures and implement replay protection
- **PCI Compliance**: Never store sensitive payment information
- **Audit Logging**: Log all payment operations for audit trails

### Data Protection
- **Encryption**: Encrypt sensitive payment data at rest
- **Access Control**: Restrict payment data access to authorized users
- **Data Retention**: Implement appropriate data retention policies
- **GDPR Compliance**: Ensure payment data handling complies with privacy regulations

## Configuration

### Environment Variables
```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RbbEPxt1kZYRUw
RAZORPAY_KEY_SECRET=KKcMzQfrG1WBofPd1GysrD83
RAZORPAY_WEBHOOK_SECRET=webhook_secret_key

# Payment Configuration
PAYMENT_CURRENCY=INR
PAYMENT_SUCCESS_URL=http://localhost:5173/payment/success
PAYMENT_CANCEL_URL=http://localhost:5173/payment/cancel
```

### Plan Configuration
```javascript
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    duration: 0, // Permanent
    checksLimit: 2,
    features: ['2 scans only', 'Basic plagiarism checking', 'Limited AI detection']
  },
  basic_monthly: {
    name: 'Basic Plan (Monthly)',
    price: 39900, // ₹399 in paise
    duration: 1, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support']
  },
  basic_yearly: {
    name: 'Basic Plan (Yearly)',
    price: 399000, // ₹3990 in paise (₹399 x 10 months - 2 months free)
    duration: 12, // months
    checksLimit: 50,
    features: ['50 reports per month', 'Basic AI detection', 'Plagiarism checking', 'Email support', '2 months free']
  },
  pro_monthly: {
    name: 'Pro Plan (Monthly)',
    price: 59900, // ₹599 in paise
    duration: 1, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing']
  },
  pro_yearly: {
    name: 'Pro Plan (Yearly)',
    price: 599000, // ₹5990 in paise (₹599 x 10 months - 2 months free)
    duration: 12, // months
    checksLimit: 200,
    features: ['200 reports per month', 'Advanced AI detection', 'Detailed plagiarism reports', 'Priority support', 'Batch processing', '2 months free']
  }
};
```

## Deployment Considerations

### Production Setup
1. **Environment Configuration**
   - Switch to live Razorpay API keys
   - Configure production webhook URLs
   - Set up proper SSL certificates

2. **Database Migration**
   - Run payment table creation scripts
   - Update existing subscription records
   - Set up database indexes for performance

3. **Monitoring and Logging**
   - Implement payment transaction monitoring
   - Set up alerts for payment failures
   - Configure audit logging for compliance

### Rollback Strategy
1. **Feature Flags**: Implement feature flags to quickly disable payment processing
2. **Database Rollback**: Maintain database migration rollback scripts
3. **Fallback Mechanism**: Keep manual subscription approval as fallback option
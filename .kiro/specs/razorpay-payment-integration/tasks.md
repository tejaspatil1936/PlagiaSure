# Implementation Plan - Razorpay Payment Integration

- [x] 1. Set up Razorpay backend infrastructure

  - Install razorpay npm package in backend
  - Add Razorpay environment variables to backend/.env
  - Create razorpayService.js for payment operations
  - _Requirements: 2.3, 2.4_

- [x] 2. Create database schema for payments

  - [x] 2.1 Create payments table with Razorpay fields

    - Add payments table with order_id, payment_id, signature fields
    - Include amount, currency, status, and timestamp fields
    - Set up foreign key relationships to users and subscriptions
    - _Requirements: 4.1, 4.2_

  - [x] 2.2 Update subscriptions table for payment integration

    - Add payment_id reference column to subscriptions table
    - Add auto_renewal and payment_method columns

    - Update existing subscription records for compatibility
    - _Requirements: 4.1, 4.5_

  - [x] 2.3 Create usage tracking table

    - Add user_usage table to track scan counts per user
    - Include monthly and lifetime usage counters
    - Set up indexes for efficient usage queries
    - _Requirements: 4.3_

- [x] 3. Implement payment API routes

  - [x] 3.1 Create payment routes file

    - Create /routes/payments.js with authentication middleware
    - Implement POST /api/payments/create-order endpoint
    - Add proper error handling and validation
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Implement order creation endpoint

    - Validate plan type and user eligibility

    - Create Razorpay order using Orders API
    - Store order details in payments table
    - Return order data for frontend checkout
    - _Requirements: 1.1, 1.5_

  - [x] 3.3 Implement payment verification endpoint

    - Create POST /api/payments/verify-payment route
    - Verify Razorpay signature using webhook validation
    - Update payment status and subscription on success
    - Handle verification failures gracefully
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [x] 3.4 Add payment status tracking endpoint

    - Create GET /api/payments/status/:orderId route
    - Return current payment and subscription status
    - Include usage statistics in response
    - _Requirements: 3.3, 4.3_

- [x] 4. Update billing routes with new plan structure

  - [x] 4.1 Update plan definitions in billing.js

    - Replace existing PLANS with new pricing structure
    - Add free, basic_monthly, basic_yearly, pro_monthly, pro_yearly plans
    - Include usage limits and feature restrictions
    - _Requirements: 1.1, 5.5_

  - [x] 4.2 Modify subscription request handling

    - Update /api/billing/request-subscription to use new plans
    - Add payment integration for automatic subscription activation
    - Maintain backward compatibility with existing subscriptions
    - _Requirements: 1.1, 5.1, 5.2_

- [x] 5. Implement usage restriction middleware

  - [x] 5.1 Create usage checking middleware

    - Implement checkUsageLimit middleware function
    - Check free user lifetime limits (2 scans max)
    - Validate monthly limits for paid subscribers
    - Return appropriate error messages for limit exceeded
    - _Requirements: 1.4, 4.3_

  - [x] 5.2 Apply usage restrictions to assignment routes

    - Add checkUsageLimit middleware to assignment creation routes
    - Update assignment routes to increment usage counters
    - Implement usage tracking for successful scans
    - _Requirements: 1.4, 4.3_

  - [x] 5.3 Create usage tracking service

    - Implement getUserSubscription() helper function
    - Add getTotalUsageCount() for lifetime usage tracking
    - Create getMonthlyUsageCount() for monthly limit checking
    - Include usage reset logic for monthly cycles
    - _Requirements: 4.3, 4.4_

- [x] 6. Create frontend payment components


  - [x] 6.1 Create payment modal component

    - Build PaymentModal.jsx with plan selection
    - Integrate Razorpay checkout script
    - Handle payment success and failure states
    - Display loading states during payment processing
    - _Requirements: 1.1, 1.2, 3.1_

  - [x] 6.2 Create subscription dashboard component

    - Build SubscriptionDashboard.jsx for current plan display
    - Show usage statistics and remaining scans
    - Add upgrade/downgrade options
    - Display payment history
    - _Requirements: 3.3, 4.3_

  - [x] 6.3 Add usage limit notifications

    - Create UsageLimitModal.jsx for limit exceeded scenarios
    - Show upgrade prompts when limits are reached
    - Display remaining usage counts in UI
    - Add progress bars for usage visualization
    - _Requirements: 1.4, 3.3_

- [ ] 7. Update existing billing components

  - [ ] 7.1 Modify billing page to show new plans

    - Update frontend billing page with new pricing
    - Replace manual subscription request with payment integration
    - Add yearly plan options with discount display
    - Show feature comparison between plans
    - _Requirements: 1.1, 5.3_

  - [ ] 7.2 Add payment success/failure pages
    - Create PaymentSuccess.jsx component
    - Build PaymentFailure.jsx with retry options
    - Add payment confirmation details display
    - Implement automatic redirection after payment
    - _Requirements: 3.1, 3.2_

- [ ] 8. Integrate payment flow with existing authentication

  - [ ] 8.1 Update authentication middleware for payment routes

    - Ensure payment routes use existing authenticateUser middleware
    - Add user context to payment operations
    - Validate user permissions for plan upgrades
    - _Requirements: 2.3, 5.1_

  - [ ] 8.2 Update user profile with subscription info
    - Add subscription status to user profile API
    - Include current plan and usage information
    - Show payment method and renewal date
    - _Requirements: 3.3, 5.2_

- [ ] 9. Add webhook handling for payment notifications

  - [ ] 9.1 Create webhook endpoint

    - Implement POST /api/payments/webhook route
    - Verify webhook signature from Razorpay
    - Handle payment success/failure notifications
    - Update subscription status based on webhook events
    - _Requirements: 2.2, 4.2, 4.4_

  - [ ] 9.2 Implement webhook security
    - Validate webhook signatures using Razorpay secret
    - Add replay attack protection
    - Log webhook events for audit trail
    - Handle duplicate webhook processing
    - _Requirements: 2.1, 2.3, 4.5_

- [ ]\* 10. Add comprehensive error handling and logging

  - [ ]\* 10.1 Implement payment error handling

    - Add specific error codes for payment failures
    - Create user-friendly error messages
    - Implement retry mechanisms for failed payments
    - Log payment errors for debugging
    - _Requirements: 2.5_

  - [ ]\* 10.2 Add audit logging for payments
    - Log all payment operations and status changes
    - Track subscription modifications
    - Monitor usage limit violations
    - Create payment analytics dashboard
    - _Requirements: 4.1, 4.5_

- [ ]\* 11. Testing and validation

  - [ ]\* 11.1 Create payment integration tests

    - Test order creation with valid/invalid plans
    - Verify payment signature validation
    - Test usage limit enforcement
    - Validate subscription activation flow
    - _Requirements: 1.1, 2.1, 2.2_

  - [ ]\* 11.2 Test usage restriction scenarios
    - Verify free user 2-scan limit enforcement
    - Test monthly usage reset functionality
    - Validate plan upgrade/downgrade scenarios
    - Test edge cases and error conditions
    - _Requirements: 1.4, 4.3_

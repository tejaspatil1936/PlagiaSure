import fetch from 'node-fetch';
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Test payment details from the error log
const testPaymentDetails = {
  razorpay_order_id: 'order_RbdQFD2z7a0HKN',
  razorpay_payment_id: 'pay_RbdQKi9P9I6mHE',
  // Generate a test signature (this won't be valid for actual verification)
  razorpay_signature: 'test_signature_for_api_testing'
};

async function testEmailVerification() {
  console.log('Testing email-based payment verification...');
  
  try {
    // Test the new email-based verification endpoint
    console.log('\nTesting email-based verification endpoint...');
    
    const verifyResponse = await fetch('http://localhost:5001/api/payments/verify-payment-by-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: We still don't have a valid auth token, but we can see the response
        'Authorization': 'Bearer invalid_token_for_testing'
      },
      body: JSON.stringify(testPaymentDetails)
    });

    const verifyData = await verifyResponse.json();
    console.log('Email verification response status:', verifyResponse.status);
    console.log('Email verification response:', verifyData);

    // Test the search endpoint to confirm payment exists
    console.log('\nConfirming payment record exists...');
    const searchResponse = await fetch(`http://localhost:5001/api/payments/search/${testPaymentDetails.razorpay_order_id}`);
    const searchData = await searchResponse.json();
    console.log('Payment search result:', searchData);

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testEmailVerification();
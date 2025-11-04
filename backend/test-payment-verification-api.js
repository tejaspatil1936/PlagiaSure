import fetch from 'node-fetch';
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Test payment details from the error log
const testPaymentDetails = {
  razorpay_order_id: 'order_RbdQFD2z7a0HKN',
  razorpay_payment_id: 'pay_RbdQKi9P9I6mHE',
  razorpay_signature: '681985015653' // This is not the real signature, just for testing
};

async function testPaymentVerificationAPI() {
  console.log('Testing payment verification API...');
  
  try {
    // Test without authentication first
    console.log('\n1. Testing payment search endpoint (no auth required)...');
    const searchResponse = await fetch(`http://localhost:5001/api/payments/search/${testPaymentDetails.razorpay_order_id}`);
    const searchData = await searchResponse.json();
    console.log('Search result:', searchData);

    // Test payment verification endpoint (requires auth)
    console.log('\n2. Testing payment verification endpoint (requires auth)...');
    console.log('Note: This will fail without proper authentication token');
    
    const verifyResponse = await fetch('http://localhost:5001/api/payments/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: We don't have a valid auth token for testing
        'Authorization': 'Bearer invalid_token_for_testing'
      },
      body: JSON.stringify(testPaymentDetails)
    });

    const verifyData = await verifyResponse.json();
    console.log('Verification response status:', verifyResponse.status);
    console.log('Verification response:', verifyData);

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testPaymentVerificationAPI();
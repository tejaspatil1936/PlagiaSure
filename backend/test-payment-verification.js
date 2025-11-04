import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test payment details from the error log
const testPaymentDetails = {
  razorpay_order_id: 'order_RbdQFD2z7a0HKN',
  razorpay_payment_id: 'pay_RbdQKi9P9I6mHE',
  user_email: 'baodhankaratharva@gmail.com'
};

async function testPaymentVerification() {
  console.log('Testing payment verification...');
  console.log('Payment details:', testPaymentDetails);

  try {
    // 1. Search for payment record by order ID
    console.log('\n1. Searching for payment record by order ID...');
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', testPaymentDetails.razorpay_order_id);

    if (paymentError) {
      console.error('Error searching payments:', paymentError);
      return;
    }

    console.log(`Found ${payments.length} payment records:`, payments);

    // 2. Search for user by email
    console.log('\n2. Searching for user by email...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testPaymentDetails.user_email);

    if (userError) {
      console.error('Error searching users:', userError);
      return;
    }

    console.log(`Found ${users.length} users:`, users);

    // 3. Search for subscriptions
    if (users.length > 0) {
      console.log('\n3. Searching for subscriptions...');
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', users[0].id)
        .order('created_at', { ascending: false });

      if (subscriptionError) {
        console.error('Error searching subscriptions:', subscriptionError);
        return;
      }

      console.log(`Found ${subscriptions.length} subscriptions:`, subscriptions);
    }

    // 4. Check if payment record should exist
    if (payments.length === 0) {
      console.log('\n❌ Payment record not found in database');
      console.log('This explains why payment verification is failing');
      console.log('The order was created in Razorpay but not saved to our database');
    } else {
      console.log('\n✅ Payment record found in database');
      const payment = payments[0];
      
      if (users.length > 0 && payment.user_id !== users[0].id) {
        console.log('❌ User ID mismatch:');
        console.log('Payment user_id:', payment.user_id);
        console.log('Expected user_id:', users[0].id);
      } else {
        console.log('✅ User ID matches');
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testPaymentVerification();
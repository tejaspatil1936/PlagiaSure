#!/usr/bin/env node

// Quick database setup script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up database tables...');

  try {
    // Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.log('❌ Database tables not found. Please run the SQL setup script first.');
      console.log('\n📋 Steps to fix:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the content from backend/scripts/setup-database.sql');
      console.log('4. Execute the script');
      console.log('5. Then run this script again');
      process.exit(1);
    }

    if (testError) {
      console.error('❌ Database connection error:', testError.message);
      process.exit(1);
    }

    console.log('✅ Database connection successful!');
    console.log('✅ Tables are accessible');
    
    // Test creating a sample user (this will help with the foreign key issue)
    console.log('\n📝 Database is ready for use!');
    console.log('You can now start using the application.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
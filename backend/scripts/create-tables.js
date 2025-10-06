#!/usr/bin/env node

// Create database tables programmatically
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

async function createTables() {
  console.log('🚀 Creating database tables...');

  const queries = [
    // Enable UUID extension
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      school_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'teacher',
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Subscriptions table
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      current_period_start TIMESTAMP WITH TIME ZONE,
      current_period_end TIMESTAMP WITH TIME ZONE,
      checks_used INTEGER DEFAULT 0,
      checks_limit INTEGER DEFAULT 100,
      last_used_at TIMESTAMP WITH TIME ZONE,
      request_message TEXT,
      requested_at TIMESTAMP WITH TIME ZONE,
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by UUID REFERENCES users(id),
      rejected_at TIMESTAMP WITH TIME ZONE,
      rejected_by UUID REFERENCES users(id),
      rejection_reason TEXT,
      cancelled_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Assignments table
    `CREATE TABLE IF NOT EXISTS assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_name VARCHAR(255) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      assignment_title VARCHAR(255) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER,
      file_type VARCHAR(100),
      extracted_text TEXT,
      status VARCHAR(50) DEFAULT 'uploaded',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Reports table
    `CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ai_probability DECIMAL(5,4) DEFAULT 0,
      ai_highlight JSONB,
      plagiarism_score DECIMAL(5,4) DEFAULT 0,
      plagiarism_highlight JSONB,
      verdict TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ];

  try {
    for (const query of queries) {
      console.log('Executing query...');
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error('❌ Query failed:', error.message);
        console.log('\n📋 Manual setup required:');
        console.log('Please run the SQL script manually in Supabase dashboard');
        return;
      }
    }
    
    console.log('✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy content from backend/scripts/setup-database.sql');
    console.log('3. Execute the script');
  }
}

createTables();
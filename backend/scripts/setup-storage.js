#!/usr/bin/env node

// Setup Supabase Storage policies programmatically
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...');

  try {
    // First, check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
      return;
    }

    const dataBucket = buckets.find(bucket => bucket.name === 'Data');
    
    if (!dataBucket) {
      console.log('📁 Creating "Data" bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('Data', {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        return;
      }
      
      console.log('✅ "Data" bucket created successfully!');
    } else {
      console.log('✅ "Data" bucket already exists');
    }

    console.log('\n📋 Manual steps required:');
    console.log('1. Go to Supabase Dashboard → Storage → Policies');
    console.log('2. Add these policies for the "Data" bucket:');
    console.log('\n--- Policy 1: Allow authenticated users to upload ---');
    console.log('Policy name: Users can upload files');
    console.log('Allowed operation: INSERT');
    console.log('Target roles: authenticated');
    console.log('USING expression: bucket_id = \'Data\'');
    console.log('WITH CHECK expression: bucket_id = \'Data\' AND auth.uid()::text = (storage.foldername(name))[1]');
    
    console.log('\n--- Policy 2: Allow users to read their files ---');
    console.log('Policy name: Users can read own files');
    console.log('Allowed operation: SELECT');
    console.log('Target roles: authenticated');
    console.log('USING expression: bucket_id = \'Data\' AND auth.uid()::text = (storage.foldername(name))[1]');
    
    console.log('\n--- Policy 3: Allow users to delete their files ---');
    console.log('Policy name: Users can delete own files');
    console.log('Allowed operation: DELETE');
    console.log('Target roles: authenticated');
    console.log('USING expression: bucket_id = \'Data\' AND auth.uid()::text = (storage.foldername(name))[1]');

    console.log('\n🔧 Alternative: Run the SQL script');
    console.log('Copy and run backend/scripts/setup-storage-policies.sql in Supabase SQL Editor');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupStorage();
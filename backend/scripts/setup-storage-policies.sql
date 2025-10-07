-- Storage Policies for Supabase "Data" bucket
-- Run this in Supabase Dashboard > SQL Editor

-- First, ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Data',
  'Data',
  false,
  10485760,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all files" ON storage.objects;

-- Create simplified policies that should work
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'Data' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'Data' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'Data' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'Data' AND 
        auth.role() = 'authenticated'
    );

-- Success message
SELECT 'Storage policies setup completed successfully!' as message;
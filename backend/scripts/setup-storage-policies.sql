-- Storage Policies for Supabase "Data" bucket
-- Run this in Supabase Dashboard > Storage > Policies

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'Data' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        auth.role() = 'authenticated'
    );

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'Data' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        auth.role() = 'authenticated'
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'Data' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        auth.role() = 'authenticated'
    );

-- Allow users to update their own files (for metadata)
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'Data' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        auth.role() = 'authenticated'
    );

-- Admin can view all files (optional)
CREATE POLICY "Admins can view all files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'Data' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.is_admin = true OR users.role = 'admin')
        )
    );

-- Success message
SELECT 'Storage policies setup completed successfully!' as message;
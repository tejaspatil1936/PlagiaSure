-- Fix Google OAuth Database Schema
-- Run this in your Supabase SQL Editor

-- First, let's check if the Google OAuth fields exist
DO $$ 
BEGIN
    -- Add Google OAuth fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'picture') THEN
        ALTER TABLE users ADD COLUMN picture TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- Make the foreign key constraint optional for Google OAuth users
-- Drop the existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- For now, we'll create users without the foreign key constraint
-- This allows Google OAuth users to be created independently
-- You can re-add the constraint later if needed:
-- ALTER TABLE users ADD CONSTRAINT users_id_fkey 
--     FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Success message
SELECT 'Google OAuth database schema updated successfully!' as message;
-- Razorpay Payment Integration Database Schema
-- Run this in your Supabase SQL editor after the main setup

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create payments table with Razorpay fields
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount INTEGER NOT NULL, -- Amount in paise (smallest currency unit)
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created', -- created, paid, failed, refunded
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    webhook_received_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create updated_at trigger for payments
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments (for payment verification)
CREATE POLICY "Users can update own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.is_admin = true OR users.role = 'admin')
        )
    );

-- Admins can update all payments
CREATE POLICY "Admins can update all payments" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.is_admin = true OR users.role = 'admin')
        )
    );

SELECT 'Payments table created successfully!' as message;

-- Update subscriptions table for payment integration
-- Add payment-related columns to existing subscriptions table
DO $$ 
BEGIN
    -- Add payment_id reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'payment_id') THEN
        ALTER TABLE subscriptions ADD COLUMN payment_id UUID REFERENCES payments(id);
    END IF;
    
    -- Add auto_renewal column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'auto_renewal') THEN
        ALTER TABLE subscriptions ADD COLUMN auto_renewal BOOLEAN DEFAULT false;
    END IF;
    
    -- Add payment_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'payment_method') THEN
        ALTER TABLE subscriptions ADD COLUMN payment_method VARCHAR(100);
    END IF;
END $$;

-- Create index for payment_id in subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON subscriptions(payment_id);

-- Update existing subscription records for compatibility
-- Set auto_renewal to false for all existing subscriptions (manual approval system)
UPDATE subscriptions 
SET auto_renewal = false 
WHERE auto_renewal IS NULL;

SELECT 'Subscriptions table updated for payment integration!' as message;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g., '2024-01')
    monthly_usage_count INTEGER DEFAULT 0,
    lifetime_usage_count INTEGER DEFAULT 0,
    last_scan_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per month
    UNIQUE(user_id, month_year)
);

-- Create indexes for efficient usage queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_month_year ON user_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_user_usage_last_scan ON user_usage(last_scan_at);

-- Create updated_at trigger for user_usage
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for user_usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage data
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage data
CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage data
CREATE POLICY "Users can update own usage" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all usage data
CREATE POLICY "Admins can view all usage" ON user_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.is_admin = true OR users.role = 'admin')
        )
    );

-- Function to get or create current month usage record
CREATE OR REPLACE FUNCTION get_or_create_monthly_usage(p_user_id UUID)
RETURNS user_usage AS $$
DECLARE
    current_month VARCHAR(7);
    usage_record user_usage;
BEGIN
    -- Get current month in YYYY-MM format
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    -- Try to get existing record
    SELECT * INTO usage_record 
    FROM user_usage 
    WHERE user_id = p_user_id AND month_year = current_month;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        -- Get lifetime usage count from previous records
        INSERT INTO user_usage (user_id, month_year, monthly_usage_count, lifetime_usage_count)
        VALUES (
            p_user_id, 
            current_month, 
            0,
            COALESCE((SELECT MAX(lifetime_usage_count) FROM user_usage WHERE user_id = p_user_id), 0)
        )
        RETURNING * INTO usage_record;
    END IF;
    
    RETURN usage_record;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_usage_count(p_user_id UUID)
RETURNS user_usage AS $$
DECLARE
    current_month VARCHAR(7);
    usage_record user_usage;
BEGIN
    -- Get current month in YYYY-MM format
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    -- Insert or update usage record
    INSERT INTO user_usage (user_id, month_year, monthly_usage_count, lifetime_usage_count, last_scan_at)
    VALUES (
        p_user_id, 
        current_month, 
        1,
        COALESCE((SELECT MAX(lifetime_usage_count) FROM user_usage WHERE user_id = p_user_id), 0) + 1,
        NOW()
    )
    ON CONFLICT (user_id, month_year) 
    DO UPDATE SET 
        monthly_usage_count = user_usage.monthly_usage_count + 1,
        lifetime_usage_count = user_usage.lifetime_usage_count + 1,
        last_scan_at = NOW(),
        updated_at = NOW()
    RETURNING * INTO usage_record;
    
    RETURN usage_record;
END;
$$ LANGUAGE plpgsql;

SELECT 'Usage tracking table created successfully!' as message;
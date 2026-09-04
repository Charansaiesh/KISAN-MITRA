-- ============================================================
-- KISANMITRA SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    aadhaar_hash VARCHAR(64),
    district VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'officer', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CROP REPORTS & SMART TOKENS TABLE
CREATE TABLE IF NOT EXISTS crop_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    crop VARCHAR(50) NOT NULL,
    quantity_quintal NUMERIC(10, 2) NOT NULL,
    mandi VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Registration received',
    progress_pct INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TOKEN WORKFLOW STEPS TABLE
CREATE TABLE IF NOT EXISTS token_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES crop_reports(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_by UUID REFERENCES users(id)
);

-- 4. MANDI MARKET PRICES (AGMARKNET & MSP) TABLE
CREATE TABLE IF NOT EXISTS mandi_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop VARCHAR(50) NOT NULL,
    mandi VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    msp_price NUMERIC(10, 2),
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMMUNITY POSTS / MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'sell' CHECK (type IN ('sell', 'buy')),
    category VARCHAR(50) NOT NULL DEFAULT 'crops' CHECK (category IN ('crops', 'equipment', 'transport')),
    title VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    price VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '🌾',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COMMUNITY COMMENTS
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATIONS / SMS ALERTS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(15) NOT NULL,
    token VARCHAR(30),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_crop_reports_token ON crop_reports(token);
CREATE INDEX IF NOT EXISTS idx_crop_reports_phone ON crop_reports(phone);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_crop ON mandi_prices(crop);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);

-- SEED INITIAL DEMO DATA
INSERT INTO crop_reports (token, farmer_name, phone, crop, quantity_quintal, mandi, district, status, progress_pct)
VALUES 
('KM2024001', 'Ram Yadav', '9876543210', 'Wheat', 45.00, 'Lucknow Mandi', 'Lucknow', 'Payment approved ✅', 100),
('KM2024002', 'Sumitra Devi', '9876543211', 'Mustard', 30.00, 'Jaipur Mandi', 'Jaipur', 'Quality check ⏳', 80),
('KM2024003', 'Mohan Patel', '9876543212', 'Paddy', 60.00, 'Patna Mandi', 'Patna', 'Identity verified ⏳', 40)
ON CONFLICT (token) DO NOTHING;

-- KisanMitra Supabase RLS Migration
-- Enables Row Level Security (RLS) on all tables with NO public policies.
-- This revokes direct browser / anon key access.
-- Server-side API requests using the service_role key will continue to have full access.

-- 1. Enable RLS on all production tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_quality_assessments ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy open or permissive policies if present
DROP POLICY IF EXISTS "Enable all access for anon" ON users;
DROP POLICY IF EXISTS "Enable all access for anon" ON crop_reports;
DROP POLICY IF EXISTS "Enable all access for anon" ON token_steps;
DROP POLICY IF EXISTS "Enable all access for anon" ON mandi_prices;
DROP POLICY IF EXISTS "Enable all access for anon" ON community_posts;
DROP POLICY IF EXISTS "Enable all access for anon" ON community_comments;
DROP POLICY IF EXISTS "Enable all access for anon" ON notifications;
DROP POLICY IF EXISTS "Enable all access for anon" ON feedback;
DROP POLICY IF EXISTS "Enable all access for anon" ON crop_quality_assessments;

DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Public reports access" ON crop_reports;
DROP POLICY IF EXISTS "Public token_steps access" ON token_steps;
DROP POLICY IF EXISTS "Public mandi_prices access" ON mandi_prices;
DROP POLICY IF EXISTS "Public community_posts access" ON community_posts;
DROP POLICY IF EXISTS "Public community_comments access" ON community_comments;
DROP POLICY IF EXISTS "Public notifications access" ON notifications;
DROP POLICY IF EXISTS "Public feedback access" ON feedback;
DROP POLICY IF EXISTS "Public crop_quality_assessments access" ON crop_quality_assessments;

-- RLS is now active on all 9 tables with zero public access policies.

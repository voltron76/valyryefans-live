-- ============================================================
-- SQL Migration: Web Analytics Table & RLS Policies
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'like', 'comment', 'tip', 'bookmark', 'poll_vote'
  page_path TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow INSERT for everyone (guests and authenticated users)
CREATE POLICY "Enable insert for all users including anonymous" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Allow SELECT only for users with admin tier in their profiles
CREATE POLICY "Enable read access for admin users only" ON analytics_events
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE tier = 'admin'
    )
  );

-- Create index for performance on queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

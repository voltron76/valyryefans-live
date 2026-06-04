-- ============================================================
-- ValyryeFans — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'fan' CHECK (role IN ('fan', 'creator')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', 'fan');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. SUBSCRIPTION TIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default tiers
INSERT INTO tiers (name, slug, price_cents, sort_order, features) VALUES
  ('Free', 'free', 0, 0, '["Access to public gallery", "View 10 free photos", "Like & comment on posts"]'),
  ('Gold', 'gold', 1499, 1, '["Everything in Free", "Unlock ALL 200+ exclusive photos", "Behind-the-scenes content", "Direct messaging access", "Monthly exclusive photo set", "Custom content requests", "Priority responses", "Early access to new drops"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES tiers(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- 4. CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT,
  thumbnail_path TEXT,
  is_public BOOLEAN DEFAULT false,
  min_tier_id UUID REFERENCES tiers(id),
  content_type TEXT CHECK (content_type IN ('image', 'video')),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_public ON content(is_public);
CREATE INDEX idx_content_created ON content(created_at DESC);

-- ============================================================
-- 5. CONTENT LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- ============================================================
-- 6. CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fan_id, creator_id)
);

CREATE INDEX idx_conversations_fan ON conversations(fan_id);
CREATE INDEX idx_conversations_creator ON conversations(creator_id);

-- ============================================================
-- 7. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- 8. ROW-LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- TIERS
CREATE POLICY "Tiers are viewable by everyone" ON tiers
  FOR SELECT USING (true);

-- SUBSCRIPTIONS
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- CONTENT
CREATE POLICY "Public content visible to everyone" ON content
  FOR SELECT USING (is_public = true);

CREATE POLICY "Subscribers can view gated content" ON content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN tiers st ON s.tier_id = st.id
      JOIN tiers ct ON content.min_tier_id = ct.id
      WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND st.sort_order >= ct.sort_order
    )
  );

CREATE POLICY "Creators can manage own content" ON content
  FOR ALL USING (auth.uid() = creator_id);

-- CONTENT LIKES
CREATE POLICY "Users can view all likes" ON content_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON content_likes
  FOR ALL USING (auth.uid() = user_id);

-- CONVERSATIONS
CREATE POLICY "Users see own conversations" ON conversations
  FOR SELECT USING (auth.uid() = fan_id OR auth.uid() = creator_id);

CREATE POLICY "Fans can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = fan_id);

-- MESSAGES
CREATE POLICY "Users see messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.fan_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.fan_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

-- ============================================================
-- 9. REALTIME (enable for messages)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- Done! Your database is ready.
-- ============================================================

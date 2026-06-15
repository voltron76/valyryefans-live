-- ============================================================
-- ValyryeFans — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'fan' CHECK (role IN ('fan', 'creator')),
  bio TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'gold', 'admin')),
  balance NUMERIC(12,2) DEFAULT 0.00,
  stripe_customer_id TEXT,
  tip_limit NUMERIC(12,2) DEFAULT 0.00,
  card_last4 TEXT,
  subscription_status TEXT DEFAULT 'active',
  email TEXT,
  email_new_post BOOLEAN DEFAULT true,
  email_new_message BOOLEAN DEFAULT true,
  email_subscription_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, display_name, role, tier, balance, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'fan',
    'free',
    0.00,
    NEW.email
  );
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

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- 4. CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  min_tier TEXT DEFAULT 'free' CHECK (min_tier IN ('free', 'gold', 'admin')),
  category TEXT,
  thumbnail TEXT,
  video_url TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_created ON content(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_conversations_fan ON conversations(fan_id);
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(creator_id);

-- ============================================================
-- 7. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- 8. COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. TIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. ROW-LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- PROFILES SELECT & UPDATE policies are redefined securely in secure-database.sql
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
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
CREATE POLICY "Anyone can view free content" ON content
  FOR SELECT USING (min_tier = 'free');

CREATE POLICY "Gold members and admins can view gold content" ON content
  FOR SELECT USING (
    min_tier = 'gold' AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (tier = 'gold' OR tier = 'admin')
    )
  );

CREATE POLICY "Creators can view own content" ON content
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage content" ON content
  FOR ALL USING (
    auth.uid() = creator_id AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'creator' OR tier = 'admin')
    )
  );

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
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- COMMENTS
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments" ON comments
  FOR ALL USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- TIPS
CREATE POLICY "Admins can view all tips" ON tips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

CREATE POLICY "Users can view own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 11. REALTIME (enable for messages)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

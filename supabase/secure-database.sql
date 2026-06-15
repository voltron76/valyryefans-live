-- ============================================================
-- ValyryeFans — Security and Payment Compliance Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profile Security Triggers (Prevent Client-Side Upgrades)
-- ------------------------------------------------------------

-- Force default values on insert
CREATE OR REPLACE FUNCTION force_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserted by an authenticated/anonymous client, force free tier and 0 balance
  IF auth.role() = 'authenticated' OR auth.role() = 'anon' THEN
    NEW.tier := 'free';
    NEW.balance := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_force_profile_defaults ON profiles;
CREATE TRIGGER tr_force_profile_defaults
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION force_profile_defaults();

-- Prevent modifications to tier or balance on update
CREATE OR REPLACE FUNCTION protect_profile_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- If updated by an authenticated/anonymous client, ignore changes to tier/balance
  IF auth.role() = 'authenticated' OR auth.role() = 'anon' THEN
    NEW.tier := OLD.tier;
    NEW.balance := OLD.balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_profile_tier ON profiles;
CREATE TRIGGER tr_protect_profile_tier
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_tier();


-- ------------------------------------------------------------
-- 2. Storage Security Policies (Restrict Media Access)
-- ------------------------------------------------------------

-- Remove the old permissive select policy
DROP POLICY IF EXISTS "Users can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users see media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view authorized media" ON storage.objects;

-- Create secure select policy
CREATE POLICY "Users can view authorized media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media' AND (
      -- Admin can view everything
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND tier = 'admin'
      )
      OR
      -- Object is a thumbnail (public preview/blurred teaser)
      EXISTS (
        SELECT 1 FROM public.content
        WHERE thumbnail = name
      )
      OR
      -- Object is not linked to any premium content (e.g. avatars, public files)
      NOT EXISTS (
        SELECT 1 FROM public.content 
        WHERE (video_url = name OR media ? name) AND min_tier = 'gold'
      )
      OR
      -- Object is linked to content that is free/public
      EXISTS (
        SELECT 1 FROM public.content 
        WHERE (video_url = name OR media ? name) AND min_tier = 'free'
      )
      OR
      -- Object is linked to gold content, and the requesting user is a Gold member
      EXISTS (
        SELECT 1 FROM public.content c
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE (c.video_url = name OR c.media ? name)
          AND c.min_tier = 'gold'
          AND p.tier = 'gold'
      )
    )
  );


-- ------------------------------------------------------------
-- 3. Tipping & Chat Integration Trigger (Automatic Message on Tip)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION auto_insert_tip_message()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
  msg_text TEXT;
BEGIN
  -- Find the creator (admin) profile id
  SELECT id INTO creator_id FROM public.profiles WHERE tier = 'admin' LIMIT 1;
  
  -- Format message content
  IF NEW.message IS NOT NULL AND NEW.message <> '' THEN
    msg_text := '💝 Sent a $' || NEW.amount || ' tip! "' || NEW.message || '"';
  ELSE
    msg_text := '💝 Sent a $' || NEW.amount || ' tip!';
  END IF;

  -- Insert message into chat (only if a creator exists)
  IF creator_id IS NOT NULL THEN
    INSERT INTO public.messages (sender_id, recipient_id, content, type)
    VALUES (NEW.user_id, creator_id, msg_text, 'tip');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_insert_tip_message ON tips;
CREATE TRIGGER tr_auto_insert_tip_message
  AFTER INSERT ON tips
  FOR EACH ROW EXECUTE FUNCTION auto_insert_tip_message();


-- ------------------------------------------------------------
-- 4. Tipping Security (Harden Tips Table Against Client Mocking)
-- ------------------------------------------------------------

-- Disable standard client roles (anon, authenticated) from inserting directly into tips
DROP POLICY IF EXISTS "Users can insert their own tips" ON tips;
DROP POLICY IF EXISTS "Users can insert own tips" ON tips;

-- Revoke standard insert grant to prevent client SQL bypasses
REVOKE INSERT ON public.tips FROM anon, authenticated;


-- ------------------------------------------------------------
-- 5. Profiles Select Policy (Allow Comment Author Tier Binding)
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);


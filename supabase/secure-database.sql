-- ============================================================
-- ValyryeFans — Security and Payment Compliance Migration
-- ============================================================

-- ------------------------------------------------------------
-- 1. Atomic Balance Update Function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_admin_balance(amount_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles_secure
  SET balance = COALESCE(balance, 0.00) + amount_to_add
  WHERE tier = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------
-- 2. Convert Profiles Table to Security View Idempotently
-- ------------------------------------------------------------

DO $$
BEGIN
  -- If profiles is still a table (not a view), rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE public.profiles RENAME TO profiles_secure;
  END IF;
END $$;

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.profiles CASCADE;

-- Create the Secure Profiles View
-- Sensitive columns (email, balance, card_last4, tip_limit, subscription_status)
-- are only visible to the owner or admin
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  name,
  handle,
  avatar,
  avatar_url,
  tier,
  created_at,
  email_new_post,
  email_new_message,
  email_subscription_alerts,
  -- Sensitive columns are only visible to the owner or admin
  CASE 
    WHEN auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles_secure WHERE id = auth.uid() AND tier = 'admin') THEN email 
    ELSE NULL 
  END AS email,
  CASE 
    WHEN auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles_secure WHERE id = auth.uid() AND tier = 'admin') THEN balance 
    ELSE NULL 
  END AS balance,
  CASE 
    WHEN auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles_secure WHERE id = auth.uid() AND tier = 'admin') THEN card_last4 
    ELSE NULL 
  END AS card_last4,
  CASE 
    WHEN auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles_secure WHERE id = auth.uid() AND tier = 'admin') THEN tip_limit 
    ELSE NULL 
  END AS tip_limit,
  CASE 
    WHEN auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles_secure WHERE id = auth.uid() AND tier = 'admin') THEN subscription_status 
    ELSE NULL 
  END AS subscription_status
FROM public.profiles_secure;

-- Revoke all direct privileges on profiles_secure table to prevent client bypass
REVOKE ALL ON public.profiles_secure FROM anon, authenticated, public;

-- Grant privileges on the view profiles to client roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated, public;

-- ------------------------------------------------------------
-- 3. Instead-Of Triggers on View to route modifications
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_profiles_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_secure (
    id, name, handle, avatar, avatar_url, tier, balance, email, card_last4, 
    tip_limit, subscription_status, email_new_post, email_new_message, email_subscription_alerts
  ) VALUES (
    NEW.id, NEW.name, NEW.handle, NEW.avatar, NEW.avatar_url, NEW.tier, NEW.balance, NEW.email, NEW.card_last4,
    NEW.tip_limit, NEW.subscription_status, NEW.email_new_post, NEW.email_new_message, NEW.email_subscription_alerts
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profiles_view_insert ON public.profiles;
CREATE TRIGGER tr_profiles_view_insert
  INSTEAD OF INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_view_insert();

CREATE OR REPLACE FUNCTION public.handle_profiles_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles_secure SET
    name = NEW.name,
    handle = NEW.handle,
    avatar = NEW.avatar,
    avatar_url = NEW.avatar_url,
    tier = NEW.tier,
    email = COALESCE(NEW.email, OLD.email),
    balance = COALESCE(NEW.balance, OLD.balance),
    card_last4 = COALESCE(NEW.card_last4, OLD.card_last4),
    tip_limit = COALESCE(NEW.tip_limit, OLD.tip_limit),
    subscription_status = COALESCE(NEW.subscription_status, OLD.subscription_status),
    email_new_post = COALESCE(NEW.email_new_post, OLD.email_new_post),
    email_new_message = COALESCE(NEW.email_new_message, OLD.email_new_message),
    email_subscription_alerts = COALESCE(NEW.email_subscription_alerts, OLD.email_subscription_alerts)
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profiles_view_update ON public.profiles;
CREATE TRIGGER tr_profiles_view_update
  INSTEAD OF UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_view_update();

CREATE OR REPLACE FUNCTION public.handle_profiles_view_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles_secure WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profiles_view_delete ON public.profiles;
CREATE TRIGGER tr_profiles_view_delete
  INSTEAD OF DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_view_delete();


-- ------------------------------------------------------------
-- 4. Profile Security Triggers (Prevent Client-Side Upgrades)
-- ------------------------------------------------------------

-- Force default values on insert
CREATE OR REPLACE FUNCTION force_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserted by any client (excluding service_role), force free tier and 0 balance
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.tier := 'free';
    NEW.balance := 0.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_force_profile_defaults ON profiles_secure;
CREATE TRIGGER tr_force_profile_defaults
  BEFORE INSERT ON profiles_secure
  FOR EACH ROW EXECUTE FUNCTION force_profile_defaults();

-- Prevent modifications to tier or balance on update
CREATE OR REPLACE FUNCTION protect_profile_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- If updated by any client (excluding service_role), ignore changes to tier/balance
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.tier := OLD.tier;
    NEW.balance := OLD.balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_profile_tier ON profiles_secure;
CREATE TRIGGER tr_protect_profile_tier
  BEFORE UPDATE ON profiles_secure
  FOR EACH ROW EXECUTE FUNCTION protect_profile_tier();


-- ------------------------------------------------------------
-- 5. Storage Security Policies (Restrict Media Access)
-- ------------------------------------------------------------

-- Remove the old policies
DROP POLICY IF EXISTS "Users can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users see media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view authorized media" ON storage.objects;

-- Create secure fail-closed SELECT policy
CREATE POLICY "Users can view authorized media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media' AND (
      -- 1. Avatars are public
      name LIKE 'avatars/%'
      OR
      -- 2. Admin can view everything
      EXISTS (
        SELECT 1 FROM public.profiles_secure 
        WHERE id = auth.uid() AND tier = 'admin'
      )
      OR
      -- 3. Object is a thumbnail (public preview)
      EXISTS (
        SELECT 1 FROM public.content
        WHERE thumbnail = name
      )
      OR
      -- 4. Object is linked to content that is free/public
      EXISTS (
        SELECT 1 FROM public.content 
        WHERE (video_url = name OR media ? name) AND min_tier = 'free'
      )
      OR
      -- 5. Object is linked to gold content, and user has gold/admin tier
      EXISTS (
        SELECT 1 FROM public.content c
        JOIN public.profiles_secure p ON p.id = auth.uid()
        WHERE (c.video_url = name OR c.media ? name)
          AND c.min_tier = 'gold'
          AND (p.tier = 'gold' OR p.tier = 'admin')
      )
    )
  );


-- ------------------------------------------------------------
-- 6. Tipping & Chat Integration Trigger (Automatic Message on Tip)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION auto_insert_tip_message()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
  msg_text TEXT;
BEGIN
  -- Find the creator (admin) profile id
  SELECT id INTO creator_id FROM public.profiles_secure WHERE tier = 'admin' LIMIT 1;
  
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
-- 7. Tipping Security (Harden Tips Table Against Client Mocking)
-- ------------------------------------------------------------

-- Disable standard client roles (anon, authenticated) from inserting directly into tips
DROP POLICY IF EXISTS "Users can insert their own tips" ON tips;
DROP POLICY IF EXISTS "Users can insert own tips" ON tips;

-- Revoke standard insert grant to prevent client SQL bypasses
REVOKE INSERT ON public.tips FROM anon, authenticated;


-- ------------------------------------------------------------
-- 8. Message UPDATE restriction (Recipient can only update is_read)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_message_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  -- If not service_role, enforce restriction
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF OLD.sender_id IS DISTINCT FROM NEW.sender_id OR
       OLD.recipient_id IS DISTINCT FROM NEW.recipient_id OR
       OLD.content IS DISTINCT FROM NEW.content OR
       OLD.type IS DISTINCT FROM NEW.type OR
       OLD.media_url IS DISTINCT FROM NEW.media_url OR
       OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'You are only allowed to update the is_read field.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_message_update_restrictions ON public.messages;
CREATE TRIGGER tr_check_message_update_restrictions
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION check_message_update_restrictions();


-- ------------------------------------------------------------
-- 9. Profiles Select Policy (readable via view)
-- ------------------------------------------------------------

-- Note: RLS is on the underlying profiles_secure table.
-- The view handles column masking. We still need basic RLS on profiles_secure
-- for service_role operations. Since clients access via view, 
-- we keep the underlying table locked down.

-- Ensure RLS is enabled on the underlying table
ALTER TABLE public.profiles_secure ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS "Service role full access" ON public.profiles_secure;
CREATE POLICY "Service role full access" ON public.profiles_secure
  FOR ALL USING (auth.role() = 'service_role');


-- ------------------------------------------------------------
-- 10. Signup Rate Limiting
-- ------------------------------------------------------------

-- Create table to log successful signups
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

-- Allow only admins to view signup attempts
DROP POLICY IF EXISTS "Only admins can view signup attempts" ON public.signup_attempts;
CREATE POLICY "Only admins can view signup attempts" ON public.signup_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_secure
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- Helper function to extract client IP address from request headers
CREATE OR REPLACE FUNCTION public.get_client_ip()
RETURNS TEXT AS $$
DECLARE
  headers_text TEXT;
  ip TEXT;
BEGIN
  headers_text := current_setting('request.headers', true);
  IF headers_text IS NOT NULL AND headers_text <> '' THEN
    BEGIN
      ip := headers_text::json->>'x-forwarded-for';
      IF ip IS NOT NULL THEN
        -- x-forwarded-for can be a comma-separated list of IPs, get the first one
        ip := split_part(ip, ',', 1);
        ip := trim(ip);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      ip := '127.0.0.1';
    END;
  END IF;
  RETURN COALESCE(ip, '127.0.0.1');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger/Hook function to enforce signup rate limiting
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  incoming_ip TEXT;
  incoming_fingerprint TEXT;
  fingerprint_count INT := 0;
  ip_count INT := 0;
BEGIN
  -- Extract fingerprint and IP
  incoming_fingerprint := NEW.raw_user_meta_data->>'device_fingerprint';
  incoming_ip := public.get_client_ip();

  -- Exempt Admin account by email
  IF NEW.email = 'atkittelson1@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Exempt Admin's fingerprint/IP
  IF incoming_fingerprint IS NOT NULL AND incoming_fingerprint <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.signup_attempts 
      WHERE email = 'atkittelson1@gmail.com' AND device_fingerprint = incoming_fingerprint
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  IF incoming_ip IS NOT NULL AND incoming_ip <> '' THEN
    IF EXISTS (
      SELECT 1 FROM public.signup_attempts 
      WHERE email = 'atkittelson1@gmail.com' AND ip_address = incoming_ip
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Enforce Rate Limits: 2 account limit per device/IP
  IF incoming_fingerprint IS NOT NULL AND incoming_fingerprint <> '' THEN
    SELECT COUNT(*) INTO fingerprint_count 
    FROM public.signup_attempts 
    WHERE device_fingerprint = incoming_fingerprint;
    
    IF fingerprint_count >= 2 THEN
      RAISE EXCEPTION 'Signup blocked: Limit of 2 accounts per device/IP exceeded';
    END IF;
  END IF;

  IF incoming_ip IS NOT NULL AND incoming_ip <> '' THEN
    SELECT COUNT(*) INTO ip_count 
    FROM public.signup_attempts 
    WHERE ip_address = incoming_ip;
    
    IF ip_count >= 2 THEN
      RAISE EXCEPTION 'Signup blocked: Limit of 2 accounts per device/IP exceeded';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook the rate limiter before a user is inserted in auth.users
DROP TRIGGER IF EXISTS tr_before_auth_user_created ON auth.users;
CREATE TRIGGER tr_before_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_signup_rate_limit();

-- Trigger function to log successful signups after user is inserted
CREATE OR REPLACE FUNCTION public.log_successful_signup()
RETURNS TRIGGER AS $$
DECLARE
  incoming_ip TEXT;
  incoming_fingerprint TEXT;
BEGIN
  incoming_ip := public.get_client_ip();
  incoming_fingerprint := NEW.raw_user_meta_data->>'device_fingerprint';
  
  INSERT INTO public.signup_attempts (email, ip_address, device_fingerprint)
  VALUES (NEW.email, incoming_ip, incoming_fingerprint);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook the logger after a user is inserted in auth.users
DROP TRIGGER IF EXISTS tr_after_auth_user_created ON auth.users;
CREATE TRIGGER tr_after_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_successful_signup();

-- ============================================================
-- SQL Migration: Signup Rate Limiting (Milestone M2)
-- ============================================================

-- 1. Create table to log successful signups
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
CREATE POLICY "Only admins can view signup attempts" ON public.signup_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles_secure
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- 2. Helper function to extract client IP address from request headers
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

-- 3. Trigger/Hook function to enforce signup rate limiting
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

-- 4. Hook the rate limiter before a user is inserted in auth.users
DROP TRIGGER IF EXISTS tr_before_auth_user_created ON auth.users;
CREATE TRIGGER tr_before_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_signup_rate_limit();

-- 5. Trigger function to log successful signups after user is inserted
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

-- 6. Hook the logger after a user is inserted in auth.users
DROP TRIGGER IF EXISTS tr_after_auth_user_created ON auth.users;
CREATE TRIGGER tr_after_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_successful_signup();

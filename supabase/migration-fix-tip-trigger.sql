-- ============================================================
-- SQL Migration: Fix auto_insert_tip_message function query
-- Fixes column "role" does not exist error on tip insertions
-- ============================================================

CREATE OR REPLACE FUNCTION auto_insert_tip_message()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
  msg_text TEXT;
BEGIN
  -- Find the creator (admin) profile id (correcting column 'role' reference to 'tier')
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

-- ============================================================
-- SQL Migration: Add Cascade Delete to Foreign Key Constraints
-- Resolves "cannot delete user" errors caused by NO ACTION references
-- ============================================================

-- 1. Profiles reference to auth.users
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 2. Messages reference to profiles (sender_id)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 3. Messages reference to profiles (recipient_id)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey,
  ADD CONSTRAINT messages_recipient_id_fkey
    FOREIGN KEY (recipient_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 4. Tips reference to profiles
ALTER TABLE public.tips
  DROP CONSTRAINT IF EXISTS tips_user_id_fkey,
  ADD CONSTRAINT tips_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

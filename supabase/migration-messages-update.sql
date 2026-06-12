-- ============================================================
-- 1. ADD IS_READ COLUMN IF MISSING
-- ============================================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- ============================================================
-- 2. MESSAGES UPDATE POLICY (MARK AS READ)
-- ============================================================
-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own received messages" ON public.messages;

-- Create policy allowing the recipient or creator/admin to update the messages (mark as read)
CREATE POLICY "Users can update their own received messages" ON public.messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (tier = 'admin' OR role = 'creator')
    )
  );

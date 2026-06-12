-- ============================================================
-- 1. CREATE POLLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of objects: [{"id": "a", "text": "Option 1"}, ...]
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. CREATE POLL VOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. POLLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view polls" ON public.polls;
CREATE POLICY "Anyone can view polls" ON public.polls
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage polls" ON public.polls;
CREATE POLICY "Admins can manage polls" ON public.polls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- ============================================================
-- 5. POLL_VOTES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view poll votes" ON public.poll_votes;
CREATE POLICY "Anyone can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.poll_votes;
CREATE POLICY "Authenticated users can vote" ON public.poll_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

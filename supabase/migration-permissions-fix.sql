-- ============================================================
-- SQL Migration: Fix Profiles Secure Permissions for RLS View Expansion
-- ============================================================

-- Grant SELECT on public, non-sensitive columns of profiles_secure
-- to clients so that RLS view expansion and subqueries in other policies
-- can read the authorization metadata (like 'id' and 'tier') successfully.
-- Sensitive columns (email, balance, card_last4, tip_limit, subscription_status)
-- remain protected with no privileges granted to standard client roles.

GRANT SELECT (
  id,
  name,
  handle,
  avatar,
  avatar_url,
  tier,
  created_at,
  email_new_post,
  email_new_message,
  email_subscription_alerts
) ON public.profiles_secure TO anon, authenticated, public;

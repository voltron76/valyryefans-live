-- ============================================================
-- SQL Migration: Webhook Idempotency & Database Integrity
-- Enforces uniqueness constraints on Stripe references to prevent duplicate processing
-- ============================================================

-- 1. Subscriptions Table: Enforce unique subscription IDs
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS unique_stripe_subscription_id;
ALTER TABLE public.subscriptions ADD CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id);

-- 2. Tips Table: Add stripe_session_id column and enforce uniqueness
ALTER TABLE public.tips ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

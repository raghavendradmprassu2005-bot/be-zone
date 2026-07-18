-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Firebase push notification support
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Schema verified against types.ts. No assumptions made.
-- Tables in scope: profiles, orders, order_items, user_roles
-- Admin check uses the existing has_role() function and user_roles table.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Add FCM token column to profiles ──────────────────────────────────────
-- Stores the customer's Firebase Cloud Messaging device token.
-- Written by the browser (useFCMToken hook) when the customer grants
-- notification permission. Cleared server-side when the token expires.
-- profiles columns confirmed: id, full_name, email, phone, address, city, pincode, created_at

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fcm_token text DEFAULT NULL;

-- Partial index — only rows that have a token, for fast server-side lookup
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token
  ON public.profiles (fcm_token)
  WHERE fcm_token IS NOT NULL;


-- ── 2. Notification logs table ────────────────────────────────────────────────
-- One row per notification attempt written by api/send-push-notification.js.
-- The serverless function uses the service role key which bypasses RLS,
-- so it can always INSERT regardless of policies below.

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Nullable FK so logs survive if the order is later deleted
  order_id      uuid        REFERENCES public.orders(id) ON DELETE SET NULL,
  -- auth.users UUID of the customer who received (or should have received) the push
  user_id       uuid        DEFAULT NULL,
  -- 'sent' | 'failed' | 'no_token' | 'misconfigured'
  status        text        NOT NULL,
  -- Populated only on failure — FCM error message or internal reason
  error_message text        DEFAULT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id
  ON public.notification_logs (order_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id
  ON public.notification_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at
  ON public.notification_logs (created_at DESC);


-- ── 3. Row Level Security ─────────────────────────────────────────────────────
-- The serverless function (service role key) bypasses RLS automatically.
-- Customers can read their own notification history.
-- Admins and moderators (via the existing user_roles table) can read all rows.

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Customers can see their own notification history
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins and moderators can view all logs
-- Queries user_roles directly with a text cast to avoid any enum dependency
CREATE POLICY "Admins can view all notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role::text IN ('admin', 'moderator')
    )
  );

-- ============================================================
-- SQL Migration: Email Templates, Sent Email Logs, and Preferences
-- ============================================================

-- 1. Create Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'welcome', 'new_post', 'new_message', 'new_subscription', 'expiring_subscription'
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Sent Emails Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add Email and Preference columns to Profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles_secure') THEN
    ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS email_new_post BOOLEAN DEFAULT true;
    ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS email_new_message BOOLEAN DEFAULT true;
    ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS email_subscription_alerts BOOLEAN DEFAULT true;
  ELSE
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_new_post BOOLEAN DEFAULT true;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_new_message BOOLEAN DEFAULT true;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_subscription_alerts BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies (Admins only for templates and sent logs)
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view sent emails logs" ON public.sent_emails;
CREATE POLICY "Admins can view sent emails logs" ON public.sent_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- 6. Seed Default Premium Pink-Themed Email Templates (ValyReyes Fans Branding)
INSERT INTO public.email_templates (name, subject, html_content) VALUES
  (
    'welcome',
    'Welcome to ValyReyes Fans! 💖',
    '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">
      <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>
      <h2 style="font-size: 22px; margin-top: 0; font-weight: 600;">Welcome, {{name}}!</h2>
      <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Thanks for joining my official fan club. I am so excited to have you here! You now have access to my public feed, and you can upgrade to Gold tier anytime to unlock my entire vault of 200+ exclusive photos and videos, request custom content, and chat with me directly.</p>
      <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">Enter My Feed</a>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">
      <p style="color: #71717a; font-size: 12px; line-height: 1.5;">You received this email because you signed up on ValyReyes Fans. If you wish to opt-out, you can change your notification preferences in your profile settings.<br>© 2026 ValyReyes Fans. All rights reserved.</p>
    </div>'
  ),
  (
    'new_post',
    'New exclusive post uploaded! 🔥',
    '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">
      <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>
      <h2 style="font-size: 20px; margin-top: 0; font-weight: 600; color: #f4f4f5;">I just posted something new!</h2>
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: left;">
        <h3 style="color: #ff4b82; margin-top: 0; font-size: 18px; font-weight: 700;">{{post_title}}</h3>
        <p style="color: #a0a0ab; font-size: 15px; line-height: 1.6; margin-bottom: 0;">{{post_description}}</p>
      </div>
      <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Log in now to see the full set, drop a like, and leave a comment! Can''t wait to hear what you think.</p>
      <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">View Post</a>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">
      <p style="color: #71717a; font-size: 12px; line-height: 1.5;">You received this email because you are a subscriber on ValyReyes Fans. You can manage your email subscriptions in your account settings.<br>© 2026 ValyReyes Fans. All rights reserved.</p>
    </div>'
  ),
  (
    'new_message',
    'You have a new message from Valerie Reyes! 💬',
    '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">
      <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>
      <h2 style="font-size: 20px; margin-top: 0; font-weight: 600; color: #f4f4f5;">You have a new message!</h2>
      <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Hey {{name}}, I just sent you a direct message. Click below to read it and reply!</p>
      <div style="background-color: #18181b; border-left: 4px solid #ff4b82; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: left; color: #e4e4e7; font-style: italic; font-size: 15px;">
        "{{message_snippet}}"
      </div>
      <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">Reply Now</a>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">
      <p style="color: #71717a; font-size: 12px; line-height: 1.5;">You received this email because you are registered on ValyReyes Fans. You can toggle message email alerts in your settings.<br>© 2026 ValyReyes Fans. All rights reserved.</p>
    </div>'
  ),
  (
    'new_subscription',
    'Welcome to the Gold Tier! 👑',
    '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">
      <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>
      <h2 style="font-size: 22px; margin-top: 0; font-weight: 600; color: #e4e4e7;">You are now a GOLD VIP! 👑</h2>
      <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Thank you so much for your subscription! Your support means the world to me. You have officially unlocked unlimited access to all my sets, behind-the-scenes videos, priority messaging, custom requests, and monthly exclusive content drops.</p>
      <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">Unlock Gold Vault</a>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">
      <p style="color: #71717a; font-size: 12px; line-height: 1.5;">This receipt is confirmation of your Gold VIP subscription. Account billing is managed securely via Stripe.<br>© 2026 ValyReyes Fans. All rights reserved.</p>
    </div>'
  ),
  (
    'expiring_subscription',
    'Your Gold VIP Access Status Update ⚠️',
    '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">
      <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>
      <h2 style="font-size: 22px; margin-top: 0; font-weight: 600; color: #f4f4f5;">Gold Subscription Status</h2>
      <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">We wanted to let you know that your subscription to the Gold VIP tier is cancelled, past due, or has expired. You will lose access to my exclusive photo sets and messaging privileges at the end of your billing cycle unless you reactivate.</p>
      <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">Reactivate Subscription</a>
      <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">
      <p style="color: #71717a; font-size: 12px; line-height: 1.5;">If this was an error, please update your billing settings in the profile portal.<br>© 2026 ValyReyes Fans. All rights reserved.</p>
    </div>'
  )
ON CONFLICT (name) DO UPDATE SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content;

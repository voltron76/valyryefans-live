-- ============================================================
-- SQL Migration: Add new_tip email template
-- ============================================================

INSERT INTO public.email_templates (name, subject, html_content)
VALUES (
  'new_tip',
  'Thank you for your tip! 💝',
  '<div style="background-color: #0f0f12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff4b82;">\n  <h1 style="color: #ff4b82; font-size: 28px; margin-bottom: 10px; font-weight: 800;">ValyReyes Fans</h1>\n  <h2 style="font-size: 22px; margin-top: 0; font-weight: 600; color: #e4e4e7;">Thank you for your tip! 💝</h2>\n  <p style="color: #a0a0ab; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">\n    Hey {{name}}! I received your tip of <strong>${{amount}}</strong>. Thank you so much for supporting my content and showing your appreciation! It helps me keep creating and sharing premium photos and videos for you.\n  </p>\n  <p style="color: #a0a0ab; font-size: 14px; font-style: italic; margin-bottom: 30px;">\n    "{{message}}"\n  </p>\n  <a href="{{url}}" style="background-color: #ff4b82; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 30px; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 75, 130, 0.4);">\n    Go to my Feed\n  </a>\n  <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0 20px 0;">\n  <p style="color: #71717a; font-size: 12px; line-height: 1.5;">\n    This receipt is confirmation of your tip payment. Account billing is managed securely via Stripe.<br>\n    © 2026 ValyReyes Fans. All rights reserved.\n  </p>\n</div>'
)
ON CONFLICT (name) DO UPDATE
SET subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content;

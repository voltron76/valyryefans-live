import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  event: 'welcome' | 'new_post' | 'new_message' | 'new_subscription' | 'expiring_subscription' | 'custom_bulk';
  recipientId?: string;       // For targeted templates (welcome, new_message, etc.)
  recipientEmail?: string;    // Custom recipient email (for bulk/direct)
  recipientsGroup?: 'subscribers' | 'fans' | 'all'; // For bulk emails
  customSubject?: string;     // For custom_bulk
  customBody?: string;        // For custom_bulk (HTML supported)
  variables?: Record<string, string>; // Placeholder values
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check auth: Must be service role key or an admin user
    const isServiceRole = token === supabaseServiceKey;
    let isAdmin = false;
    let requestingUser: any = null;

    if (!isServiceRole) {
      // Validate the user token
      const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
      if (authError || !user) {
        throw new Error('Not authenticated')
      }
      requestingUser = user;

      // Check if user is creator/admin
      const { data: profile } = await adminClient
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()
      
      isAdmin = profile?.tier === 'admin';
    }

    const body: EmailPayload = await req.json()
    const { event, recipientId, recipientEmail, recipientsGroup, customSubject, customBody, variables = {} } = body;

    // Security check: Only admins or service role can send notifications to others
    // Regular users can only trigger self-welcome emails
    if (!isServiceRole && !isAdmin) {
      if (event !== 'welcome' || recipientId !== requestingUser.id) {
        return new Response(JSON.stringify({ error: 'Unauthorized email operation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
    }

    // Get Resend API Key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const isSandbox = !resendApiKey || resendApiKey === 're_your_api_key';

    // Base site url for links
    const siteUrl = variables.site_url || 'https://valyreyes.com';

    // Helper to get name and email
    const getUserEmailAndName = async (userId: string) => {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email, display_name, name')
        .eq('id', userId)
        .single()
      
      let email = profile?.email;
      let name = profile?.display_name || profile?.name;

      if (!email) {
        const { data } = await adminClient.auth.admin.getUserById(userId)
        email = data?.user?.email;
        name = name || data?.user?.user_metadata?.name || data?.user?.email?.split('@')[0];
      }

      return { email, name: name || 'Fan' };
    }

    // Fetch Email Template
    let templateName = event;
    if (event === 'custom_bulk') {
      templateName = 'welcome'; // We use the standard welcome wrapper structure for custom emails
    }

    const { data: dbTemplate } = await adminClient
      .from('email_templates')
      .select('subject, html_content')
      .eq('name', templateName)
      .single()

    const baseSubject = dbTemplate?.subject || 'Notification from ValyryeFans';
    const baseHtml = dbTemplate?.html_content || '<div>{{body}}</div>';

    // Determine Recipients
    const recipientsList: { email: string; name: string }[] = [];

    if (event === 'custom_bulk') {
      if (recipientEmail) {
        recipientsList.push({ email: recipientEmail, name: recipientEmail.split('@')[0] });
      } else if (recipientsGroup) {
        let query = adminClient.from('profiles').select('id, email, display_name, name');
        if (recipientsGroup === 'subscribers') {
          query = query.eq('tier', 'gold').eq('email_subscription_alerts', true);
        } else if (recipientsGroup === 'fans') {
          query = query.eq('tier', 'free').eq('email_new_post', true);
        } else {
          // 'all'
          query = query.or('email_new_post.eq.true,email_subscription_alerts.eq.true');
        }
        
        const { data: users } = await query;
        if (users) {
          for (const u of users) {
            let email = u.email;
            if (!email) {
              const { data } = await adminClient.auth.admin.getUserById(u.id);
              email = data?.user?.email;
            }
            if (email) {
              recipientsList.push({ email, name: u.display_name || u.name || 'Fan' });
            }
          }
        }
      }
    } else if (event === 'new_post') {
      // Send to all Gold VIP subscribers who opted in
      const { data: users } = await adminClient
        .from('profiles')
        .select('id, email, display_name, name')
        .eq('tier', 'gold')
        .eq('email_new_post', true);

      if (users) {
        for (const u of users) {
          let email = u.email;
          if (!email) {
            const { data } = await adminClient.auth.admin.getUserById(u.id);
            email = data?.user?.email;
          }
          if (email) {
            recipientsList.push({ email, name: u.display_name || u.name || 'Fan' });
          }
        }
      }
    } else {
      // Single targeted email (welcome, new_message, new_subscription, expiring_subscription)
      if (recipientId) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('email, display_name, name, email_new_message, email_subscription_alerts')
          .eq('id', recipientId)
          .single();

        let email = profile?.email;
        let name = profile?.display_name || profile?.name;

        let shouldSend = true;
        if (event === 'new_message' && profile && profile.email_new_message === false) {
          shouldSend = false;
        }
        if ((event === 'new_subscription' || event === 'expiring_subscription') && profile && profile.email_subscription_alerts === false) {
          shouldSend = false;
        }

        if (!email) {
          const { data } = await adminClient.auth.admin.getUserById(recipientId);
          email = data?.user?.email;
          name = name || data?.user?.user_metadata?.name || data?.user?.email?.split('@')[0];
        }

        if (email && shouldSend) {
          recipientsList.push({ email, name: name || 'Fan' });
        }
      } else if (recipientEmail) {
        recipientsList.push({ email: recipientEmail, name: 'Fan' });
      }
    }

    if (recipientsList.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No recipients found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Default Sender (Resend onboarding domain or custom domain)
    // If user hasn't verified domain yet, Resend forces using 'onboarding@resend.dev'
    const fromAddress = isSandbox 
      ? 'ValyryeFans <sandbox@valyreyes.com>'
      : 'ValyryeFans <noreply@valyreyes.com>';

    // Prepare emails compile and send
    const results = [];
    const resendBatch = [];

    for (const recipient of recipientsList) {
      const mergedVariables = {
        name: recipient.name,
        url: siteUrl,
        ...variables
      };

      let compiledSubject = baseSubject;
      let compiledHtml = baseHtml;

      if (event === 'custom_bulk') {
        compiledSubject = customSubject || 'Message from ValyryeFans';
        // Insert custom body into the HTML wrapper
        compiledHtml = baseHtml.replace('{{welcome}}', recipient.name)
                              .replace('{{name}}', recipient.name)
                              .replace('Thanks for joining my official fan club. I am so excited to have you here! You now have access to my public feed, and you can upgrade to Gold tier anytime to unlock my entire vault of 200+ exclusive photos and videos, request custom content, and chat with me directly.', customBody || '');
      } else {
        // Run standard replacements
        for (const [key, value] of Object.entries(mergedVariables)) {
          compiledSubject = compiledSubject.replaceAll(`{{${key}}}`, value || '');
          compiledHtml = compiledHtml.replaceAll(`{{${key}}}`, value || '');
        }
      }

      resendBatch.push({
        from: fromAddress,
        to: [recipient.email],
        subject: compiledSubject,
        html: compiledHtml,
        // Save meta for logging
        _meta: {
          recipient: recipient.email,
          subject: compiledSubject,
          body: compiledHtml,
        }
      });
    }

    // If sandbox / log-only, we bypass actual API delivery but log everything
    if (isSandbox) {
      console.log(`[Email Sandbox] Resend API Key is missing or sandbox. Simulating delivery of ${resendBatch.length} email(s)...`);
      
      const insertLogs = resendBatch.map(item => ({
        recipient: item._meta.recipient,
        subject: item._meta.subject,
        body: item._meta.body,
        status: 'sent',
        error_message: 'Delivered in Sandbox/Mock Mode'
      }));

      await adminClient.from('sent_emails').insert(insertLogs);

      return new Response(JSON.stringify({ 
        success: true, 
        sandbox: true, 
        deliveredCount: resendBatch.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Send Live Emails via Resend API
    // If it's a single email, use standard endpoint. For multiple, use batch send endpoint.
    if (resendBatch.length === 1) {
      const mail = resendBatch[0];
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: mail.from,
          to: mail.to,
          subject: mail.subject,
          html: mail.html,
        }),
      });

      const resText = await resendRes.text();
      let resJson: any = {};
      try { resJson = JSON.parse(resText); } catch(_) {}

      const success = resendRes.status >= 200 && resendRes.status < 300;

      // Log to Database
      await adminClient.from('sent_emails').insert({
        recipient: mail._meta.recipient,
        subject: mail._meta.subject,
        body: mail._meta.body,
        status: success ? 'sent' : 'failed',
        error_message: success ? null : (resJson?.message || resText || `HTTP ${resendRes.status}`)
      });

      if (!success) {
        throw new Error(resJson?.message || resText || `Failed to send email via Resend (Status ${resendRes.status})`);
      }

      results.push({ email: mail._meta.recipient, success: true });
    } else {
      // Send in chunks of 100 (Resend batch limit)
      const chunkSize = 100;
      for (let i = 0; i < resendBatch.length; i += chunkSize) {
        const chunk = resendBatch.slice(i, i + chunkSize);
        
        const resendRes = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk.map(m => ({
            from: m.from,
            to: m.to,
            subject: m.subject,
            html: m.html,
          }))),
        });

        const resText = await resendRes.text();
        let resJson: any = {};
        try { resJson = JSON.parse(resText); } catch(_) {}

        const success = resendRes.status >= 200 && resendRes.status < 300;

        // Log results to Database
        const logs = chunk.map((mail, idx) => {
          const itemSuccess = success && (!resJson?.data || resJson.data[idx]?.id);
          const itemErr = success 
            ? (resJson.data?.[idx]?.error?.message || null) 
            : (resJson?.message || resText || `HTTP ${resendRes.status}`);

          return {
            recipient: mail._meta.recipient,
            subject: mail._meta.subject,
            body: mail._meta.body,
            status: itemSuccess ? 'sent' : 'failed',
            error_message: itemSuccess ? null : itemErr
          };
        });

        await adminClient.from('sent_emails').insert(logs);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deliveredCount: resendBatch.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[Email Error] ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const getCorsHeaders = (origin: string | null) => {
  let allowedOrigin = 'https://valyryesfans.com'
  if (origin) {
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin === 'https://valyreyes.com' ||
      origin === 'https://valyryesfans.com' ||
      origin === 'https://valyryefans.com' ||
      origin.endsWith('.valyreyes.com') ||
      origin.endsWith('.valyryesfans.com') ||
      origin.endsWith('.valyryefans.com')
    ) {
      allowedOrigin = origin
    }
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return false
  return (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin === 'https://valyreyes.com' ||
    origin === 'https://valyryesfans.com' ||
    origin === 'https://valyryefans.com' ||
    origin.endsWith('.valyreyes.com') ||
    origin.endsWith('.valyryesfans.com') ||
    origin.endsWith('.valyryefans.com')
  )
}

serve(async (req) => {
  const originHeader = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(originHeader)

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated')
    }

    const { type, amount, contentId, message, successPath, cancelPath, origin: customOrigin } = await req.json()
    
    // Secure origin verification to prevent open redirect
    const requestOrigin = originHeader || 'http://localhost:8000'
    const rawOrigin = customOrigin || requestOrigin
    const origin = isAllowedOrigin(rawOrigin) ? rawOrigin : 'https://valyryesfans.com'

    // Helper to securely build redirect URLs back to correct hash routes
    const getRedirectUrl = (path: string | null | undefined, defaultPath: string) => {
      const relativePath = path || defaultPath;
      const separator = relativePath.startsWith('/') ? '' : '/';
      return `${origin}${separator}${relativePath}`;
    };

    let session;

    if (type === 'subscription') {
      // Create a Stripe checkout session for Gold tier subscription
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Gold VIP Access',
              description: 'Unlock all exclusive content & direct messaging with Valyryes',
            },
            unit_amount: 1499, // $14.99 in cents
          },
          quantity: 1,
        }],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: getRedirectUrl(successPath, '#/welcome-gold'),
        cancel_url: getRedirectUrl(cancelPath, '#/subscribe'),
        metadata: {
          userId: user.id,
          type: 'subscription'
        }
      });

    } else if (type === 'tip') {
      // Create a direct Payment Checkout Session for tipping
      const parsedAmount = parseFloat(amount)
      if (!amount || isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid tip amount')
      }

      // Limit precision and round to 2 decimal places to match Stripe/DB
      const finalAmount = Math.round(parsedAmount * 100) / 100
      if (finalAmount <= 0) {
        throw new Error('Invalid tip amount')
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support Tip to Valyryes',
              description: contentId ? `Tip for post #${contentId.substring(0, 8)}` : 'One-time support tip'
            },
            unit_amount: Math.round(finalAmount * 100), // in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: getRedirectUrl(successPath, '#/gallery'),
        cancel_url: getRedirectUrl(cancelPath, '#/gallery'),
        metadata: {
          userId: user.id,
          type: 'tip',
          amount: finalAmount.toString(),
          contentId: contentId || '',
          message: message || ''
        }
      });
    } else {
      throw new Error('Invalid transaction type')
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

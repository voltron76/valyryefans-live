import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated')
    }

    const { type, amount, contentId, origin: customOrigin } = await req.json()
    const requestOrigin = req.headers.get('origin') || 'http://localhost:8000'
    const origin = customOrigin || requestOrigin

    let session;

    if (type === 'subscription') {
      // Create Subscription Checkout Session
      // We will look up or create a Stripe customer
      let stripeCustomerId = '';
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        stripeCustomerId = profile.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        stripeCustomerId = customer.id;
        // Save customer ID in profiles
        await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }

      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: 'Gold VIP Subscription',
              description: 'Unlimited access to all premium photos and videos, direct messaging, and priority response.'
            },
            unit_amount: 1499, // $14.99 in cents
          },
          quantity: 1,
        }],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: `${origin}/#/welcome-gold`,
        cancel_url: `${origin}/#/subscribe`,
        metadata: {
          userId: user.id,
          type: 'subscription'
        }
      });

    } else if (type === 'tip') {
      // Create a direct Payment Checkout Session for tipping
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid tip amount')
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support Tip to Valyrye',
              description: contentId ? `Tip for post #${contentId.substring(0, 8)}` : 'One-time support tip'
            },
            unit_amount: Math.round(amount * 100), // in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${origin}/#/gallery`,
        cancel_url: `${origin}/#/gallery`,
        metadata: {
          userId: user.id,
          type: 'tip',
          amount: amount.toString(),
          contentId: contentId || ''
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

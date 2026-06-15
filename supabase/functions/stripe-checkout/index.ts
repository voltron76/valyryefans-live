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

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

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

    // Verify user is authenticated by passing the explicit token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated')
    }

    const { type, amount, contentId } = await req.json()

    // Validate amount securely
    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid amount')
    }

    // Limit precision and round to 2 decimal places to match Stripe/DB
    const finalAmount = Math.round(parsedAmount * 100) / 100
    if (finalAmount <= 0) {
      throw new Error('Invalid amount')
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: user.id,
        type: type, // 'subscription' or 'tip'
        contentId: contentId || '',
        amount: finalAmount.toString()
      }
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
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

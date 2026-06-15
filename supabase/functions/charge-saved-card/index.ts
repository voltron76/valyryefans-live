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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error(authError?.message || 'Not authenticated')
    }

    const { amount, contentId, message } = await req.json()

    // Validate amount securely
    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid tip amount')
    }

    // Limit precision and round to 2 decimal places to match database/Stripe expectations
    const finalAmount = Math.round(parsedAmount * 100) / 100
    if (finalAmount <= 0) {
      throw new Error('Invalid tip amount')
    }

    // Initialize admin client to query Stripe customer details
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch user's stripe_customer_id from profiles
    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile?.stripe_customer_id) {
      throw new Error('No saved card on file (customer record missing)')
    }

    const customerId = profile.stripe_customer_id

    // 2. Retrieve the customer's saved payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    const paymentMethodId = paymentMethods.data?.[0]?.id

    if (!paymentMethodId) {
      throw new Error('No saved payment methods found for this customer')
    }

    // 3. Create and confirm PaymentIntent off-session (direct charge)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        userId: user.id,
        type: 'tip',
        amount: finalAmount.toString(),
        contentId: contentId || '',
        oneClick: 'true'
      }
    })

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`)
    }

    // 4. Record tip transaction in database
    const { error: tipError } = await adminClient
      .from('tips')
      .insert([{
        user_id: user.id,
        content_id: contentId || null,
        amount: finalAmount,
        message: message || 'Paid via One-Click Saved Card'
      }])

    if (tipError) {
      console.error('[Charge Saved Card] Failed to log tip in DB:', tipError)
    }

    // 5. Increment creator profile balance atomically using secure RPC
    const { error: balanceError } = await adminClient.rpc('increment_admin_balance', {
      amount_to_add: finalAmount
    })

    if (balanceError) {
      console.error('[Charge Saved Card] Failed to update creator balance atomically:', balanceError)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment charged successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error(`[Charge Saved Card Error] ${error.message}`)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

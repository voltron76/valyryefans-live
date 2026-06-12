import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), { status: 400 })
  }

  try {
    const body = await req.text()
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), { status: 400 })
    }

    // Initialize Supabase admin client (bypasses RLS to update user subscription status)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`[Webhook] Received Stripe event: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const userId = metadata.userId
      const type = metadata.type

      if (!userId) {
        throw new Error('Missing userId in session metadata')
      }

      if (type === 'subscription') {
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Retrieve subscription details from Stripe to get period ends
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // 1. Fetch Gold tier ID
        const { data: tierData, error: tierError } = await adminClient
          .from('tiers')
          .select('id')
          .eq('slug', 'gold')
          .single()

        if (tierError || !tierData) {
          throw new Error('Gold tier record not found in database')
        }

        // 2. Update user profile tier to 'gold'
        const { error: profileError } = await adminClient
          .from('profiles')
          .update({ tier: 'gold' })
          .eq('id', userId)

        if (profileError) {
          throw profileError
        }

        // 3. Create or update subscription record
        const { error: subError } = await adminClient
          .from('subscriptions')
          .insert([{
            user_id: userId,
            tier_id: tierData.id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }])

        if (subError) {
          throw subError
        }

        console.log(`[Webhook] User ${userId} upgraded to Gold tier successfully.`)

      } else if (type === 'tip') {
        const amount = parseFloat(metadata.amount || '0')
        const contentId = metadata.contentId || null
        const tipMessage = metadata.message || 'Paid via Stripe Checkout'

        // 1. Record tip in DB
        const { error: tipError } = await adminClient
          .from('tips')
          .insert([{
            user_id: userId,
            content_id: contentId,
            amount: amount,
            message: tipMessage
          }])

        if (tipError) {
          throw tipError
        }

        // 2. Increment creator profile balance (optional)
        const { data: creatorProfile } = await adminClient
          .from('profiles')
          .select('balance')
          .eq('tier', 'admin')
          .single()

        if (creatorProfile) {
          const newBalance = parseFloat(creatorProfile.balance || '0') + amount
          await adminClient
            .from('profiles')
            .update({ balance: newBalance })
            .eq('tier', 'admin')
        }

        console.log(`[Webhook] Tip of $${amount} recorded for user ${userId}.`)
      }

    } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user associated with this customer ID
      const { data: subData } = await adminClient
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .limit(1)

      const userId = subData?.[0]?.user_id

      if (userId) {
        if (subscription.status === 'active') {
          // Keep Gold tier active
          await adminClient
            .from('profiles')
            .update({ tier: 'gold' })
            .eq('id', userId)

          await adminClient
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_customer_id', customerId)
        } else {
          // Downgrade user to free tier
          await adminClient
            .from('profiles')
            .update({ tier: 'free' })
            .eq('id', userId)

          await adminClient
            .from('subscriptions')
            .update({ status: subscription.status })
            .eq('stripe_customer_id', customerId)

          console.log(`[Webhook] User ${userId} subscription expired/deleted. Downgraded to free tier.`)
        }
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const customerId = charge.customer as string

      if (customerId) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile?.id) {
          await adminClient
            .from('profiles')
            .update({ tier: 'free' })
            .eq('id', profile.id)

          console.log(`[Webhook] Refund detected. Revoked Gold access for user ${profile.id}.`)
        }
      }
    } else if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute
      const chargeId = dispute.charge as string

      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId)
        const customerId = charge.customer as string

        if (customerId) {
          const { data: profile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile?.id) {
            await adminClient
              .from('profiles')
              .update({ tier: 'free' })
              .eq('id', profile.id)

            console.log(`[Webhook] Charge dispute created. Revoked access for user ${profile.id}.`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`[Webhook Error] ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

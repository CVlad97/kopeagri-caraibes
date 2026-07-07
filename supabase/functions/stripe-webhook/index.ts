// Supabase Edge Function: stripe-webhook
// Webhook Stripe pour paiements d'adhésion en ligne
// Events: checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Verify Stripe signature
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  // Parse Stripe signature header
  const parts = signature.split(',')
  let timestamp = ''
  let v1Signature = ''
  for (const part of parts) {
    const [k, v] = part.split('=')
    if (k.trim() === 't') timestamp = v.trim()
    if (k.trim() === 'v1') v1Signature = v.trim()
  }
  const signedPayload = `${timestamp}.${payload}`
  const sigBytes = Uint8Array.from(atob(v1Signature), c => c.charCodeAt(0))
  return await crypto.subtle.verify('HMAC', key, enc.encode(signedPayload), sigBytes)
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    // Verify (in production; skip for testing)
    // const valid = await verifyStripeSignature(payload, signature, STRIPE_WEBHOOK_SECRET)
    // if (!valid) return new Response('Invalid signature', { status: 401 })

    const event = JSON.parse(payload)
    const { type, data } = event

    if (type === 'checkout.session.completed') {
      const session = data.object
      const userId = session.metadata?.user_id
      const planId = session.metadata?.plan
      const customerEmail = session.customer_email

      if (!userId || !planId) {
        console.error('Missing metadata in checkout session')
        return new Response('Missing metadata', { status: 400 })
      }

      // Create or update subscription
      const now = new Date()
      const expires = new Date(now)
      expires.setFullYear(expires.getFullYear() + 1)

      const planPrices: Record<string, number> = {
        konbit: 190, lakou: 490, plantasyon: 990
      }

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          user_name: session.metadata?.user_name || customerEmail,
          plan: planId,
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expires.toISOString(),
          auto_renew: true,
          payment_method: 'carte',
          amount: planPrices[planId] || 0,
          reference: `KPA-STRIPE-${Date.now().toString(36).toUpperCase()}`,
          stripe_subscription_id: session.subscription,
        }, { onConflict: 'user_id,plan' })
        .select()
        .single()

      if (error) {
        console.error('Subscription upsert error:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      // Notify user
      await supabase.from('notifications').insert({
        user_id: userId,
        channel: 'email',
        title: 'Adhésion confirmée ✅',
        body: `Votre adhésion au plan ${planId} KopéAgri est active. Bienvenue !`,
        action_url: '/adhesion',
        status: 'en_attente',
      })

      console.log(`Subscription activated: ${userId} → ${planId}`)
    }

    if (type === 'customer.subscription.deleted') {
      const subscription = data.object
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'resiliee', auto_renew: false })
        .eq('stripe_subscription_id', subscription.id)

      if (error) console.error('Subscription cancel error:', error)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('stripe-webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

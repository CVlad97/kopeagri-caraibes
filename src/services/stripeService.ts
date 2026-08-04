// ===== STRIPE CHECKOUT SERVICE =====
// Handles Stripe Checkout Sessions for KopéAgri subscription plans
// In production, Checkout Sessions are created server-side via Supabase Edge Functions.
// Here we provide a client-side redirect flow + mock for demo mode.

import { HAS_CREDENTIALS } from '../lib/supabase'

// Stripe Price IDs — create these in Stripe Dashboard → Products
// After creating products, replace these with real price_ IDs
export const STRIPE_PRICES: Record<string, { priceId: string; amount: number; label: string }> = {
  konbit:          { priceId: 'price_konbit_monthly',          amount: 900,   label: 'Konbit — 9€/mois' },
  plantasyon:     { priceId: 'price_plantasyon_monthly',       amount: 2900,  label: 'Plantasyon — 29€/mois' },
  rekot:          { priceId: 'price_rekot_monthly',            amount: 5900,  label: 'Rékoté — 59€/mois' },
  plantasyon_pro: { priceId: 'price_plantasyon_pro_monthly',   amount: 14900, label: 'Plantasyon Pro — 149€/mois' },
  konbit_annuel:       { priceId: 'price_konbit_annual',       amount: 9180,   label: 'Konbit — 91.80€/an (-15%)' },
  plantasyon_annuel:   { priceId: 'price_plantasyon_annual',    amount: 29580,  label: 'Plantasyon — 295.80€/an (-15%)' },
  rekot_annuel:        { priceId: 'price_rekot_annual',         amount: 60180,  label: 'Rékoté — 601.80€/an (-15%)' },
  plantasyon_pro_annuel: { priceId: 'price_plantasyon_pro_annual', amount: 152580, label: 'Plantasyon Pro — 1,525.80€/an (-15%)' },
}

// Checkout success/cancel URLs
const SUCCESS_URL = `${window.location.origin}/dashboard?checkout=success`
const CANCEL_URL = `${window.location.origin}/pricing?checkout=cancelled`

export interface CheckoutOptions {
  planId: string
  email: string
  fullName: string
  isAnnual?: boolean
}

/**
 * Redirect to Stripe Checkout.
 * In production: calls Supabase Edge Function `create-checkout` which creates a Checkout Session.
 * In demo: shows a WhatsApp payment link.
 */
export async function redirectToCheckout(opts: CheckoutOptions): Promise<{ url: string | null; error: string | null }> {
  const priceKey = opts.isAnnual ? `${opts.planId}_annuel` : opts.planId
  const price = STRIPE_PRICES[priceKey]
  if (!price) return { url: null, error: `Plan ${priceKey} non trouvé` }

  // Try Stripe Checkout via Edge Function
  if (HAS_CREDENTIALS) {
    try {
      const { supabase } = await import('../lib/supabase')
      const { data, error } = await supabase.rpc('create-checkout', {
        price_id: price.priceId,
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
        customer_email: opts.email,
        metadata: { full_name: opts.fullName, plan: opts.planId },
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
        return { url: data.url, error: null }
      }
    } catch {
      // Fall through to WhatsApp
    }
  }

  // Fallback: WhatsApp payment link
  const msg = encodeURIComponent(
    `🌴 KopéAgri Caraïbes — Adhésion\n\n` +
    `Plan: ${price.label}\n` +
    `Montant: ${(price.amount / 100).toFixed(2)}€\n` +
    `Nom: ${opts.fullName}\n` +
    `Email: ${opts.email}\n\n` +
    `Je souhaite finaliser mon adhésion. Merci de m'envoyer les informations de paiement.`
  )
  const waUrl = `https://wa.me/596696653589?text=${msg}`
  return { url: waUrl, error: null }
}

/**
 * Check if Stripe is fully configured (has real price IDs)
 */
export function isStripeConfigured(): boolean {
  return Object.values(STRIPE_PRICES).some(p => p.priceId.startsWith('price_') && p.priceId !== `price_${p.priceId.split('_')[1]}_monthly`)
}

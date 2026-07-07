// ===== SERVICE ADHÉSION KOPÉAGRI — Supabase First, localStorage Fallback =====
import { supabase } from '../lib/supabase'
import type { Subscription, PlanType, SubStatus } from '../lib/types'

const SUB_KEY = 'kopeagri_subscriptions'

function getLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ===== PLANS =====
export const PLANS = [
  {
    id: 'gratuit' as PlanType,
    name: 'Konbit Liberté',
    price: 0,
    period: '/an',
    features: ['Profil coopérative', 'Accès annuaire membres', 'Réception appels d\'offre', 'WhatsApp support'],
    commission: 6,
    color: '#6B7280',
    icon: '🤝',
  },
  {
    id: 'konbit' as PlanType,
    name: 'Konbit Standard',
    price: 190,
    period: '/an',
    features: ['Tout le plan Gratuit', 'Création appels d\'offre', 'Matching transporteurs', 'Facturation simple (5/mois)', 'Badge vérifié'],
    commission: 4,
    color: '#2E7D32',
    icon: '🌱',
  },
  {
    id: 'lakou' as PlanType,
    name: 'Lakou Premium',
    price: 490,
    period: '/an',
    features: ['Tout le plan Konbit', 'Facturation illimitée', 'Qonto synchro', 'Géolocalisation parcelles', 'Statistiques avancées', 'Support prioritaire'],
    commission: 3,
    color: '#F59E0B',
    icon: '🏡',
  },
  {
    id: 'plantasyon' as PlanType,
    name: 'Plantasyon Coopérative',
    price: 990,
    period: '/an',
    features: ['Tout le plan Lakou', 'Multi-utilisateurs (5)', 'API intégrations', 'Export compta', 'Calendrier saisonnier', 'Gestion parcelles complète', 'Account manager dédié'],
    commission: 2,
    color: '#7C3AED',
    icon: '🏘️',
  },
]

export function getPlanById(id: PlanType) {
  return PLANS.find(p => p.id === id)
}

// ===== SUBSCRIPTIONS CRUD =====
export async function getAllSubscriptions(): Promise<Subscription[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
    if (!error && data) return data as Subscription[]
  }
  return getLocal<Subscription>(SUB_KEY)
}

export async function getSubscriptionById(id: string): Promise<Subscription | undefined> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('id', id).single()
    if (!error && data) return data as Subscription
  }
  return getLocal<Subscription>(SUB_KEY).find(s => s.id === id)
}

export async function createSubscription(sub: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
  const now = new Date().toISOString()
  const newItem = { ...sub, id: crypto.randomUUID(), created_at: now, updated_at: now } as Subscription
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('subscriptions').insert(newItem).select()
    if (!error && data?.[0]) return data[0] as Subscription
  }
  const all = getLocal<Subscription>(SUB_KEY)
  all.push(newItem)
  setLocal(SUB_KEY, all)
  return newItem
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('subscriptions').update(updated).eq('id', id).select()
    if (!error && data?.[0]) return data[0] as Subscription
  }
  const all = getLocal<Subscription>(SUB_KEY)
  const idx = all.findIndex(s => s.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...updated }
  setLocal(SUB_KEY, all)
  return all[idx]
}

export async function deleteSubscription(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (!error) return true
  }
  const all = getLocal<Subscription>(SUB_KEY)
  const idx = all.findIndex(s => s.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  setLocal(SUB_KEY, all)
  return true
}

// ===== CHECKOUT SIMULATION =====
export function simulateCheckout(planId: PlanType, userName: string, userId: string): { url: string; reference: string } {
  const plan = getPlanById(planId)
  if (!plan) return { url: '', reference: '' }
  const ref = `KPA-CHECKOUT-${Date.now().toString(36).toUpperCase()}`
  return {
    url: `https://checkout.stripe.com/pay/${ref}`,
    reference: ref,
  }
}

// ===== COMMISSIONS =====
export function calcCommission(plan: PlanType, amount: number): number {
  const p = getPlanById(plan)
  const rate = p?.commission || 6
  return Math.round(amount * rate / 100 * 100) / 100
}

// ===== EXPORTS =====
export function exportSubscriptionsCSV(subs: Subscription[]): string {
  const headers = ['Référence', 'Membre', 'Plan', 'Statut', 'Montant', 'Début', 'Expiration', 'Renouvellement auto', 'Méthode paiement']
  const rows = subs.map(s => [
    s.reference, s.user_name, s.plan, s.status, s.amount,
    s.started_at?.slice(0, 10), s.expires_at?.slice(0, 10),
    s.auto_renew ? 'Oui' : 'Non', s.payment_method,
  ])
  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
}

// ===== SEED =====
const SUB_SEED_KEY = 'kopeagri_sub_seeded'

export function seedSubscriptionsIfEmpty(): void {
  if (supabase.isConfigured) return
  if (localStorage.getItem(SUB_SEED_KEY)) return
  const now = new Date().toISOString()
  const subs: Subscription[] = [
    {
      id: 'sub1', user_id: 'admin', user_name: 'Admin KopéAgri', plan: 'plantasyon',
      status: 'active', started_at: now, expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      auto_renew: true, payment_method: 'virement', amount: 990,
      reference: 'KPA-2026-0001', stripe_subscription_id: null,
      created_at: now, updated_at: now,
    },
    {
      id: 'sub2', user_id: 'p1', user_name: 'Habitation Clément', plan: 'lakou',
      status: 'active', started_at: now, expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      auto_renew: true, payment_method: 'cheque', amount: 490,
      reference: 'KPA-2026-0002', stripe_subscription_id: null,
      created_at: now, updated_at: now,
    },
    {
      id: 'sub3', user_id: 'p2', user_name: 'Domaine Montagne Pelée', plan: 'konbit',
      status: 'active', started_at: now, expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      auto_renew: true, payment_method: 'especes', amount: 190,
      reference: 'KPA-2026-0003', stripe_subscription_id: null,
      created_at: now, updated_at: now,
    },
    {
      id: 'sub4', user_id: 'p3', user_name: 'Ferme Aublet', plan: 'gratuit',
      status: 'active', started_at: now, expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      auto_renew: false, payment_method: 'virement', amount: 0,
      reference: 'KPA-2026-0004', stripe_subscription_id: null,
      created_at: now, updated_at: now,
    },
  ]
  setLocal(SUB_KEY, subs)
  localStorage.setItem(SUB_SEED_KEY, '1')
}

seedSubscriptionsIfEmpty()

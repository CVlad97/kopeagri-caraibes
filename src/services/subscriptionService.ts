// ===== SYSTÈME D'ADHÉSION KOPÉAGRI =====

export type PlanType = 'gratuit' | 'konbit' | 'lakou' | 'plantasyon'
export type SubscriptionStatus = 'active' | 'en_attente' | 'expiree' | 'resiliee'

export interface Plan {
  id: PlanType
  name: string
  price: number        // €/mois
  priceAnnual: number  // €/an
  emoji: string
  description: string
  features: string[]
  popular?: boolean
  maxRFQ: number       // appels d'offre par mois (-1 = illimité)
  maxProducts: number  // fiches produits
  maxPartners: number  // partenaires visibles
  whatsappBroadcast: boolean
  exportData: boolean
  priorityMatching: boolean
  commission: number    // % commission sur transactions
}

export interface Subscription {
  id: string
  user_id: string
  user_name: string
  plan: PlanType
  status: SubscriptionStatus
  started_at: string    // ISO date
  expires_at: string    // ISO date
  auto_renew: boolean
  payment_method: 'virement' | 'cheque' | 'especes' | 'mobile_money'
  amount: number
  reference: string     // réf paiement
}

export interface Commission {
  id: string
  subscription_id: string
  rfq_id: string
  amount: number        // montant en €
  commission_rate: number // %
  status: 'a_payer' | 'payee' | 'en_attente'
  created_at: string
  paid_at?: string
}

// ===== PLANS =====

export const PLANS: Plan[] = [
  {
    id: 'gratuit',
    name: 'Zéro',
    price: 0,
    priceAnnual: 0,
    emoji: '🌱',
    description: 'Découvrir KopéAgri gratuitement',
    features: [
      '1 appel d\'offre par mois',
      '3 fiches producteurs',
      '5 partenaires visibles',
      'WhatsApp contact individuel',
      'Profil de base',
    ],
    maxRFQ: 1,
    maxProducts: 3,
    maxPartners: 5,
    whatsappBroadcast: false,
    exportData: false,
    priorityMatching: false,
    commission: 8,
  },
  {
    id: 'konbit',
    name: 'Konbit',
    price: 19,
    priceAnnual: 190,
    emoji: '🤝',
    description: 'Pour les producteurs actifs',
    features: [
      '10 appels d\'offre par mois',
      '25 fiches producteurs',
      '50 partenaires visibles',
      'WhatsApp broadcast groupé',
      'Export CSV données',
      'Matching prioritaire',
      'Badge Konbit sur le profil',
    ],
    maxRFQ: 10,
    maxProducts: 25,
    maxPartners: 50,
    whatsappBroadcast: true,
    exportData: true,
    priorityMatching: true,
    commission: 5,
    popular: true,
  },
  {
    id: 'lakou',
    name: 'Lakou',
    price: 49,
    priceAnnual: 490,
    emoji: '🏡',
    description: 'Pour les coopératives et acheteurs',
    features: [
      'Appels d\'offre illimités',
      'Fiches illimitées',
      'Partenaires illimités',
      'WhatsApp broadcast + notifications auto',
      'Export complet (CSV, PDF)',
      'Matching prioritaire + géolocalisation',
      'Dashboard analytics',
      'Badge Lakou vérifié',
      'Support dédié WhatsApp',
    ],
    maxRFQ: -1,
    maxProducts: -1,
    maxPartners: -1,
    whatsappBroadcast: true,
    exportData: true,
    priorityMatching: true,
    commission: 3,
  },
  {
    id: 'plantasyon',
    name: 'Plantasyon',
    price: 99,
    priceAnnual: 990,
    emoji: '🌴',
    description: 'Pour les institutions et grands comptes',
    features: [
      'Tout Lakou +',
      'Multi-utilisateurs (5 comptes)',
      'API d\'intégration',
      'Rapports personnalisés',
      'Formation dédiée',
      'Page partenaire mise en avant',
      'Commission réduite 2%',
      'Account manager dédié',
    ],
    maxRFQ: -1,
    maxProducts: -1,
    maxPartners: -1,
    whatsappBroadcast: true,
    exportData: true,
    priorityMatching: true,
    commission: 2,
  },
]

const SUBSCRIPTIONS_KEY = 'kopeagri_subscriptions_v1'
const COMMISSIONS_KEY = 'kopeagri_commissions_v1'

// ===== CRUD SUBSCRIPTIONS =====

export function getAllSubscriptions(): Subscription[] {
  const raw = localStorage.getItem(SUBSCRIPTIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveSubscriptions(subs: Subscription[]) {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs))
}

export function createSubscription(data: Omit<Subscription, 'id' | 'reference'>): Subscription {
  const subs = getAllSubscriptions()
  const sub: Subscription = {
    ...data,
    id: crypto.randomUUID(),
    reference: `KPA-${Date.now().toString(36).toUpperCase()}`,
  }
  subs.push(sub)
  saveSubscriptions(subs)
  return sub
}

export function updateSubscription(id: string, data: Partial<Subscription>): void {
  const subs = getAllSubscriptions()
  const idx = subs.findIndex(s => s.id === id)
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], ...data }
    saveSubscriptions(subs)
  }
}

export function getActiveSubscription(userId: string): Subscription | null {
  const subs = getAllSubscriptions()
  return subs.find(s => s.user_id === userId && s.status === 'active') || null
}

export function getPlanForUser(userId: string): Plan {
  const sub = getActiveSubscription(userId)
  if (!sub) return PLANS[0] // gratuit
  return PLANS.find(p => p.id === sub.plan) || PLANS[0]
}

// ===== COMMISSIONS =====

export function getAllCommissions(): Commission[] {
  const raw = localStorage.getItem(COMMISSIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveCommissions(comms: Commission[]) {
  localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(comms))
}

export function createCommission(data: Omit<Commission, 'id' | 'created_at'>): Commission {
  const comms = getAllCommissions()
  const comm: Commission = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  comms.push(comm)
  saveCommissions(comms)
  return comm
}

export function markCommissionPaid(id: string): void {
  const comms = getAllCommissions()
  const idx = comms.findIndex(c => c.id === id)
  if (idx >= 0) {
    comms[idx].status = 'payee'
    comms[idx].paid_at = new Date().toISOString()
    saveCommissions(comms)
  }
}

// ===== CHECK QUOTA =====

export function canCreateRFQ(userId: string, currentRFQCount: number): boolean {
  const plan = getPlanForUser(userId)
  return plan.maxRFQ === -1 || currentRFQCount < plan.maxRFQ
}

export function canAddProduct(userId: string, currentProductCount: number): boolean {
  const plan = getPlanForUser(userId)
  return plan.maxProducts === -1 || currentProductCount < plan.maxProducts
}

// ===== SEED DÉMO =====

export function seedSubscriptionsIfEmpty() {
  const subs = getAllSubscriptions()
  if (subs.length > 0) return

  const now = new Date()
  const expires = new Date(now)
  expires.setFullYear(expires.getFullYear() + 1)

  const demoSubs: Subscription[] = [
    {
      id: 'demo-sub-1',
      user_id: 'demo-user-1',
      user_name: 'Jean-Pierre Thély',
      plan: 'konbit',
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      auto_renew: true,
      payment_method: 'virement',
      amount: 190,
      reference: 'KPA-DEMO-001',
    },
    {
      id: 'demo-sub-2',
      user_id: 'demo-user-2',
      user_name: 'Coopérative Les Jardins Créoles',
      plan: 'lakou',
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      auto_renew: true,
      payment_method: 'virement',
      amount: 490,
      reference: 'KPA-DEMO-002',
    },
    {
      id: 'demo-sub-3',
      user_id: 'demo-user-3',
      user_name: 'Chambre Agriculture 972',
      plan: 'plantasyon',
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      auto_renew: true,
      payment_method: 'virement',
      amount: 990,
      reference: 'KPA-DEMO-003',
    },
  ]

  saveSubscriptions(demoSubs)

  // Commissions démo
  const demoComms: Commission[] = [
    {
      id: 'demo-comm-1',
      subscription_id: 'demo-sub-2',
      rfq_id: 'demo-rfq-1',
      amount: 15,
      commission_rate: 3,
      status: 'payee',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      paid_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'demo-comm-2',
      subscription_id: 'demo-sub-1',
      rfq_id: 'demo-rfq-2',
      amount: 25,
      commission_rate: 5,
      status: 'a_payer',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'demo-comm-3',
      subscription_id: 'demo-sub-2',
      rfq_id: 'demo-rfq-1',
      amount: 30,
      commission_rate: 3,
      status: 'en_attente',
      created_at: new Date().toISOString(),
    },
  ]

  saveCommissions(demoComms)
}

// Initialiser au chargement
seedSubscriptionsIfEmpty()

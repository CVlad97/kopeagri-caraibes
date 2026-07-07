// ===== KOPÉAGRI DATA SERVICE — Supabase First, localStorage Fallback =====
// All reads/writes try Supabase first. If not connected, fall back to localStorage.
// This file REPLACES the old dataService.ts for production use.

import { supabase } from '../lib/supabase'
import type {
  Producer, LogisticsProvider, Distributor, RFQ, RFQPartner,
  BillingDocument, BillingLine, QontoTransaction,
  Subscription, Notification, Profile, Parcelle,
} from '../lib/types'

// ===== HELPERS =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getLocal<T>(key: string): T[] {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ===== PRODUCERS =====
export async function getProducers(): Promise<Producer[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('producers').select('*').order('name')
    if (!error && data) return data as Producer[]
  }
  return getLocal<Producer>('kopeagri_producers')
}

export async function getActiveProducers(): Promise<Producer[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('producers').select('*').eq('active', true).order('name')
    if (!error && data) return data as Producer[]
  }
  return getLocal<Producer>('kopeagri_producers').filter(p => p.active)
}

export async function addProducer(item: Omit<Producer, 'id' | 'created_at' | 'updated_at'>): Promise<Producer> {
  const now = new Date().toISOString()
  const newItem = { ...item, id: generateId(), created_at: now, updated_at: now } as Producer
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('producers').insert(newItem).select()
    if (!error && data?.[0]) return data[0] as Producer
  }
  const store = getLocal<Producer>('kopeagri_producers')
  store.push(newItem)
  setLocal('kopeagri_producers', store)
  return newItem
}

export async function updateProducer(id: string, updates: Partial<Producer>): Promise<Producer | null> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('producers').update(updated).eq('id', id).select()
    if (!error && data?.[0]) return data[0] as Producer
  }
  const store = getLocal<Producer>('kopeagri_producers')
  const idx = store.findIndex(p => p.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...updated }
  setLocal('kopeagri_producers', store)
  return store[idx]
}

export async function toggleProducerActive(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { data } = await supabase.from('producers').select('active').eq('id', id).single()
    if (data) {
      const { data: updated } = await supabase.from('producers').update({ active: !data.active, updated_at: new Date().toISOString() }).eq('id', id).select()
      return updated?.[0]?.active ?? false
    }
  }
  const store = getLocal<Producer>('kopeagri_producers')
  const idx = store.findIndex(p => p.id === id)
  if (idx === -1) return false
  store[idx].active = !store[idx].active
  setLocal('kopeagri_producers', store)
  return store[idx].active
}

export async function deleteProducer(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { error } = await supabase.from('producers').delete().eq('id', id)
    if (!error) return true
  }
  const store = getLocal<Producer>('kopeagri_producers')
  const idx = store.findIndex(p => p.id === id)
  if (idx === -1) return false
  store.splice(idx, 1)
  setLocal('kopeagri_producers', store)
  return true
}

// ===== LOGISTICS PROVIDERS =====
export async function getLogistics(): Promise<LogisticsProvider[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('logistics_providers').select('*').order('name')
    if (!error && data) return data as LogisticsProvider[]
  }
  return getLocal<LogisticsProvider>('kopeagri_logistics')
}

export async function getActiveLogistics(): Promise<LogisticsProvider[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('logistics_providers').select('*').eq('active', true).order('name')
    if (!error && data) return data as LogisticsProvider[]
  }
  return getLocal<LogisticsProvider>('kopeagri_logistics').filter(l => l.active)
}

export async function addLogistics(item: Omit<LogisticsProvider, 'id' | 'created_at' | 'updated_at'>): Promise<LogisticsProvider> {
  const now = new Date().toISOString()
  const newItem = { ...item, id: generateId(), created_at: now, updated_at: now } as LogisticsProvider
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('logistics_providers').insert(newItem).select()
    if (!error && data?.[0]) return data[0] as LogisticsProvider
  }
  const store = getLocal<LogisticsProvider>('kopeagri_logistics')
  store.push(newItem)
  setLocal('kopeagri_logistics', store)
  return newItem
}

export async function updateLogistics(id: string, updates: Partial<LogisticsProvider>): Promise<LogisticsProvider | null> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('logistics_providers').update(updated).eq('id', id).select()
    if (!error && data?.[0]) return data[0] as LogisticsProvider
  }
  const store = getLocal<LogisticsProvider>('kopeagri_logistics')
  const idx = store.findIndex(l => l.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...updated }
  setLocal('kopeagri_logistics', store)
  return store[idx]
}

export async function toggleLogisticsActive(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { data } = await supabase.from('logistics_providers').select('active').eq('id', id).single()
    if (data) {
      const { data: updated } = await supabase.from('logistics_providers').update({ active: !data.active, updated_at: new Date().toISOString() }).eq('id', id).select()
      return updated?.[0]?.active ?? false
    }
  }
  const store = getLocal<LogisticsProvider>('kopeagri_logistics')
  const idx = store.findIndex(l => l.id === id)
  if (idx === -1) return false
  store[idx].active = !store[idx].active
  setLocal('kopeagri_logistics', store)
  return store[idx].active
}

export async function deleteLogistics(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { error } = await supabase.from('logistics_providers').delete().eq('id', id)
    if (!error) return true
  }
  const store = getLocal<LogisticsProvider>('kopeagri_logistics')
  const idx = store.findIndex(l => l.id === id)
  if (idx === -1) return false
  store.splice(idx, 1)
  setLocal('kopeagri_logistics', store)
  return true
}

// ===== DISTRIBUTORS =====
export async function getDistributors(): Promise<Distributor[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('distributors').select('*').order('name')
    if (!error && data) return data as Distributor[]
  }
  return getLocal<Distributor>('kopeagri_distributors')
}

export async function getActiveDistributors(): Promise<Distributor[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('distributors').select('*').eq('active', true).order('name')
    if (!error && data) return data as Distributor[]
  }
  return getLocal<Distributor>('kopeagri_distributors').filter(d => d.active)
}

export async function addDistributor(item: Omit<Distributor, 'id' | 'created_at' | 'updated_at'>): Promise<Distributor> {
  const now = new Date().toISOString()
  const newItem = { ...item, id: generateId(), created_at: now, updated_at: now } as Distributor
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('distributors').insert(newItem).select()
    if (!error && data?.[0]) return data[0] as Distributor
  }
  const store = getLocal<Distributor>('kopeagri_distributors')
  store.push(newItem)
  setLocal('kopeagri_distributors', store)
  return newItem
}

export async function updateDistributor(id: string, updates: Partial<Distributor>): Promise<Distributor | null> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('distributors').update(updated).eq('id', id).select()
    if (!error && data?.[0]) return data[0] as Distributor
  }
  const store = getLocal<Distributor>('kopeagri_distributors')
  const idx = store.findIndex(d => d.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...updated }
  setLocal('kopeagri_distributors', store)
  return store[idx]
}

export async function toggleDistributorActive(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { data } = await supabase.from('distributors').select('active').eq('id', id).single()
    if (data) {
      const { data: updated } = await supabase.from('distributors').update({ active: !data.active, updated_at: new Date().toISOString() }).eq('id', id).select()
      return updated?.[0]?.active ?? false
    }
  }
  const store = getLocal<Distributor>('kopeagri_distributors')
  const idx = store.findIndex(d => d.id === id)
  if (idx === -1) return false
  store[idx].active = !store[idx].active
  setLocal('kopeagri_distributors', store)
  return store[idx].active
}

export async function deleteDistributor(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { error } = await supabase.from('distributors').delete().eq('id', id)
    if (!error) return true
  }
  const store = getLocal<Distributor>('kopeagri_distributors')
  const idx = store.findIndex(d => d.id === id)
  if (idx === -1) return false
  store.splice(idx, 1)
  setLocal('kopeagri_distributors', store)
  return true
}

// ===== RFQ (APPELS D'OFFRE) =====
export async function getAllRFQ(): Promise<RFQ[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('rfqs').select('*, rfq_partners(*)').order('created_at', { ascending: false })
    if (!error && data) return data as any
  }
  return getLocal<RFQ>('kopeagri_rfq')
}

export async function createRFQ(data: Omit<RFQ, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<RFQ> {
  const now = new Date().toISOString()
  const rfq: any = { ...data, id: generateId(), status: 'brouillon', created_at: now, updated_at: now }
  if (supabase.isConfigured) {
    const { data: result, error } = await supabase.from('rfqs').insert(rfq).select()
    if (!error && result?.[0]) return result[0] as RFQ
  }
  const all = getLocal<RFQ>('kopeagri_rfq')
  all.push(rfq as RFQ)
  setLocal('kopeagri_rfq', all)
  return rfq as RFQ
}

export async function updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ | null> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('rfqs').update(updated).eq('id', id).select()
    if (!error && data?.[0]) return data[0] as RFQ
  }
  const all = getLocal<RFQ>('kopeagri_rfq')
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...updated }
  setLocal('kopeagri_rfq', all)
  return all[idx]
}

export async function deleteRFQ(id: string): Promise<boolean> {
  if (supabase.isConfigured) {
    const { error } = await supabase.from('rfqs').delete().eq('id', id)
    if (!error) return true
  }
  const all = getLocal<RFQ>('kopeagri_rfq')
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  setLocal('kopeagri_rfq', all)
  return true
}

// ===== MATCHING (transporteurs/distributeurs proches) =====
export async function matchPartners(rfq: RFQ): Promise<RFQPartner[]> {
  const partners: RFQPartner[] = []
  const transporteurs = await getActiveLogistics()
  const distributeurs = await getActiveDistributors()

  if (rfq.type === 'transport' || rfq.type === 'export') {
    transporteurs.forEach(t => {
      partners.push({
        id: t.id, name: t.name, phone: t.phone, commune: t.commune || '',
        type: 'transporteur', status: 'en_attente',
        whatsapp_url: `https://wa.me/${t.phone.replace(/\s/g, '')}?text=${encodeURIComponent(
          `Bonjour ${t.name}, KopéAgri Caraïbes a un appel d'offre :\n` +
          `📦 ${rfq.title}\n🚛 ${rfq.produits?.join(', ') || ''} — ${rfq.quantite || ''}\n` +
          `📍 ${rfq.commune_depart} → ${rfq.commune_arrivee || ''}\n` +
          `📅 ${rfq.date_souhaitee || ''}\n💰 Budget max: ${rfq.budget_max || 'à discuter'}\n` +
          `Êtes-vous disponible ? Merci de répondre.`
        )}`,
      })
    })
  }

  if (rfq.type === 'achat' || rfq.type === 'stockage') {
    distributeurs.forEach(d => {
      partners.push({
        id: d.id, name: d.name, phone: d.phone, commune: d.commune,
        type: d.type === 'exportateur' ? 'exportateur' : d.type === 'transitaire' ? 'stockeur' : 'acheteur',
        status: 'en_attente',
        whatsapp_url: `https://wa.me/${d.phone.replace(/\s/g, '')}?text=${encodeURIComponent(
          `Bonjour ${d.name}, KopéAgri Caraïbes a un appel d'offre :\n` +
          `📦 ${rfq.title}\n🥭 ${rfq.produits?.join(', ') || ''}\n` +
          `📍 Disponible à ${rfq.commune_depart}\n` +
          `📅 ${rfq.date_souhaitee || ''}\n` +
          `Cela vous intéresse ? Merci de répondre.`
        )}`,
      })
    })
  }

  partners.sort((a, b) => {
    const aProche = (a.commune === rfq.commune_depart || a.commune === rfq.commune_arrivee) ? 0 : 1
    const bProche = (b.commune === rfq.commune_depart || b.commune === rfq.commune_arrivee) ? 0 : 1
    return aProche - bProche
  })

  return partners.slice(0, 5)
}

export async function sendRFQ(rfqId: string): Promise<RFQ | null> {
  const { data: rfq } = await supabase.from('rfqs').select('*').eq('id', rfqId).single()
  if (!rfq) {
    const localRFQs = getLocal<RFQ>('kopeagri_rfq')
    const localRFQ = localRFQs.find(r => r.id === rfqId)
    if (!localRFQ) return null
    const partners = await matchPartners(localRFQ)
    return updateRFQ(rfqId, { status: 'envoyee', partenaires: partners.map(p => ({ ...p, status: 'contacte' as const })) })
  }
  const partners = await matchPartners(rfq as RFQ)
  return updateRFQ(rfqId, { status: 'envoyee', partenaires: partners.map(p => ({ ...p, status: 'contacte' as const })) })
}

export async function updatePartnerStatus(rfqId: string, partnerId: string, status: RFQPartner['status']): Promise<RFQ | null> {
  const allRFQ = await getAllRFQ()
  const rfq = allRFQ.find(r => r.id === rfqId)
  if (!rfq) return null
  const partenaires = (rfq.partenaires || []).map(p =>
    p.id === partnerId ? { ...p, status, responded_at: new Date().toISOString() } : p
  )
  let newStatus: string = rfq.status
  if (status === 'confirme') newStatus = 'confirmee'
  return updateRFQ(rfqId, { partenaires, status: newStatus as any })
}

// Simulation pour démo
export function simulateResponses(rfqId: string): RFQ | null {
  const all = getLocal<RFQ>('kopeagri_rfq')
  const rfq = all.find(r => r.id === rfqId)
  if (!rfq || !rfq.partenaires?.length) return null
  const updatedPartners = rfq.partenaires.map((p, i) => {
    if (i === 0) return { ...p, status: 'confirme' as const, responded_at: new Date().toISOString() }
    if (i === 1) return { ...p, status: 'interesse' as const, responded_at: new Date().toISOString() }
    if (i === 2 && Math.random() > 0.5) return { ...p, status: 'refuse' as const, responded_at: new Date().toISOString() }
    return { ...p, status: 'contacte' as const }
  })
  const hasConfirmed = updatedPartners.some(p => p.status === 'confirme')
  const result = { ...rfq, partenaires: updatedPartners, status: hasConfirmed ? 'confirmee' : 'envoyee', updated_at: new Date().toISOString() }
  const idx = all.findIndex(r => r.id === rfqId)
  all[idx] = result
  setLocal('kopeagri_rfq', all)
  return result
}

// ===== NOTIFICATIONS =====
export async function getNotifications(userId: string): Promise<Notification[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (!error && data) return data as Notification[]
  }
  return getLocal<Notification>(`kopeagri_notifications_${userId}`)
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  if (supabase.isConfigured) {
    await supabase.from('notifications').update({ status: 'lue', read_at: new Date().toISOString() }).eq('id', id)
  } else {
    const all = getLocal<Notification>(`kopeagri_notifications_${userId}`)
    const idx = all.findIndex(n => n.id === id)
    if (idx !== -1) { all[idx].status = 'lue'; setLocal(`kopeagri_notifications_${userId}`, all) }
  }
}

// ===== REAL-TIME SUBSCRIPTION =====
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  if (!supabase.isConfigured) return { unsubscribe: () => {} }
  return supabase.channel(`realtime-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}

// ===== CONSTANTS (kept from original) =====
export const MARTINIQUE_COMMUNES = [
  'Ajoupa-Bouillon', 'Basse-Pointe', 'Bellefontaine', 'Case-Pilote', 'Ducos',
  'Fonds-Saint-Denis', 'Fort-de-France', 'Grand-Rivière', 'Gros-Morne',
  'La Trinité', 'Le Carbet', 'Le Diamant', 'Le François', 'Le Lamentin',
  'Le Lorrain', 'Le Marigot', 'Le Marin', 'Le Morne-Rouge', 'Le Morne-Vert',
  'Le Prêcheur', 'Le Robert', 'Le Vauclin', "Les Anses-d'Arlet", 'Les Trois-Îlets',
  'Macouba', 'Rivière-Pilote', 'Rivière-Salée', 'Saint-Esprit', 'Saint-Joseph',
  'Saint-Pierre', 'Sainte-Anne', 'Sainte-Luce', 'Sainte-Marie', 'Schœlcher',
] as const

export const LOGISTICS_SERVICES = [
  'Collecte producteurs', 'Transport frigorifique', 'Livraison locale',
  'Stockage froid', 'Groupage', 'Export documentation', 'Transit portuaire',
  'Distribution point relais',
]

export const AGRICULTURE_CULTURES = [
  'Banane Cavendish', 'Banane plantain', 'Mangue José', 'Mangue Amélie',
  'Ananas Victoria', 'Ananas Queen', 'Avocat Haas', 'Avocat Lula',
  'Patate douce', 'Igname', 'Manioc', 'Dasheen', 'Christophine',
  'Giraumon', 'Concombre', 'Tomate', 'Laitue', 'Poivron',
  'Citron vert', 'Orange', 'Pamplemousse', 'Fruit à pain',
  'Coco', 'Cacao', 'Vanille', 'Canne à sucre', 'Café',
]

export const DISTRIBUTOR_TYPES = [
  { value: 'grossiste', label: 'Grossiste' },
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'transitaire', label: 'Transitaire / Commissionnaire' },
  { value: 'exportateur', label: 'Exportateur' },
  { value: 'hotel_restaurant', label: 'Hôtel / Restaurant / Collectivité' },
]

export const CERTIFICATIONS = ['Bio', 'Commerce équitable', 'HVE', 'Label Rouge', 'IGP', 'AOP']

// ===== SEED DATA (localStorage fallback only) =====
const SEED_KEY = 'kopeagri_seeded_v2'
const RFQ_SEED_KEY = 'kopeagri_rfq_seeded'

export function seedIfEmpty(): void {
  if (supabase.isConfigured) return // Supabase handles data
  if (localStorage.getItem(SEED_KEY)) return

  const now = new Date().toISOString()

  const producers: Producer[] = [
    { id: 'p1', owner_id: '', name: 'Habitation Clément', contact: 'Jean-Luc Clément', phone: '0696 01 02 03', commune: 'Le François', cultures: ['Banane Cavendish', 'Canne à sucre', 'Ananas Victoria'], certifications: ['Bio', 'IGP'], superficie_ha: 45, description: 'Plantation historique', photo_url: null, active: true, geo_lat: 14.617, geo_lng: -60.907, created_at: now, updated_at: now },
    { id: 'p2', owner_id: '', name: 'Domaine de la Montagne Pelée', contact: 'Marie-Claire Désiré', phone: '0696 04 05 06', commune: 'Le Morne-Rouge', cultures: ['Avocat Haas', 'Mangue José', 'Citron vert', 'Café'], certifications: ['Bio', 'HVE'], superficie_ha: 28, description: null, photo_url: null, active: true, geo_lat: 14.751, geo_lng: -61.129, created_at: now, updated_at: now },
    { id: 'p3', owner_id: '', name: 'Ferme Aublet', contact: 'Patrick Aublet', phone: '0696 07 08 09', commune: 'Basse-Pointe', cultures: ['Banane plantain', 'Igname', 'Dasheen', 'Fruit à pain'], certifications: ['HVE'], superficie_ha: 12, description: null, photo_url: null, active: true, geo_lat: 14.836, geo_lng: -61.078, created_at: now, updated_at: now },
    { id: 'p4', owner_id: '', name: 'Jardins du Carbet', contact: 'Sylvie Aurore', phone: '0696 10 11 12', commune: 'Le Carbet', cultures: ['Tomate', 'Poivron', 'Laitue', 'Concombre'], certifications: [], superficie_ha: 3, description: null, photo_url: null, active: true, geo_lat: 14.653, geo_lng: -61.17, created_at: now, updated_at: now },
    { id: 'p5', owner_id: '', name: 'Plantation Grand-Rivière', contact: 'Émile Romain', phone: '0696 13 14 15', commune: 'Grand-Rivière', cultures: ['Cacao', 'Vanille', 'Café'], certifications: ['Commerce équitable', 'Bio'], superficie_ha: 18, description: null, photo_url: null, active: true, geo_lat: 14.866, geo_lng: -61.214, created_at: now, updated_at: now },
    { id: 'p6', owner_id: '', name: 'Koulibri du Vauclin', contact: 'Chantal Mungal', phone: '0696 16 17 18', commune: 'Le Vauclin', cultures: ['Patate douce', 'Manioc', 'Giraumon', 'Christophine'], certifications: [], superficie_ha: 5, description: null, photo_url: null, active: true, geo_lat: 14.512, geo_lng: -60.83, created_at: now, updated_at: now },
    { id: 'p7', owner_id: '', name: 'Habitation Bébé', contact: 'Georges Bébé', phone: '0696 19 20 21', commune: 'Sainte-Anne', cultures: ['Coco', 'Mangue Amélie', 'Pamplemousse'], certifications: ['IGP'], superficie_ha: 22, description: null, photo_url: null, active: true, geo_lat: 14.436, geo_lng: -60.847, created_at: now, updated_at: now },
    { id: 'p8', owner_id: '', name: 'EARL Rivière-Salée', contact: 'Michel Sinémal', phone: '0696 22 23 24', commune: 'Rivière-Salée', cultures: ['Canne à sucre', 'Banane Cavendish'], certifications: ['Label Rouge'], superficie_ha: 60, description: null, photo_url: null, active: false, geo_lat: 14.47, geo_lng: -60.97, created_at: now, updated_at: now },
  ]

  const logistics: LogisticsProvider[] = [
    { id: 'l1', owner_id: '', name: 'Transport Tropical Express', contact: 'Didier Mondésir', phone: '0696 30 31 32', commune: 'Le Lamentin', services: ['Transport frigorifique', 'Livraison locale', 'Collecte producteurs'], fleet: '4 camions frigorifiques, 2 utilitaires', zone_couverture: ['Le Lamentin', 'Fort-de-France'], capacite_kg: 5000, frigorifique: true, active: true, geo_lat: 14.605, geo_lng: -61.006, created_at: now, updated_at: now },
    { id: 'l2', owner_id: '', name: 'LogiKarib', contact: 'Nathalie Pognon', phone: '0696 33 34 35', commune: 'Fort-de-France', services: ['Groupage', 'Export documentation', 'Transit portuaire'], fleet: '3 camions, 1 semi-remorque', zone_couverture: ['Fort-de-France', 'Le Lamentin'], capacite_kg: 10000, frigorifique: false, active: true, geo_lat: 14.616, geo_lng: -61.064, created_at: now, updated_at: now },
    { id: 'l3', owner_id: '', name: 'Froid Express 972', contact: 'Jean-Marc Almar', phone: '0696 36 37 38', commune: 'Ducos', services: ['Transport frigorifique', 'Stockage froid', 'Livraison locale'], fleet: '6 camions frigorifiques, 1 entrepôt 400m²', zone_couverture: ['Ducos', 'Le Lamentin'], capacite_kg: 8000, frigorifique: true, active: true, geo_lat: 14.58, geo_lng: -60.97, created_at: now, updated_at: now },
    { id: 'l4', owner_id: '', name: 'Cargo Antilles Transit', contact: 'Sophie Barbotin', phone: '0696 39 40 41', commune: 'Fort-de-France', services: ['Transit portuaire', 'Export documentation', 'Groupage'], fleet: '2 camions portuaux', zone_couverture: ['Fort-de-France'], capacite_kg: 15000, frigorifique: false, active: true, geo_lat: 14.616, geo_lng: -61.064, created_at: now, updated_at: now },
    { id: 'l5', owner_id: '', name: 'Livré-O-Kay', contact: 'Rony Théobald', phone: '0696 42 43 44', commune: 'Le Robert', services: ['Livraison locale', 'Distribution point relais', 'Collecte producteurs'], fleet: '3 utilitaires, 5 scooters', zone_couverture: ['Le Robert', 'Le François'], capacite_kg: 1500, frigorifique: false, active: true, geo_lat: 14.671, geo_lng: -60.942, created_at: now, updated_at: now },
    { id: 'l6', owner_id: '', name: 'Trans Express Nord', contact: 'Gilles Levigoureux', phone: '0696 45 46 47', commune: 'Sainte-Marie', services: ['Collecte producteurs', 'Livraison locale'], fleet: '2 camions', zone_couverture: ['Sainte-Marie', 'La Trinité'], capacite_kg: 3000, frigorifique: false, active: false, geo_lat: 14.73, geo_lng: -60.99, created_at: now, updated_at: now },
  ]

  const distributors: Distributor[] = [
    { id: 'd1', owner_id: '', name: 'Karib Fruix', contact: 'Laurent Chabredier', phone: '0696 50 51 52', commune: 'Fort-de-France', type: 'grossiste', active: true, geo_lat: 14.616, geo_lng: -61.064, created_at: now, updated_at: now },
    { id: 'd2', owner_id: '', name: 'Antilles Distribution', contact: 'Frédéric Juminer', phone: '0696 53 54 55', commune: 'Le Lamentin', type: 'distributeur', active: true, geo_lat: 14.605, geo_lng: -61.006, created_at: now, updated_at: now },
    { id: 'd3', owner_id: '', name: 'Transit Martinique SARL', contact: 'Brigitte Narcisse', phone: '0696 56 57 58', commune: 'Fort-de-France', type: 'transitaire', active: true, geo_lat: 14.616, geo_lng: -61.064, created_at: now, updated_at: now },
    { id: 'd4', owner_id: '', name: 'Export Caraïbes', contact: 'Hervé Valentin', phone: '0696 59 60 61', commune: 'Le Lamentin', type: 'exportateur', active: true, geo_lat: 14.605, geo_lng: -61.006, created_at: now, updated_at: now },
    { id: 'd5', owner_id: '', name: 'Hôtel Batelière', contact: 'Chef Stéphane', phone: '0696 62 63 64', commune: 'Schœlcher', type: 'hotel_restaurant', active: true, geo_lat: 14.614, geo_lng: -61.081, created_at: now, updated_at: now },
    { id: 'd6', owner_id: '', name: 'Restaurant Le Zanzibar', contact: 'Patrick Nébulon', phone: '0696 65 66 67', commune: 'Les Trois-Îlets', type: 'hotel_restaurant', active: true, geo_lat: 14.541, geo_lng: -61.0, created_at: now, updated_at: now },
    { id: 'd7', owner_id: '', name: 'Groupe SCBM', contact: 'Marie-France Alténor', phone: '0696 68 69 70', commune: 'Le Lamentin', type: 'grossiste', active: true, geo_lat: 14.605, geo_lng: -61.006, created_at: now, updated_at: now },
    { id: 'd8', owner_id: '', name: 'Caraïbes Fruits Export', contact: 'Jean-Philippe Lero', phone: '0696 71 72 73', commune: 'Le François', type: 'exportateur', active: false, geo_lat: 14.617, geo_lng: -60.907, created_at: now, updated_at: now },
  ]

  setLocal('kopeagri_producers', producers)
  setLocal('kopeagri_logistics', logistics)
  setLocal('kopeagri_distributors', distributors)
  localStorage.setItem(SEED_KEY, '1')
}

// Seed RFQ
export function seedRFQIfEmpty(): void {
  if (supabase.isConfigured) return
  if (localStorage.getItem(RFQ_SEED_KEY)) return
  const now = new Date().toISOString()
  const rfqs: any[] = [
    {
      id: 'rfq1', title: 'Transport bananes — Le François → Fort-de-France',
      type: 'transport', status: 'envoyee',
      producteur: 'Habitation Clément', producteur_phone: '0696 01 02 03',
      commune_depart: 'Le François', commune_arrivee: 'Fort-de-France',
      produits: ['Banane Cavendish'], quantite: '500 kg',
      date_souhaitee: '2026-07-10', budget_max: 300, notes: 'Frigorifique obligatoire',
      partenaires: [
        { id: 'l1', name: 'Transport Tropical Express', phone: '0696 30 31 32', commune: 'Le Lamentin', type: 'transporteur', status: 'confirme', responded_at: now, whatsapp_url: '' },
        { id: 'l3', name: 'Froid Express 972', phone: '0696 36 37 38', commune: 'Ducos', type: 'transporteur', status: 'interesse', responded_at: now, whatsapp_url: '' },
      ],
      created_at: now, updated_at: now,
    },
    {
      id: 'rfq2', title: 'Achat mangues et avocats — Le Morne-Rouge',
      type: 'achat', status: 'confirmee',
      producteur: 'Domaine de la Montagne Pelée', producteur_phone: '0696 04 05 06',
      commune_depart: 'Le Morne-Rouge', commune_arrivee: 'Fort-de-France',
      produits: ['Mangue José', 'Avocat Haas'], quantite: '200 kg',
      date_souhaitee: '2026-07-15', budget_max: 800, notes: 'Qualité export',
      partenaires: [
        { id: 'd1', name: 'Karib Fruix', phone: '0696 50 51 52', commune: 'Fort-de-France', type: 'acheteur', status: 'confirme', responded_at: now, whatsapp_url: '' },
        { id: 'd7', name: 'Groupe SCBM', phone: '0696 68 69 70', commune: 'Le Lamentin', type: 'acheteur', status: 'interesse', responded_at: now, whatsapp_url: '' },
      ],
      created_at: now, updated_at: now,
    },
  ]
  setLocal('kopeagri_rfq', rfqs)
  localStorage.setItem(RFQ_SEED_KEY, '1')
}

// Auto-seed on import
seedIfEmpty()
seedRFQIfEmpty()

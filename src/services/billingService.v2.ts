// ===== SERVICE FACTURATION KOPÉAGRI — Supabase First, localStorage Fallback =====
import { supabase } from '../lib/supabase'
import type { BillingDocument, BillingLine, QontoTransaction, QontoTxCategory } from '../lib/types'

// ===== TYPES COMPAT (pour les pages existantes) =====
export type DocumentType = 'devis' | 'facture' | 'bon_commande'
export type DocumentStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye' | 'annule' | 'expire'
export type PaymentStatus = 'non_paye' | 'partiel' | 'paye' | 'en_retard'

export interface DocumentLine {
  id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  tva_rate: number
  total_ht: number
  total_ttc: number
}

export interface GeoMember {
  id: string
  name: string
  type: 'producteur' | 'transporteur' | 'distributeur' | 'parcelle'
  lat: number
  lng: number
  commune: string
  phone: string
  specialites?: string[]
  superficie_ha?: number
}

// ===== HELPERS =====
const DOC_KEY = 'kopeagri_documents'
const QONTO_KEY = 'kopeagri_qonto_tx'
const GEO_KEY = 'kopeagri_geo_members'
const ESTIMATE_KEY = 'kopeagri_estimates'

function getLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

const DOC_PREFIX: Record<DocumentType, string> = { devis: 'DEV', facture: 'FAC', bon_commande: 'BC' }

function nextRef(type: DocumentType): string {
  const key = `kopeagri_counter_${type}`
  const n = (parseInt(localStorage.getItem(key) || '0') || 0) + 1
  localStorage.setItem(key, String(n))
  return `${DOC_PREFIX[type]}-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}

// ===== DOCUMENTS CRUD =====
export async function getAllDocuments(): Promise<BillingDocument[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('billing_documents').select('*, billing_lines(*)').order('created_at', { ascending: false })
    if (!error && data) return data as any
  }
  return getLocal<BillingDocument>(DOC_KEY)
}

export async function getDocumentById(id: string): Promise<BillingDocument | undefined> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('billing_documents').select('*, billing_lines(*)').eq('id', id).single()
    if (!error && data) return data as any
  }
  return getLocal<BillingDocument>(DOC_KEY).find(d => d.id === id)
}

export async function createDocument(doc: Omit<BillingDocument, 'id' | 'reference' | 'created_at' | 'updated_at'>): Promise<BillingDocument> {
  const ref = nextRef(doc.type)
  const now = new Date().toISOString()
  const newDoc: any = { ...doc, id: crypto.randomUUID(), reference: ref, created_at: now, updated_at: now }

  if (supabase.isConfigured) {
    // Insert document
    const { data, error } = await supabase.from('billing_documents').insert({
      id: newDoc.id, owner_id: newDoc.owner_id || '', type: newDoc.type, reference: ref,
      status: newDoc.status, payment_status: newDoc.payment_status,
      client_name: newDoc.client_name, client_email: newDoc.client_email || null,
      client_phone: newDoc.client_phone || null, client_address: newDoc.client_address || null,
      client_siret: newDoc.client_siret || null, subtotal_ht: newDoc.subtotal_ht,
      total_tva: newDoc.total_tva, total_ttc: newDoc.total_ttc,
      due_date: newDoc.due_date, notes: newDoc.notes || null,
      qonto_synced: newDoc.qonto_synced, geo_lat: newDoc.geo_lat || null,
      geo_lng: newDoc.geo_lng || null,
    }).select()
    // Insert lines
    if (!error && newDoc.lines?.length) {
      const lines = newDoc.lines.map((l: any, i: number) => ({
        document_id: newDoc.id, description: l.description, quantity: l.quantity,
        unit: l.unit, unit_price: l.unit_price, tva_rate: l.tva_rate,
        total_ht: l.total_ht, total_ttc: l.total_ttc, sort_order: i,
      }))
      await supabase.from('billing_lines').insert(lines)
    }
    if (!error && data?.[0]) return { ...data[0], lines: newDoc.lines } as BillingDocument
  }

  const docs = getLocal<BillingDocument>(DOC_KEY)
  docs.unshift(newDoc)
  setLocal(DOC_KEY, docs)
  return newDoc as BillingDocument
}

export async function updateDocument(id: string, updates: Partial<BillingDocument>): Promise<void> {
  const updated = { ...updates, updated_at: new Date().toISOString() }
  if (supabase.isConfigured) {
    await supabase.from('billing_documents').update(updated).eq('id', id)
    return
  }
  const docs = getLocal<BillingDocument>(DOC_KEY).map(d => d.id === id ? { ...d, ...updated } : d)
  setLocal(DOC_KEY, docs)
}

export async function deleteDocument(id: string): Promise<void> {
  if (supabase.isConfigured) {
    await supabase.from('billing_lines').delete().eq('document_id', id)
    await supabase.from('billing_documents').delete().eq('id', id)
    return
  }
  const docs = getLocal<BillingDocument>(DOC_KEY).filter(d => d.id !== id)
  setLocal(DOC_KEY, docs)
}

export async function updateDocStatus(id: string, status: DocumentStatus): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() }
  if (status === 'envoye') updates.sent_at = new Date().toISOString()
  if (status === 'paye') { updates.paid_at = new Date().toISOString(); updates.payment_status = 'paye' }
  return updateDocument(id, updates)
}

// ===== CALCULS =====
export function calcLine(line: Omit<DocumentLine, 'id' | 'total_ht' | 'total_ttc'>): Pick<DocumentLine, 'total_ht' | 'total_ttc'> {
  const total_ht = Math.round(line.quantity * line.unit_price * 100) / 100
  const total_ttc = Math.round(total_ht * (1 + line.tva_rate / 100) * 100) / 100
  return { total_ht, total_ttc }
}

export function calcTotals(lines: DocumentLine[]): { subtotal_ht: number; total_tva: number; total_ttc: number } {
  const subtotal_ht = Math.round(lines.reduce((s, l) => s + l.total_ht, 0) * 100) / 100
  const total_ttc = Math.round(lines.reduce((s, l) => s + l.total_ttc, 0) * 100) / 100
  const total_tva = Math.round((total_ttc - subtotal_ht) * 100) / 100
  return { subtotal_ht, total_tva, total_ttc }
}

// ===== QONTO =====
export async function getAllQontoTransactions(): Promise<QontoTransaction[]> {
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('qonto_transactions').select('*').order('date', { ascending: false })
    if (!error && data) return data as QontoTransaction[]
  }
  return getLocal<QontoTransaction>(QONTO_KEY)
}

export async function syncQontoTransaction(tx: Omit<QontoTransaction, 'id' | 'created_at'>): Promise<QontoTransaction> {
  const now = new Date().toISOString()
  const newTx: any = { ...tx, id: crypto.randomUUID(), created_at: now }
  if (supabase.isConfigured) {
    const { data, error } = await supabase.from('qonto_transactions').insert(newTx).select()
    if (!error && data?.[0]) {
      if (newTx.linked_document_id) await updateDocStatus(newTx.linked_document_id, 'paye')
      return data[0] as QontoTransaction
    }
  }
  const txs = getLocal<QontoTransaction>(QONTO_KEY)
  txs.unshift(newTx)
  setLocal(QONTO_KEY, txs)
  if (newTx.linked_document_id) await updateDocument(newTx.linked_document_id, { qonto_synced: true, payment_status: 'paye', paid_at: newTx.date })
  return newTx as QontoTransaction
}

export async function getQontoBalance(): Promise<{ income: number; expenses: number; balance: number }> {
  const txs = await getAllQontoTransactions()
  const income = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = Math.abs(txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0))
  return { income: Math.round(income * 100) / 100, expenses: Math.round(expenses * 100) / 100, balance: Math.round((income - expenses) * 100) / 100 }
}

// ===== GÉOLOCALISATION =====
export async function getAllGeoMembers(): Promise<GeoMember[]> {
  if (supabase.isConfigured) {
    // Combine producers + logistics + distributors from Supabase
    const [pRes, lRes, dRes] = await Promise.all([
      supabase.from('producers').select('id,name,geo_lat,geo_lng,commune,phone,cultures,superficie_ha').eq('active', true),
      supabase.from('logistics_providers').select('id,name,geo_lat,geo_lng,commune,phone,services').eq('active', true),
      supabase.from('distributors').select('id,name,geo_lat,geo_lng,commune,phone,type').eq('active', true),
    ])
    const members: GeoMember[] = []
    if (pRes.data) pRes.data.forEach(p => { if (p.geo_lat && p.geo_lng) members.push({ id: p.id, name: p.name, type: 'producteur', lat: p.geo_lat, lng: p.geo_lng, commune: p.commune, phone: p.phone, specialites: p.cultures, superficie_ha: p.superficie_ha }) })
    if (lRes.data) lRes.data.forEach(l => { if (l.geo_lat && l.geo_lng) members.push({ id: l.id, name: l.name, type: 'transporteur', lat: l.geo_lat, lng: l.geo_lng, commune: l.commune, phone: l.phone, specialites: l.services }) })
    if (dRes.data) dRes.data.forEach(d => { if (d.geo_lat && d.geo_lng) members.push({ id: d.id, name: d.name, type: 'distributeur', lat: d.geo_lat, lng: d.geo_lng, commune: d.commune, phone: d.phone }) })
    return members
  }
  return getLocal<GeoMember>(GEO_KEY)
}

export function addGeoMember(member: Omit<GeoMember, 'id'>): GeoMember {
  const newMember: GeoMember = { ...member, id: crypto.randomUUID() }
  const members = getLocal<GeoMember>(GEO_KEY)
  members.push(newMember)
  setLocal(GEO_KEY, members)
  return newMember
}

export function updateGeoMember(id: string, updates: Partial<GeoMember>): void {
  const members = getLocal<GeoMember>(GEO_KEY).map(m => m.id === id ? { ...m, ...updates } : m)
  setLocal(GEO_KEY, members)
}

export function removeGeoMember(id: string): void {
  setLocal(GEO_KEY, getLocal<GeoMember>(GEO_KEY).filter(m => m.id !== id))
}

// ===== ESTIMATION RAPIDE =====
export interface QuickEstimate {
  id: string
  title: string
  client: string
  items: { desc: string; qty: number; unit: string; unit_price: number }[]
  total_ht: number
  total_ttc: number
  created_at: string
}

export function getEstimates(): QuickEstimate[] {
  return getLocal<QuickEstimate>(ESTIMATE_KEY)
}

export function addEstimate(est: Omit<QuickEstimate, 'id' | 'created_at'>): QuickEstimate {
  const newItem: QuickEstimate = { ...est, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  const all = getEstimates()
  all.unshift(newItem)
  setLocal(ESTIMATE_KEY, all)
  return newItem
}

// ===== COMMUNE COORDS =====
export const COMMUNE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Fort-de-France': { lat: 14.6161, lng: -61.0636 },
  'Schœlcher': { lat: 14.6140, lng: -61.0810 },
  'Le Lamentin': { lat: 14.6050, lng: -61.0060 },
  'Saint-Joseph': { lat: 14.6732, lng: -61.0019 },
  'Le François': { lat: 14.6170, lng: -60.9070 },
  'Le Robert': { lat: 14.6710, lng: -60.9420 },
  'Le Marin': { lat: 14.4737, lng: -60.8708 },
  'Sainte-Anne': { lat: 14.4355, lng: -60.8468 },
  'Le Vauclin': { lat: 14.5123, lng: -60.8302 },
  'Sainte-Luce': { lat: 14.4739, lng: -60.9287 },
  'Rivière-Pilote': { lat: 14.4704, lng: -60.8845 },
  'Le Diamant': { lat: 14.4388, lng: -61.0284 },
  "Les Anses-d'Arlet": { lat: 14.4823, lng: -61.0739 },
  'Les Trois-Îlets': { lat: 14.5407, lng: -61.0004 },
  'Le Carbet': { lat: 14.6528, lng: -61.1701 },
  'Bellefontaine': { lat: 14.6327, lng: -61.1421 },
  'Case-Pilote': { lat: 14.6425, lng: -61.1187 },
  'Saint-Pierre': { lat: 14.7433, lng: -61.1713 },
  'Le Prêcheur': { lat: 14.7854, lng: -61.2078 },
  'Le Morne-Rouge': { lat: 14.7512, lng: -61.1292 },
  'Ajoupa-Bouillon': { lat: 14.8105, lng: -61.1028 },
  'Le Morne-Vert': { lat: 14.6921, lng: -61.0940 },
  'Gros-Morne': { lat: 14.6711, lng: -61.0614 },
  'Macouba': { lat: 14.8364, lng: -61.0782 },
  "Grand-Rivière": { lat: 14.8663, lng: -61.2135 },
  'La Trinité': { lat: 14.7225, lng: -60.9681 },
}

// ===== TVA RATES =====
export const TVA_RATES = [0, 2.1, 5.5, 8.5, 10, 20] as const

// ===== SEED =====
const BILLING_SEED_KEY = 'kopeagri_billing_seeded'

export function seedBillingIfEmpty(): void {
  if (supabase.isConfigured) return
  if (localStorage.getItem(BILLING_SEED_KEY)) return
  const now = new Date().toISOString()
  const docs: any[] = [
    {
      id: 'bd1', type: 'devis', reference: 'DEV-2026-0001', status: 'envoye',
      payment_status: 'non_paye', client_name: 'Hôtel Batelière',
      client_email: 'achat@bateliere.com', client_phone: '0696 62 63 64',
      lines: [
        { id: 'bl1', description: 'Banane Cavendish premium', quantity: 200, unit: 'kg', unit_price: 2.8, tva_rate: 5.5, total_ht: 560, total_ttc: 590.8 },
        { id: 'bl2', description: 'Mangue José calibre A', quantity: 100, unit: 'kg', unit_price: 4.5, tva_rate: 5.5, total_ht: 450, total_ttc: 474.75 },
      ],
      subtotal_ht: 1010, total_tva: 55.55, total_ttc: 1065.55,
      due_date: '2026-08-01', notes: 'Livraison frigorifique obligatoire',
      qonto_synced: false, geo_lat: 14.614, geo_lng: -61.081,
      created_at: now, updated_at: now,
    },
    {
      id: 'bd2', type: 'facture', reference: 'FAC-2026-0001', status: 'paye',
      payment_status: 'paye', client_name: 'Karib Fruix',
      client_email: 'commandes@karibfruix.com', client_phone: '0696 50 51 52',
      lines: [
        { id: 'bl3', description: 'Avocat Haas', quantity: 150, unit: 'kg', unit_price: 5.2, tva_rate: 5.5, total_ht: 780, total_ttc: 822.9 },
      ],
      subtotal_ht: 780, total_tva: 42.9, total_ttc: 822.9,
      due_date: '2026-07-30', sent_at: now, paid_at: now, notes: '',
      qonto_synced: true, geo_lat: 14.616, geo_lng: -61.064,
      created_at: now, updated_at: now,
    },
  ]
  setLocal(DOC_KEY, docs)

  // Qonto seed
  const txs: any[] = [
    { id: 'qt1', date: now, amount: 822.9, description: 'Paiement Karib Fruix - FAC-2026-0001', category: 'vente', status: 'completed', linked_document_id: 'bd2', created_at: now },
    { id: 'qt2', date: now, amount: -180, description: 'Carburant transport', category: 'carburant', status: 'completed', created_at: now },
  ]
  setLocal(QONTO_KEY, txs)

  localStorage.setItem(BILLING_SEED_KEY, '1')
}

seedBillingIfEmpty()

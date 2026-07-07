// ===== SERVICE FACTURATION KOPÉAGRI =====
// Devis, Factures, Bons de Commande + Qonto + Géolocalisation

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

export interface BillingDocument {
  id: string
  type: DocumentType
  reference: string
  status: DocumentStatus
  payment_status: PaymentStatus
  client_name: string
  client_email: string
  client_phone: string
  client_address: string
  lines: DocumentLine[]
  subtotal_ht: number
  total_tva: number
  total_ttc: number
  due_date: string
  created_at: string
  sent_at?: string
  paid_at?: string
  notes: string
  qonto_synced: boolean
  geoloc_lat?: number
  geoloc_lng?: number
}

export interface QontoTransaction {
  id: string
  date: string
  amount: number
  description: string
  category: string
  status: 'completed' | 'pending' | 'failed'
  linked_document_id?: string
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

// ===== RÉFÉRENCE AUTO =====
const DOC_PREFIX: Record<DocumentType, string> = {
  devis: 'DEV',
  facture: 'FAC',
  bon_commande: 'BC',
}

function nextRef(type: DocumentType): string {
  const key = `kopeagri_counter_${type}`
  const n = (parseInt(localStorage.getItem(key) || '0') || 0) + 1
  localStorage.setItem(key, String(n))
  const year = new Date().getFullYear()
  return `${DOC_PREFIX[type]}-${year}-${String(n).padStart(4, '0')}`
}

// ===== CRUD DOCUMENTS =====
const DOC_KEY = 'kopeagri_documents'
const QONTO_KEY = 'kopeagri_qonto_tx'
const GEO_KEY = 'kopeagri_geo_members'

export function getAllDocuments(): BillingDocument[] {
  return JSON.parse(localStorage.getItem(DOC_KEY) || '[]')
}

export function getDocumentById(id: string): BillingDocument | undefined {
  return getAllDocuments().find(d => d.id === id)
}

export function createDocument(doc: Omit<BillingDocument, 'id' | 'reference' | 'created_at'>): BillingDocument {
  const newDoc: BillingDocument = {
    ...doc,
    id: crypto.randomUUID(),
    reference: nextRef(doc.type),
    created_at: new Date().toISOString(),
  }
  const docs = getAllDocuments()
  docs.unshift(newDoc)
  localStorage.setItem(DOC_KEY, JSON.stringify(docs))
  return newDoc
}

export function updateDocument(id: string, updates: Partial<BillingDocument>): void {
  const docs = getAllDocuments().map(d => d.id === id ? { ...d, ...updates } : d)
  localStorage.setItem(DOC_KEY, JSON.stringify(docs))
}

export function deleteDocument(id: string): void {
  const docs = getAllDocuments().filter(d => d.id !== id)
  localStorage.setItem(DOC_KEY, JSON.stringify(docs))
}

export function updateDocStatus(id: string, status: DocumentStatus): void {
  const updates: Partial<BillingDocument> = { status }
  if (status === 'envoye') updates.sent_at = new Date().toISOString()
  if (status === 'paye') updates.paid_at = new Date().toISOString()
  if (status === 'paye') updates.payment_status = 'paye'
  updateDocument(id, updates)
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
export function getAllQontoTransactions(): QontoTransaction[] {
  return JSON.parse(localStorage.getItem(QONTO_KEY) || '[]')
}

export function syncQontoTransaction(tx: Omit<QontoTransaction, 'id'>): QontoTransaction {
  const newTx: QontoTransaction = { ...tx, id: crypto.randomUUID() }
  const txs = getAllQontoTransactions()
  txs.unshift(newTx)
  localStorage.setItem(QONTO_KEY, JSON.stringify(txs))
  // Link to document if specified
  if (newTx.linked_document_id) {
    updateDocument(newTx.linked_document_id, { qonto_synced: true, payment_status: 'paye', paid_at: newTx.date })
  }
  return newTx
}

export function getQontoBalance(): { income: number; expenses: number; balance: number } {
  const txs = getAllQontoTransactions()
  const income = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = Math.abs(txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0))
  return { income: Math.round(income * 100) / 100, expenses: Math.round(expenses * 100) / 100, balance: Math.round((income - expenses) * 100) / 100 }
}

// ===== GÉOLOCALISATION =====
export function getAllGeoMembers(): GeoMember[] {
  return JSON.parse(localStorage.getItem(GEO_KEY) || '[]')
}

export function addGeoMember(member: Omit<GeoMember, 'id'>): GeoMember {
  const newMember: GeoMember = { ...member, id: crypto.randomUUID() }
  const members = getAllGeoMembers()
  members.push(newMember)
  localStorage.setItem(GEO_KEY, JSON.stringify(members))
  return newMember
}

export function updateGeoMember(id: string, updates: Partial<GeoMember>): void {
  const members = getAllGeoMembers().map(m => m.id === id ? { ...m, ...updates } : m)
  localStorage.setItem(GEO_KEY, JSON.stringify(members))
}

export function removeGeoMember(id: string): void {
  const members = getAllGeoMembers().filter(m => m.id !== id)
  localStorage.setItem(GEO_KEY, JSON.stringify(members))
}

// Coordonnées communes Martinique
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
  'Les Anses-dArlet': { lat: 14.4823, lng: -61.0739 },
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
  'Morne-des-Esses': { lat: 14.7064, lng: -61.0256 },
  'Macouba': { lat: 14.8364, lng: -61.0782 },
  "Grand'Riviere": { lat: 14.8663, lng: -61.2135 },
  'La Trinite': { lat: 14.7225, lng: -60.9681 },
  "La Grand'Anse": { lat: 14.6277, lng: -61.0037 },
}

// ===== ESTIMATION RAPIDE =====
export interface QuickEstimate {
  product: string
  quantity: number
  unit: string
  estimated_price_min: number
  estimated_price_max: number
  confidence: 'haute' | 'moyenne' | 'basse'
  delivery_days: number
  transport_cost_min: number
  transport_cost_max: number
}

export const PRICE_REFERENCES: Record<string, { min: number; max: number; unit: string; delivery: number }> = {
  'banane': { min: 0.80, max: 1.50, unit: 'kg', delivery: 2 },
  'banane plantain': { min: 1.00, max: 2.00, unit: 'kg', delivery: 2 },
  'mangue': { min: 2.00, max: 5.00, unit: 'kg', delivery: 1 },
  'ananas': { min: 1.50, max: 3.50, unit: 'pièce', delivery: 2 },
  'fruit à pain': { min: 1.00, max: 2.50, unit: 'kg', delivery: 1 },
  'igname': { min: 1.50, max: 3.00, unit: 'kg', delivery: 3 },
  'dachine': { min: 1.50, max: 3.00, unit: 'kg', delivery: 3 },
  'canne à sucre': { min: 0.30, max: 0.60, unit: 'kg', delivery: 2 },
  'cacao': { min: 5.00, max: 9.00, unit: 'kg', delivery: 7 },
  'café': { min: 15.00, max: 28.00, unit: 'kg', delivery: 7 },
  'vanille': { min: 150.00, max: 350.00, unit: 'gousse', delivery: 14 },
  'piment': { min: 8.00, max: 18.00, unit: 'kg', delivery: 2 },
  'christophine': { min: 1.00, max: 2.00, unit: 'kg', delivery: 2 },
  'giraumon': { min: 1.00, max: 2.50, unit: 'kg', delivery: 2 },
  'patate douce': { min: 1.20, max: 2.50, unit: 'kg', delivery: 3 },
  'malanga': { min: 2.00, max: 4.00, unit: 'kg', delivery: 3 },
  'madère': { min: 1.50, max: 3.00, unit: 'kg', delivery: 3 },
  'avocat': { min: 2.00, max: 5.00, unit: 'kg', delivery: 1 },
  'citron': { min: 2.00, max: 4.00, unit: 'kg', delivery: 1 },
  'pamplemousse': { min: 1.50, max: 3.00, unit: 'kg', delivery: 1 },
  'corossol': { min: 3.00, max: 6.00, unit: 'kg', delivery: 2 },
  'goyave': { min: 2.00, max: 4.00, unit: 'kg', delivery: 1 },
  'rhubarbe': { min: 2.50, max: 5.00, unit: 'kg', delivery: 2 },
  'laitue': { min: 1.50, max: 3.00, unit: 'unité', delivery: 1 },
  'tomate': { min: 2.00, max: 4.50, unit: 'kg', delivery: 1 },
  'concombre': { min: 1.50, max: 3.00, unit: 'kg', delivery: 1 },
  'aubergine': { min: 2.00, max: 4.00, unit: 'kg', delivery: 2 },
  'transport martinique': { min: 0.50, max: 1.20, unit: 'km', delivery: 0 },
}

export function getQuickEstimate(product: string, quantity: number, commune?: string): QuickEstimate {
  const key = product.toLowerCase().trim()
  const ref = PRICE_REFERENCES[key]
  if (!ref) {
    return {
      product,
      quantity,
      unit: 'kg',
      estimated_price_min: Math.round(quantity * 1.5 * 100) / 100,
      estimated_price_max: Math.round(quantity * 4 * 100) / 100,
      confidence: 'basse',
      delivery_days: 5,
      transport_cost_min: Math.round(quantity * 0.3 * 100) / 100,
      transport_cost_max: Math.round(quantity * 0.8 * 100) / 100,
    }
  }
  const dist = commune ? 15 + Math.random() * 25 : 20
  const transportMin = Math.round(dist * 0.5 * 100) / 100
  const transportMax = Math.round(dist * 1.2 * 100) / 100
  return {
    product,
    quantity,
    unit: ref.unit,
    estimated_price_min: Math.round(quantity * ref.min * 100) / 100,
    estimated_price_max: Math.round(quantity * ref.max * 100) / 100,
    confidence: 'moyenne',
    delivery_days: ref.delivery,
    transport_cost_min: transportMin,
    transport_cost_max: transportMax,
  }
}

// ===== SEED DÉMO =====
function seedBillingIfEmpty() {
  if (getAllDocuments().length > 0) return
  const docs: BillingDocument[] = [
    {
      id: crypto.randomUUID(),
      type: 'devis',
      reference: 'DEV-2026-0001',
      status: 'envoye',
      payment_status: 'non_paye',
      client_name: 'Restaurant Le Salomon',
      client_email: 'contact@lesalomon.fr',
      client_phone: '0696 12 34 56',
      client_address: 'Rue Schoelcher, Fort-de-France',
      lines: [
        { id: crypto.randomUUID(), description: 'Bananes (variété Cavendish)', quantity: 200, unit: 'kg', unit_price: 1.20, tva_rate: 8.5, total_ht: 240, total_ttc: 260.40 },
        { id: crypto.randomUUID(), description: 'Mangues Amélie', quantity: 50, unit: 'kg', unit_price: 3.50, tva_rate: 8.5, total_ht: 175, total_ttc: 189.88 },
        { id: crypto.randomUUID(), description: 'Transport FdF → Le François', quantity: 1, unit: 'course', unit_price: 35, tva_rate: 20, total_ht: 35, total_ttc: 42 },
      ],
      subtotal_ht: 450,
      total_tva: 42.28,
      total_ttc: 492.28,
      due_date: '2026-08-01',
      created_at: '2026-07-01T10:00:00Z',
      sent_at: '2026-07-01T14:00:00Z',
      notes: 'Livraison le mardi et vendredi. Produits frais récoltés J-1.',
      qonto_synced: false,
      geoloc_lat: 14.6161,
      geoloc_lng: -61.0636,
    },
    {
      id: crypto.randomUUID(),
      type: 'facture',
      reference: 'FAC-2026-0001',
      status: 'paye',
      payment_status: 'paye',
      client_name: 'Supermarché Score Le Lamentin',
      client_email: 'achat@score-martinique.fr',
      client_phone: '0696 98 76 54',
      client_address: 'Centre Commercial Palmyre, Le Lamentin',
      lines: [
        { id: crypto.randomUUID(), description: 'Igname (lot 100kg)', quantity: 3, unit: 'lot', unit_price: 280, tva_rate: 8.5, total_ht: 840, total_ttc: 911.40 },
        { id: crypto.randomUUID(), description: 'Patates douces (lot 50kg)', quantity: 2, unit: 'lot', unit_price: 125, tva_rate: 8.5, total_ht: 250, total_ttc: 271.25 },
      ],
      subtotal_ht: 1090,
      total_tva: 92.65,
      total_ttc: 1182.65,
      due_date: '2026-07-15',
      created_at: '2026-06-20T09:00:00Z',
      sent_at: '2026-06-20T11:00:00Z',
      paid_at: '2026-06-28T16:00:00Z',
      notes: 'Paiement reçu par virement Qonto.',
      qonto_synced: true,
      geoloc_lat: 14.605,
      geoloc_lng: -61.006,
    },
    {
      id: crypto.randomUUID(),
      type: 'bon_commande',
      reference: 'BC-2026-0001',
      status: 'accepte',
      payment_status: 'non_paye',
      client_name: 'Coopérative Agricole du Nord',
      client_email: 'coop.nord@kopeagri.mq',
      client_phone: '0696 55 44 33',
      client_address: 'Morne-des-Esses',
      lines: [
        { id: crypto.randomUUID(), description: 'Plants de bananier (variété Grande Naine)', quantity: 500, unit: 'plants', unit_price: 2.50, tva_rate: 8.5, total_ht: 1250, total_ttc: 1356.25 },
        { id: crypto.randomUUID(), description: 'Engrais organique (sac 25kg)', quantity: 20, unit: 'sac', unit_price: 18, tva_rate: 20, total_ht: 360, total_ttc: 432 },
      ],
      subtotal_ht: 1610,
      total_tva: 178.25,
      total_ttc: 1788.25,
      due_date: '2026-08-15',
      created_at: '2026-07-02T08:00:00Z',
      sent_at: '2026-07-02T10:00:00Z',
      notes: 'Livraison sur parcelle Morne-des-Esses. BC confirmé par WhatsApp.',
      qonto_synced: false,
      geoloc_lat: 14.7064,
      geoloc_lng: -61.0256,
    },
  ]
  localStorage.setItem(DOC_KEY, JSON.stringify(docs))

  // Seed Qonto
  const qontoTxs: QontoTransaction[] = [
    { id: crypto.randomUUID(), date: '2026-06-28T16:00:00Z', amount: 1182.65, description: 'Virement - Supermarché Score', category: 'vente', status: 'completed', linked_document_id: docs[1].id },
    { id: crypto.randomUUID(), date: '2026-07-01T10:00:00Z', amount: -350, description: 'Achat plants bananier - Pépinière Duval', category: 'achat', status: 'completed' },
    { id: crypto.randomUUID(), date: '2026-07-02T08:00:00Z', amount: -89.50, description: 'Carburant camion', category: 'transport', status: 'completed' },
    { id: crypto.randomUUID(), date: '2026-07-03T09:00:00Z', amount: 492.28, description: 'Virement - Restaurant Le Salomon (devis DEV-2026-0001)', category: 'vente', status: 'pending' },
  ]
  localStorage.setItem(QONTO_KEY, JSON.stringify(qontoTxs))

  // Seed Geo Members
  const geoMembers: GeoMember[] = [
    { id: crypto.randomUUID(), name: 'Ferme de la Plaine', type: 'producteur', lat: 14.617, lng: -60.907, commune: 'Le François', phone: '0696 12 34 56', specialites: ['banane', 'mangue', 'ananas'] },
    { id: crypto.randomUUID(), name: 'Domaine du Morne', type: 'producteur', lat: 14.7512, lng: -61.1292, commune: 'Le Morne-Rouge', phone: '0696 22 33 44', specialites: ['café', 'cacao', 'vanille'] },
    { id: crypto.randomUUID(), name: 'Jardins de Saint-Pierre', type: 'producteur', lat: 14.7433, lng: -61.1713, commune: 'Saint-Pierre', phone: '0696 33 44 55', specialites: ['légumes', 'tomate', 'laitue'] },
    { id: crypto.randomUUID(), name: 'Parcelle Bassignac', type: 'parcelle', lat: 14.65, lng: -61.06, commune: 'Fort-de-France', phone: '', specialites: ['banane'], superficie_ha: 4.5 },
    { id: crypto.randomUUID(), name: 'Parcelle Didier', type: 'parcelle', lat: 14.62, lng: -60.94, commune: 'Le François', phone: '', specialites: ['mangue', 'avocat'], superficie_ha: 2.8 },
    { id: crypto.randomUUID(), name: 'Transport Tropical Express', type: 'transporteur', lat: 14.605, lng: -61.006, commune: 'Le Lamentin', phone: '0696 44 55 66' },
    { id: crypto.randomUUID(), name: 'Livraison Caraïbes', type: 'transporteur', lat: 14.4737, lng: -60.8708, commune: 'Le Marin', phone: '0696 55 66 77' },
    { id: crypto.randomUUID(), name: 'Distribution Antilles', type: 'distributeur', lat: 14.6161, lng: -61.0636, commune: 'Fort-de-France', phone: '0696 66 77 88', specialites: ['fruits', 'légumes'] },
  ]
  localStorage.setItem(GEO_KEY, JSON.stringify(geoMembers))
}

seedBillingIfEmpty()

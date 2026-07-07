import React, { useState, useEffect, useCallback } from 'react'
import {
  Globe, Package, FileCheck, MapPin, Truck, CheckSquare, Square,
  ChevronDown, ChevronUp, Plus, Search, MessageCircle, X,
  Ship, Container, ClipboardList, ArrowRightLeft, Users, Phone
} from 'lucide-react'
import { getAll, getActive } from '../services/dataService'
import type { Producer, Distributor, LogisticsProvider } from '../services/dataService'
import { AGRICULTURE_CULTURES } from '../services/dataService'

// ===== Types =====
export type ExportLotStatus = 'export_ready' | 'pending' | 'in_transit' | 'delivered' | 'cancelled'
export type LogisticsStatus = 'non_assigne' | 'transport_assigne' | 'transit_en_cours' | 'arrive_destination'

export interface ExportDocument {
  key: string
  label: string
  checked: boolean
}

export interface ExportLot {
  id: string
  product: string
  quantity: string
  producer: string
  producer_commune: string
  destination: string
  status: ExportLotStatus
  logistics_status: LogisticsStatus
  export_date: string
  documents: ExportDocument[]
  created_at: string
  updated_at: string
}

const EXPORT_STORE = 'kopeagri_export_lots'

const STATUS_CONFIG: Record<ExportLotStatus, { label: string; color: string; bg: string; emoji: string }> = {
  export_ready: { label: 'Exportable', color: '#2E7D32', bg: '#E8F5E9', emoji: '✅' },
  pending: { label: 'En attente', color: '#e65100', bg: '#FFF3E0', emoji: '⏳' },
  in_transit: { label: 'En transit', color: '#0268a6', bg: '#E1F5FE', emoji: '🚢' },
  delivered: { label: 'Livré', color: '#1b6b22', bg: '#C8E6C9', emoji: '📦' },
  cancelled: { label: 'Annulé', color: '#b71c1c', bg: '#FFEBEE', emoji: '❌' },
}

const LOGISTICS_CONFIG: Record<LogisticsStatus, { label: string; color: string }> = {
  non_assigne: { label: 'Non assigné', color: '#9E9E9E' },
  transport_assigne: { label: 'Transport assigné', color: '#FF9800' },
  transit_en_cours: { label: 'Transit en cours', color: '#0277BD' },
  arrive_destination: { label: 'Arrivé à destination', color: '#2E7D32' },
}

const DESTINATIONS = [
  'Guadeloupe (Pointe-à-Pitre)',
  'Sainte-Lucie',
  'Dominique',
  'France métropolitaine (Le Havre)',
  'Canada (Montréal)',
  'Barbade',
  'Trinité-et-Tobago',
  'Haïti',
  'Guyane française',
]

const DOCUMENT_TEMPLATES: Omit<ExportDocument, 'checked'>[] = [
  { key: 'phyto', label: 'Certificat phytosanitaire' },
  { key: 'invoice', label: 'Facture commerciale' },
  { key: 'packing', label: 'Liste de colisage' },
  { key: 'bill', label: 'Connaissement (B/L)' },
  { key: 'customs', label: 'Déclaration douanière' },
]

// ===== localStorage CRUD =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getAllExportLots(): ExportLot[] {
  try {
    const raw = localStorage.getItem(EXPORT_STORE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveExportLots(lots: ExportLot[]): void {
  localStorage.setItem(EXPORT_STORE, JSON.stringify(lots))
}

function createExportLot(data: Omit<ExportLot, 'id' | 'created_at' | 'updated_at' | 'documents' | 'status' | 'logistics_status'> & { documents?: ExportDocument[] }): ExportLot {
  const lot: ExportLot = {
    ...data,
    id: generateId(),
    status: 'pending',
    logistics_status: 'non_assigne',
    documents: data.documents || DOCUMENT_TEMPLATES.map(d => ({ ...d, checked: false })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const all = getAllExportLots()
  all.push(lot)
  saveExportLots(all)
  return lot
}

function updateExportLot(id: string, updates: Partial<ExportLot>): ExportLot | null {
  const all = getAllExportLots()
  const idx = all.findIndex(l => l.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() }
  saveExportLots(all)
  return all[idx]
}

function toggleDocument(lotId: string, docKey: string): ExportLot | null {
  const all = getAllExportLots()
  const idx = all.findIndex(l => l.id === lotId)
  if (idx === -1) return null
  const docIdx = all[idx].documents.findIndex(d => d.key === docKey)
  if (docIdx === -1) return null
  all[idx].documents[docIdx].checked = !all[idx].documents[docIdx].checked
  all[idx].updated_at = new Date().toISOString()
  saveExportLots(all)
  return all[idx]
}

function deleteExportLot(id: string): boolean {
  const all = getAllExportLots()
  const idx = all.findIndex(l => l.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  saveExportLots(all)
  return true
}

// ===== Seed =====
const SEED_EXPORT_KEY = 'kopeagri_export_seeded_v1'

function seedExportLots(): void {
  if (localStorage.getItem(SEED_EXPORT_KEY)) return
  const now = new Date().toISOString()

  const lots: ExportLot[] = [
    {
      id: 'ex1',
      product: 'Banane Cavendish',
      quantity: '2 500 kg',
      producer: 'Habitation Clément',
      producer_commune: 'Le François',
      destination: 'Guadeloupe (Pointe-à-Pitre)',
      status: 'export_ready',
      logistics_status: 'transport_assigne',
      export_date: '2026-07-15',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: true },
        { key: 'invoice', label: 'Facture commerciale', checked: true },
        { key: 'packing', label: 'Liste de colisage', checked: true },
        { key: 'bill', label: 'Connaissement (B/L)', checked: false },
        { key: 'customs', label: 'Déclaration douanière', checked: false },
      ],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ex2',
      product: 'Mangue José',
      quantity: '800 kg',
      producer: 'Domaine de la Montagne Pelée',
      producer_commune: 'Le Morne-Rouge',
      destination: 'France métropolitaine (Le Havre)',
      status: 'pending',
      logistics_status: 'non_assigne',
      export_date: '2026-07-22',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: true },
        { key: 'invoice', label: 'Facture commerciale', checked: false },
        { key: 'packing', label: 'Liste de colisage', checked: false },
        { key: 'bill', label: 'Connaissement (B/L)', checked: false },
        { key: 'customs', label: 'Déclaration douanière', checked: false },
      ],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ex3',
      product: 'Avocat Haas',
      quantity: '600 kg',
      producer: 'Domaine de la Montagne Pelée',
      producer_commune: 'Le Morne-Rouge',
      destination: 'Sainte-Lucie',
      status: 'export_ready',
      logistics_status: 'non_assigne',
      export_date: '2026-07-18',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: true },
        { key: 'invoice', label: 'Facture commerciale', checked: true },
        { key: 'packing', label: 'Liste de colisage', checked: true },
        { key: 'bill', label: 'Connaissement (B/L)', checked: true },
        { key: 'customs', label: 'Déclaration douanière', checked: true },
      ],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ex4',
      product: 'Ananas Victoria',
      quantity: '1 200 pièce',
      producer: 'Habitation Clément',
      producer_commune: 'Le François',
      destination: 'Canada (Montréal)',
      status: 'pending',
      logistics_status: 'non_assigne',
      export_date: '2026-08-01',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: false },
        { key: 'invoice', label: 'Facture commerciale', checked: false },
        { key: 'packing', label: 'Liste de colisage', checked: false },
        { key: 'bill', label: 'Connaissement (B/L)', checked: false },
        { key: 'customs', label: 'Déclaration douanière', checked: false },
      ],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ex5',
      product: 'Cacao',
      quantity: '400 kg',
      producer: 'Plantation Grand-Rivière',
      producer_commune: 'Grand-Rivière',
      destination: 'France métropolitaine (Le Havre)',
      status: 'in_transit',
      logistics_status: 'transit_en_cours',
      export_date: '2026-07-05',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: true },
        { key: 'invoice', label: 'Facture commerciale', checked: true },
        { key: 'packing', label: 'Liste de colisage', checked: true },
        { key: 'bill', label: 'Connaissement (B/L)', checked: true },
        { key: 'customs', label: 'Déclaration douanière', checked: true },
      ],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ex6',
      product: 'Vanille',
      quantity: '50 kg',
      producer: 'Plantation Grand-Rivière',
      producer_commune: 'Grand-Rivière',
      destination: 'Dominique',
      status: 'delivered',
      logistics_status: 'arrive_destination',
      export_date: '2026-06-20',
      documents: [
        { key: 'phyto', label: 'Certificat phytosanitaire', checked: true },
        { key: 'invoice', label: 'Facture commerciale', checked: true },
        { key: 'packing', label: 'Liste de colisage', checked: true },
        { key: 'bill', label: 'Connaissement (B/L)', checked: true },
        { key: 'customs', label: 'Déclaration douanière', checked: true },
      ],
      created_at: now,
      updated_at: now,
    },
  ]

  saveExportLots(lots)
  localStorage.setItem(SEED_EXPORT_KEY, '1')
}

// Seed on module load
seedExportLots()

// ===== WhatsApp URL builder =====
function buildWhatsAppUrl(lot: ExportLot): string {
  const phone = '596696000000'
  const text = encodeURIComponent(
    `Bonjour KopéAgri Export 🌍,\n\n` +
    `📦 Lot export : ${lot.product} — ${lot.quantity}\n` +
    `👤 Producteur : ${lot.producer} (${lot.producer_commune})\n` +
    `📍 Destination : ${lot.destination}\n` +
    `📅 Date d'export : ${lot.export_date}\n` +
    `📋 Statut : ${STATUS_CONFIG[lot.status]?.label || lot.status}\n\n` +
    `Je souhaite coordonner la logistique pour ce lot. Merci !`
  )
  return `https://wa.me/${phone}?text=${text}`
}

// ===== Component =====
const ExportPage: React.FC = () => {
  const [lots, setLots] = useState<ExportLot[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ExportLotStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [producers, setProducers] = useState<Producer[]>([])

  const load = useCallback(() => {
    setLots(getAllExportLots())
    setProducers(getActive('producers') as Producer[])
  }, [])

  useEffect(() => { load() }, [load])

  // Stats
  const exportReady = lots.filter(l => l.status === 'export_ready').length
  const inTransit = lots.filter(l => l.status === 'in_transit' || l.logistics_status === 'transit_en_cours').length
  const docsReady = lots.filter(l => l.documents.every(d => d.checked)).length
  const activeDestinations = new Set(lots.filter(l => l.status !== 'cancelled' && l.status !== 'delivered').map(l => l.destination)).size

  // Filtered lots
  const filtered = lots.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        l.product.toLowerCase().includes(s) ||
        l.producer.toLowerCase().includes(s) ||
        l.destination.toLowerCase().includes(s)
      )
    }
    return true
  })

  const handleToggleDoc = (lotId: string, docKey: string) => {
    toggleDocument(lotId, docKey)
    load()
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const selectedDocs = fd.getAll('documents') as string[]
    const documents = DOCUMENT_TEMPLATES.map(d => ({
      ...d,
      checked: selectedDocs.includes(d.key),
    }))

    createExportLot({
      product: fd.get('product') as string,
      quantity: fd.get('quantity') as string,
      producer: fd.get('producer') as string,
      producer_commune: fd.get('producer_commune') as string,
      destination: fd.get('destination') as string,
      export_date: fd.get('export_date') as string,
      documents,
    })

    setShowCreateForm(false)
    load()
  }

  const handleStatusChange = (id: string, status: ExportLotStatus) => {
    updateExportLot(id, { status })
    load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce lot export ? Cette action est irréversible.')) {
      deleteExportLot(id)
      load()
    }
  }

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const productEmoji: Record<string, string> = {
    'Banane Cavendish': '🍌', 'Banane plantain': '🍌',
    'Mangue José': '🥭', 'Mangue Amélie': '🥭',
    'Avocat Haas': '🥑', 'Ananas Victoria': '🍍',
    'Cacao': '🍫', 'Vanille': '🌿', 'Café': '☕',
    'Citron vert': '🍋', 'Patate douce': '🍠',
    'Igname': '🥔', 'Coco': '🥥',
  }

  const getEmoji = (product: string) => productEmoji[product] || '📦'

  return (
    <div className="page">
      {/* ===== Page Header ===== */}
      <div className="page-header">
        <h1><Globe size={28} /> Module Export 🌍</h1>
        <p className="page-subtitle">Lots exportables, groupage, documents, traçabilité Caraïbes et international</p>
      </div>

      {/* ===== Stats Row ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">{exportReady}</span>
            <span className="stat-label">Lots exportables</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E1F5FE', color: '#0268a6' }}>
            <Ship size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">{inTransit}</span>
            <span className="stat-label">En cours d'export</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF8E1', color: '#c66200' }}>
            <FileCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">{docsReady}</span>
            <span className="stat-label">Documents prêts</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: '#5c1580' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">{activeDestinations}</span>
            <span className="stat-label">Destinations actives</span>
          </div>
        </div>
      </div>

      {/* ===== Groupage Section ===== */}
      <div className="section-block" style={{ marginBottom: '24px' }}>
        <h2><Container size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Consolidation des volumes — Groupage</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '18px', lineHeight: 1.7 }}>
          Regroupez les volumes de plusieurs petits producteurs en un seul lot export optimisé.
          Le groupage permet de remplir un conteneur complet, réduire les coûts logistiques unitaires
          et accéder aux marchés internationaux même avec de petites quantités.
        </p>

        {/* Groupage Example Card */}
        <div style={{
          background: 'var(--green-50)',
          border: '2px solid var(--green-500)',
          borderRadius: 'var(--radius)',
          padding: '22px',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              background: 'white', padding: '14px 18px', borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow)', minWidth: '200px',
            }}>
              <span className="badge badge-green" style={{ marginBottom: '6px' }}>🧑‍🌾 3 producteurs</span>
              <strong style={{ fontSize: '16px' }}>Banane de Saint-Pierre</strong>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Ferme Aublet • Habitation Bébé • Koulibri du Vauclin
              </span>
            </div>

            <ArrowRightLeft size={28} style={{ color: 'var(--green-700)', flexShrink: 0 }} />

            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              background: 'white', padding: '14px 18px', borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow)', minWidth: '180px',
            }}>
              <span className="badge badge-blue" style={{ marginBottom: '6px' }}>🚛 1 conteneur 20'</span>
              <strong style={{ fontSize: '16px' }}>Fort-de-France</strong>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Port de pointe — chargement</span>
            </div>

            <ArrowRightLeft size={28} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />

            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              background: 'white', padding: '14px 18px', borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow)', minWidth: '180px',
            }}>
              <span className="badge badge-purple" style={{ marginBottom: '6px' }}>🚢 Destination</span>
              <strong style={{ fontSize: '16px' }}>Pointe-à-Pitre</strong>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Guadeloupe — livraison</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.6 }}>
          💡 <strong>Conseil :</strong> Contactez la coopérative pour organiser un groupage.
          Les transporteurs comme <em>LogiKarib</em> et <em>Cargo Antilles Transit</em> offrent des services de consolidation au port de Fort-de-France.
        </p>
      </div>

      {/* ===== Search & Filters ===== */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher produit, producteur, destination..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-btns">
          {(['all', 'export_ready', 'pending', 'in_transit', 'delivered'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filterStatus === f ? 'active' : ''}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === 'all' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Create Button ===== */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus size={18} />
          {showCreateForm ? 'Fermer le formulaire' : 'Nouveau lot export'}
        </button>
      </div>

      {/* ===== Create Export Lot Form ===== */}
      {showCreateForm && (
        <div className="section-block" style={{ border: '2px solid var(--green-100)', marginBottom: '24px' }}>
          <h2><Plus size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Créer un lot export</h2>
          <form onSubmit={handleCreate}>
            <div className="rfq-form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label>🥭 Produit</label>
                <select name="product" className="form-input" required>
                  <option value="">— Choisir un produit —</option>
                  {AGRICULTURE_CULTURES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>📦 Quantité</label>
                <input name="quantity" className="form-input" placeholder="ex : 500 kg" required />
              </div>
              <div className="form-group">
                <label>👤 Producteur</label>
                <select name="producer" className="form-input" required>
                  <option value="">— Choisir un producteur —</option>
                  {producers.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.commune})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>📍 Commune du producteur</label>
                <input name="producer_commune" className="form-input" placeholder="Sera rempli automatiquement" />
              </div>
              <div className="form-group">
                <label>🌍 Destination</label>
                <select name="destination" className="form-input" required>
                  <option value="">— Choisir une destination —</option>
                  {DESTINATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>📅 Date d'export prévue</label>
                <input name="export_date" type="date" className="form-input" required />
              </div>
            </div>

            {/* Document checklist */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '10px' }}>
                📋 Documents déjà préparés ?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DOCUMENT_TEMPLATES.map(d => (
                  <label key={d.key} className="toggle-label" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" name="documents" value={d.key} />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreateForm(false)}>
                <X size={16} /> Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                <Package size={16} /> Créer le lot export
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Export Lots List ===== */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h3>Aucun lot export trouvé</h3>
          <p>Créez un nouveau lot export pour commencer à suivre vos expéditions Caraïbes et international.</p>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <Plus size={18} /> Nouveau lot export
          </button>
        </div>
      ) : (
        <div className="export-lots-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(lot => {
            const st = STATUS_CONFIG[lot.status] || STATUS_CONFIG.pending
            const ls = LOGISTICS_CONFIG[lot.logistics_status] || LOGISTICS_CONFIG.non_assigne
            const docsComplete = lot.documents.every(d => d.checked)
            const docsCount = lot.documents.filter(d => d.checked).length
            const isExpanded = expandedId === lot.id

            return (
              <div key={lot.id} className="section-block" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card Header */}
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 22px', cursor: 'pointer', gap: '14px',
                    minHeight: 'var(--touch-min)',
                  }}
                  onClick={() => handleExpand(lot.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '32px', flexShrink: 0 }}>{getEmoji(lot.product)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '17px' }}>{lot.product}</strong>
                        <span
                          className="badge"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.emoji} {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>📦 {lot.quantity}</span>
                        <span>👤 {lot.producer}</span>
                        <span>📍 {lot.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span
                      className="badge"
                      style={{ background: ls.color + '20', color: ls.color, whiteSpace: 'nowrap' }}
                    >
                      🚛 {ls.label}
                    </span>
                    <span className="badge" style={{
                      background: docsComplete ? 'var(--green-100)' : 'var(--gold-100)',
                      color: docsComplete ? 'var(--green-700)' : '#c66200',
                    }}>
                      📋 {docsCount}/{lot.documents.length}
                    </span>
                    {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--gray-400)' }} /> : <ChevronDown size={20} style={{ color: 'var(--gray-400)' }} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '0 22px 22px', borderTop: '1px solid var(--gray-100)' }}>
                    {/* Details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '18px 0' }}>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Producteur</span>
                        <strong>{lot.producer}</strong>
                        <span style={{ color: 'var(--gray-500)', marginLeft: '6px' }}>({lot.producer_commune})</span>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Destination</span>
                        <strong>{lot.destination}</strong>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Quantité</span>
                        <strong>{lot.quantity}</strong>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Date d'export</span>
                        <strong>{lot.export_date}</strong>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Statut logistique</span>
                        <span style={{ color: ls.color, fontWeight: 600 }}>🚛 {ls.label}</span>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: 'var(--gray-500)', display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Créé le</span>
                        <span>{new Date(lot.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Documents Checklist */}
                    <div style={{ marginTop: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={18} /> Documents du lot
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {lot.documents.map(doc => (
                          <div
                            key={doc.key}
                            onClick={() => handleToggleDoc(lot.id, doc.key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                              background: doc.checked ? 'var(--green-100)' : 'var(--gray-50)',
                              cursor: 'pointer', transition: 'all 0.15s',
                              border: doc.checked ? '1px solid var(--green-500)' : '1px solid var(--gray-200)',
                              minHeight: 'var(--touch-min)',
                            }}
                          >
                            {doc.checked
                              ? <CheckSquare size={20} style={{ color: 'var(--green-700)', flexShrink: 0 }} />
                              : <Square size={20} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                            }
                            <span style={{
                              fontSize: '14px', fontWeight: doc.checked ? 600 : 400,
                              color: doc.checked ? 'var(--green-700)' : 'var(--gray-700)',
                              flex: 1,
                            }}>
                              {doc.label}
                            </span>
                            {doc.checked && <span className="badge badge-green" style={{ flexShrink: 0 }}>✓ Prêt</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
                      {/* Status change */}
                      {lot.status === 'pending' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(lot.id, 'export_ready')}>
                          <CheckSquare size={14} /> Marquer exportable
                        </button>
                      )}
                      {lot.status === 'export_ready' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(lot.id, 'in_transit')}>
                          <Ship size={14} /> Déclarer en transit
                        </button>
                      )}
                      {lot.status === 'in_transit' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(lot.id, 'delivered')}>
                          <Package size={14} /> Déclarer livré
                        </button>
                      )}

                      {/* WhatsApp CTA */}
                      <a
                        href={buildWhatsAppUrl(lot)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-whatsapp"
                        style={{ textDecoration: 'none' }}
                      >
                        <MessageCircle size={16} /> Coord. logistique WhatsApp
                      </a>

                      {/* Delete */}
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)', marginLeft: 'auto' }}
                        onClick={() => handleDelete(lot.id)}
                      >
                        <X size={14} /> Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ===== WhatsApp CTA Banner ===== */}
      <div className="whatsapp-banner" style={{ marginTop: '28px' }}>
        <span className="wa-banner-icon">💬</span>
        <div className="wa-banner-text">
          <strong>Coordination logistique par WhatsApp</strong>
          <p>Échangez directement avec les transporteurs, transitaires et producteurs pour organiser vos expéditions export en temps réel.</p>
        </div>
        <a
          href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%20Export%2C%20j%27ai%20besoin%20d%27aide%20pour%20un%20lot%20export."
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
          style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          <MessageCircle size={18} /> Contacter KopéAgri
        </a>
      </div>
    </div>
  )
}

export default ExportPage

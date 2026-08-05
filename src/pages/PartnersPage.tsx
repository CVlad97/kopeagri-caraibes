import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, Mail, Phone, Globe, Handshake, Filter,
  Download, MessageCircle, ChevronDown, ChevronUp, X, Edit3, Trash2
} from 'lucide-react'

/* ===== Types ===== */
interface Partner {
  id: string
  name: string
  type: 'Institution' | 'GIE' | 'Transporteur' | 'Acheteur B2B' | 'Tech/Innovation'
  description: string
  email: string
  phone: string
  website: string
  address: string
  status: 'prospect' | 'contacté' | 'en négociation' | 'signé'
  logo: string
  created_at: string
}

const LS_KEY = 'kopeagri_partners'

const CATEGORIES: Partner['type'][] = ['Institution', 'GIE', 'Transporteur', 'Acheteur B2B', 'Tech/Innovation']
const STATUSES: Partner['status'][] = ['prospect', 'contacté', 'en négociation', 'signé']

const STATUS_CFG: Record<Partner['status'], { label: string; color: string; emoji: string }> = {
  prospect: { label: 'Prospect', color: '#9E9E9E', emoji: '🔍' },
  contacté: { label: 'Contacté', color: '#2196F3', emoji: '📞' },
  'en négociation': { label: 'En négociation', color: '#FF9800', emoji: '🤝' },
  signé: { label: 'Signé', color: '#4CAF50', emoji: '✅' },
}

const TYPE_EMOJI: Record<Partner['type'], string> = {
  Institution: '🏛️',
  GIE: '🤝',
  Transporteur: '🚛',
  'Acheteur B2B': '🏢',
  'Tech/Innovation': '💡',
}

const CATEGORY_TAB_LABELS: Record<string, string> = {
  all: 'Tous',
  Institution: '🏛️ Institutions',
  GIE: '🤝 GIE',
  Transporteur: '🚛 Transport',
  'Acheteur B2B': '🏢 Acheteurs',
  'Tech/Innovation': '💡 Tech',
}

/* ===== Seed data — Real Martinique agricultural contacts ===== */
const SEED_PARTNERS: Omit<Partner, 'id' | 'created_at'>[] = [
  {
    name: 'Chambre d\'Agriculture Martinique',
    type: 'Institution',
    description: 'Organisme consulaire représentant les intérêts du monde agricole martiniquais. Accompagnement technique, formation et conseil aux exploitants agricoles.',
    email: 'accueil@martinique.chambreagri.fr',
    phone: '05 96 51 75 15',
    website: 'www.martinique.chambreagri.fr',
    address: 'Place d\'Armes BP 312, 97288 Le Lamentin',
    status: 'contacté',
    logo: '',
  },
  {
    name: 'DAAF Martinique',
    type: 'Institution',
    description: 'Direction de l\'Alimentation, de l\'Agriculture et de la Forêt de Martinique. Pilote les politiques publiques agricoles et rurales du territoire.',
    email: 'daaf-martinique@agriculture.gouv.fr',
    phone: '',
    website: 'www.daaf.martinique.agriculture.gouv.fr',
    address: 'Rue Pierre Alix, 97200 Fort-de-France',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'CTM — Collectivité Territoriale de Martinique (Pôle Agriculture)',
    type: 'Institution',
    description: 'Collectivité territoriale unique de Martinique. Le pôle agriculture pilote les compétences transférées en matière de développement agricole et rural.',
    email: 'contact@ctm.mq',
    phone: '0596 59 50 00',
    website: 'www.ctm.mq',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'FranceAgriMer — Délégation Martinique',
    type: 'Institution',
    description: 'Établissement national des produits de l\'agriculture et de la mer. Délégation locale pour les aides, la régulation des marchés et l\'organisation des filières.',
    email: 'martinique@franceagrimer.fr',
    phone: '',
    website: 'www.franceagrimer.fr',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'UGP Banane',
    type: 'GIE',
    description: 'Union des Groupements de Producteurs de Banane. Organisation de producteurs majeure pour la filière banane martiniquaise, regroupant la majorité des producteurs.',
    email: 'contact@ugp-banane.fr',
    phone: '',
    website: 'www.ugp-banane.fr',
    address: '',
    status: 'en négociation',
    logo: '',
  },
  {
    name: 'CGBM — Comité Guadeloupéen de la Banane et de la Martinique',
    type: 'GIE',
    description: 'Interprofession bananière représentant les producteurs de banane des Antilles françaises. Défense des intérêts, recherche et développement de la filière.',
    email: 'info@cgbm.fr',
    phone: '',
    website: '',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'CCIM — Chambre de Commerce et d\'Industrie de Martinique',
    type: 'Institution',
    description: 'Organisme consulaire au service des entreprises martiniquaises. Accompagnement commerce, industrie, services et internationalisation.',
    email: 'accueil@ccim.mq',
    phone: '0596 59 21 21',
    website: 'www.ccim.mq',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'Port Autonome de Martinique',
    type: 'Transporteur',
    description: 'Opérateur portuaire stratégique pour l\'import-export agricole de Martinique. Gestion des flux logistiques maritimes et infrastructures portuaires.',
    email: 'contact@port-martinique.fr',
    phone: '',
    website: 'www.port-martinique.fr',
    address: '97200 Fort-de-France',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'BPI France Martinique',
    type: 'Institution',
    description: 'Banque publique d\'investissement. Financement de la création, reprise et développement d\'entreprises agricoles. Prêts et garanties adaptés aux filières ultramarines.',
    email: 'martinique@bpifrance.fr',
    phone: '',
    website: 'www.bpifrance.fr',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'ADEME Martinique',
    type: 'Institution',
    description: 'Agence de la transition écologique. Accompagnement pour l\'agriculture durable, la gestion des déchets agricoles, l\'efficacité énergétique et les circuits courts.',
    email: 'martinique@ademe.fr',
    phone: '',
    website: 'www.ademe.fr',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'Crédit Agricole Martinique',
    type: 'Institution',
    description: 'Banque mutualiste historique du monde agricole martiniquais. Financement agricole, assurances et accompagnement des exploitants et GIE.',
    email: 'contact@ca-martinique.fr',
    phone: '',
    website: 'www.ca-martinique.fr',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'Super U Martinique (Groupement)',
    type: 'Acheteur B2B',
    description: 'Enseigne de grande distribution présente en Martinique. Partenaire potentiel pour la mise en rayon de produits locaux et circuits courts.',
    email: '',
    phone: '',
    website: 'www.magasins-u.com',
    address: '',
    status: 'prospect',
    logo: '',
  },
  {
    name: 'Carrefour Martinique',
    type: 'Acheteur B2B',
    description: 'Leader de la grande distribution en Martinique. Programme de référencement de produits locaux et partenariats filières avec les producteurs antillais.',
    email: '',
    phone: '',
    website: 'www.carrefour.fr',
    address: '',
    status: 'prospect',
    logo: '',
  },
]

/* ===== CRUD helpers ===== */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getAll(): Partner[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
    // First load: seed with real Martinique contacts
    const seeded = SEED_PARTNERS.map(s => ({
      ...s,
      id: generateId(),
      created_at: new Date().toISOString(),
    }))
    localStorage.setItem(LS_KEY, JSON.stringify(seeded))
    return seeded
  } catch { return [] }
}

function saveAll(items: Partner[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function addPartner(item: Omit<Partner, 'id' | 'created_at'>): Partner {
  const all = getAll()
  const newItem: Partner = { ...item, id: generateId(), created_at: new Date().toISOString() }
  all.push(newItem)
  saveAll(all)
  return newItem
}

function updatePartner(id: string, data: Partial<Partner>): void {
  const all = getAll().map(p => p.id === id ? { ...p, ...data } : p)
  saveAll(all)
}

function deletePartner(id: string): void {
  saveAll(getAll().filter(p => p.id !== id))
}

/* ===== CSV Export ===== */
function exportCSV(partners: Partner[]): void {
  const headers = ['Nom', 'Type', 'Statut', 'Email', 'Téléphone', 'Site web', 'Adresse', 'Description']
  const rows = partners.map(p => [
    p.name, p.type, p.status, p.email, p.phone, p.website, p.address, p.description.replace(/"/g, '""')
  ].map(v => `"${v}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'partenaires_kopeagri.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ===== Proposal Email ===== */
function openProposalEmail(partner: Partner): void {
  const subject = encodeURIComponent('KopéAgri Caraïbes — Proposition de partenariat')
  const body = encodeURIComponent(
    `Bonjour ${partner.name},\n\n` +
    `Nous sommes KopéAgri Caraïbes, la plateforme numérique dédiée à l'agriculture martiniquaise.\n\n` +
    `Notre mission : connecter producteurs, transporteurs et acheteurs pour une agriculture locale plus forte, plus visible et plus rentable.\n\n` +
    `🌐 Découvrez notre plateforme : https://kopeagri-caraibes.fr\n\n` +
    `Nous souhaitons vous proposer un partenariat afin de :\n` +
    `• Faciliter les mises en relation entre vos adhérents et nos utilisateurs\n` +
    `• Valoriser les produits locaux via notre marketplace\n` +
    `• Mutualiser nos outils de logistique et de facturation\n` +
    `• Développer ensemble des solutions adaptées aux réalités agricoles antillaises\n\n` +
    `Seriez-vous disponible pour un échange à ce sujet ?\n\n` +
    `Cordialement,\n` +
    `L'équipe KopéAgri Caraïbes\n` +
    `https://kopeagri-caraibes.fr`
  )
  window.open(`mailto:${partner.email}?subject=${subject}&body=${body}`, '_blank')
}

/* ===== Component ===== */
const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<Partner['type'] | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<Partner['status'] | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<Partner['type']>('Institution')
  const [formDesc, setFormDesc] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formWebsite, setFormWebsite] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formStatus, setFormStatus] = useState<Partner['status']>('prospect')

  const load = () => setPartners(getAll())
  useEffect(load, [])

  const resetForm = () => {
    setFormName(''); setFormType('Institution'); setFormDesc('')
    setFormEmail(''); setFormPhone(''); setFormWebsite(''); setFormAddress('')
    setFormStatus('prospect'); setEditId(null); setShowCreate(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: formName, type: formType, description: formDesc,
      email: formEmail, phone: formPhone, website: formWebsite,
      address: formAddress, status: formStatus, logo: '',
    }
    if (editId) {
      updatePartner(editId, data)
    } else {
      addPartner(data)
    }
    resetForm(); load()
  }

  const startEdit = (p: Partner) => {
    setFormName(p.name); setFormType(p.type); setFormDesc(p.description)
    setFormEmail(p.email); setFormPhone(p.phone); setFormWebsite(p.website)
    setFormAddress(p.address); setFormStatus(p.status); setEditId(p.id); setShowCreate(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce partenaire ?')) { deletePartner(id); load() }
  }

  const filtered = useMemo(() => partners.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || (p.address && p.address.toLowerCase().includes(q))
    }
    return true
  }), [partners, filterType, filterStatus, search])

  const stats = useMemo(() => ({
    total: partners.length,
    prospect: partners.filter(p => p.status === 'prospect').length,
    contacte: partners.filter(p => p.status === 'contacté').length,
    enNegociation: partners.filter(p => p.status === 'en négociation').length,
    signes: partners.filter(p => p.status === 'signé').length,
    parType: CATEGORIES.map(t => ({ type: t, count: partners.filter(p => p.type === t).length })),
  }), [partners])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Handshake size={28} /> Partenaires</h1>
          <p className="page-subtitle">Gérez vos partenariats institutionnels et commerciaux en Martinique</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(filtered)}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true) }}>
            <Plus size={18} /> Ajouter un partenaire
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>🤝</div>
          <div className="stat-info">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total partenaires</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>📞</div>
          <div className="stat-info">
            <span className="stat-num">{stats.contacte}</span>
            <span className="stat-label">Contactés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: 'var(--orange)' }}>🔄</div>
          <div className="stat-info">
            <span className="stat-num">{stats.enNegociation}</span>
            <span className="stat-label">En négociation</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>✅</div>
          <div className="stat-info">
            <span className="stat-num">{stats.signes}</span>
            <span className="stat-label">Signés</span>
          </div>
        </div>
      </div>

      {/* Category Stats by Type */}
      <div className="section-block" style={{ marginBottom: 24, padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {stats.parType.map(st => (
            <span key={st.type} style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{TYPE_EMOJI[st.type]}</span>
              <strong style={{ color: 'var(--gray-700)' }}>{st.count}</strong> {st.type}
            </span>
          ))}
        </div>
      </div>

      {/* Search + Category Filter Tabs */}
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          className="search-input"
          placeholder="Rechercher par nom, description, email, adresse..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-btns">
          {(['all', ...CATEGORIES] as const).map(t => (
            <button
              key={t}
              className={`filter-btn ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {CATEGORY_TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['all', ...STATUSES] as const).map(s => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'Tous statuts' : `${STATUS_CFG[s].emoji} ${STATUS_CFG[s].label}`}
          </button>
        ))}
      </div>

      {/* Partners Cards */}
      {filtered.length === 0 ? (
        <div className="section-block" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--gray-500)' }}>Aucun partenaire trouvé. Ajoutez votre premier partenaire !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filtered.map(p => (
            <div key={p.id} className="section-block" style={{ padding: 24, cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, background: 'var(--green-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                }}>
                  {TYPE_EMOJI[p.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{p.name}</h3>
                    <span className={`badge ${p.status === 'signé' ? 'badge-green' : p.status === 'en négociation' ? 'badge-gold' : p.status === 'contacté' ? 'badge-blue' : 'badge-orange'}`}>
                      {STATUS_CFG[p.status].emoji} {STATUS_CFG[p.status].label}
                    </span>
                  </div>
                  <span className="badge badge-teal" style={{ marginTop: 6 }}>{TYPE_EMOJI[p.type]} {p.type}</span>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 8, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                </div>
              </div>

              {expandedId === p.id && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {p.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        <Mail size={16} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
                        <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--blue-600)', wordBreak: 'break-all' }}>{p.email}</a>
                      </div>
                    )}
                    {p.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        <Phone size={16} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
                        <a href={`tel:${p.phone.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--blue-600)' }}>{p.phone}</a>
                      </div>
                    )}
                    {p.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        <Globe size={16} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
                        <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--blue-600)', wordBreak: 'break-all' }}>
                          {p.website}
                        </a>
                      </div>
                    )}
                    {p.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                        <span style={{ color: 'var(--gray-500)', flexShrink: 0, lineHeight: 1.6 }}>📍</span>
                        <span style={{ color: 'var(--gray-600)' }}>{p.address}</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.email && (
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); openProposalEmail(p) }}>
                        <Mail size={14} /> Proposer un partenariat
                      </button>
                    )}
                    {p.phone && (
                      <a
                        href={`https://wa.me/${p.phone.replace(/\s/g, '').replace(/^0/, '596')}?text=${encodeURIComponent(`Bonjour ${p.name}, suite à notre échange KopéAgri...`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-outline btn-sm" style={{ color: '#25D366', borderColor: '#25D366' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); startEdit(p) }}>
                      <Edit3 size={14} /> Modifier
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={e => { e.stopPropagation(); handleDelete(p.id) }}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => resetForm()}>
          <div
            style={{ background: 'var(--card-bg, white)', borderRadius: 'var(--radius)', padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', color: 'var(--text, inherit)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>{editId ? 'Modifier le partenaire' : 'Nouveau partenaire'}</h2>
              <button onClick={resetForm} style={{ background: 'none', color: 'var(--gray-500)', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-input" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nom du partenaire" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select className="form-input" value={formType} onChange={e => setFormType(e.target.value as Partner['type'])}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{TYPE_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut *</label>
                  <select className="form-input" value={formStatus} onChange={e => setFormStatus(e.target.value as Partner['status'])}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].emoji} {STATUS_CFG[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Description du partenaire et du partenariat" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="contact@exemple.fr" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-input" type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="0596 XX XX XX" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Site web</label>
                  <input className="form-input" value={formWebsite} onChange={e => setFormWebsite(e.target.value)} placeholder="www.exemple.fr" />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input className="form-input" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Adresse postale" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnersPage

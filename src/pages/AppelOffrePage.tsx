import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, Send, CheckCircle, XCircle, Clock, Truck, ShoppingCart, Archive, Globe, ChevronDown, ChevronUp, Zap, Trash2, Phone } from 'lucide-react'
import {
  getAllRFQ, createRFQ, sendRFQ, updatePartnerStatus, deleteRFQ,
  simulateResponses, matchPartners, MARTINIQUE_COMMUNES,
} from '../services/dataService'
import type { RFQ, RFQType, RFQStatus, RFQPartner } from '../services/dataService'

const STATUS_CONFIG: Record<RFQStatus, { label: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', color: '#9E9E9E', emoji: '📝' },
  envoyee: { label: 'Envoyée', color: '#2196F3', emoji: '📤' },
  confirmee: { label: 'Confirmée', color: '#4CAF50', emoji: '✅' },
  en_cours: { label: 'En cours', color: '#FF9800', emoji: '🔄' },
  livree: { label: 'Livrée', color: '#1B5E20', emoji: '📦' },
  annulee: { label: 'Annulée', color: '#F44336', emoji: '❌' },
}

const PARTNER_STATUS: Record<RFQPartner['status'], { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: '#9E9E9E' },
  contacte: { label: 'Contacté', color: '#2196F3' },
  interesse: { label: 'Intéressé', color: '#FF9800' },
  confirme: { label: 'Confirmé', color: '#4CAF50' },
  refuse: { label: 'Refusé', color: '#F44336' },
}

const TYPE_CONFIG: Record<RFQType, { label: string; emoji: string; icon: React.ReactNode }> = {
  transport: { label: 'Transport', emoji: '🚛', icon: <Truck size={16} /> },
  achat: { label: 'Achat', emoji: '🥭', icon: <ShoppingCart size={16} /> },
  stockage: { label: 'Stockage', emoji: '🏠', icon: <Archive size={16} /> },
  export: { label: 'Export', emoji: '🌍', icon: <Globe size={16} /> },
}

const AppelOffrePage: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<RFQStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)

  const load = () => setRfqs(getAllRFQ())
  useEffect(load, [])

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const produits = (fd.get('produits') as string).split(',').map(s => s.trim()).filter(Boolean)
    const rfq = createRFQ({
      title: fd.get('title') as string,
      type: fd.get('type') as RFQType,
      producteur: fd.get('producteur') as string,
      producteur_phone: fd.get('phone') as string,
      commune_depart: fd.get('commune_depart') as string,
      commune_arrivee: fd.get('commune_arrivee') as string,
      produits,
      quantite: fd.get('quantite') as string,
      date_souhaitee: fd.get('date_souhaitee') as string,
      budget_max: fd.get('budget_max') as string,
      notes: fd.get('notes') as string,
    })
    // Auto-match et envoi
    const partners = matchPartners(rfq)
    if (partners.length > 0) {
      sendRFQ(rfq.id)
    }
    setShowCreate(false)
    load()
  }

  const handleSend = (id: string) => {
    sendRFQ(id)
    load()
  }

  const handleSimulate = async (id: string) => {
    setSimulating(id)
    // Simule un délai comme si les partenaires répondaient
    await new Promise(r => setTimeout(r, 1500))
    simulateResponses(id)
    setSimulating(null)
    load()
  }

  const handlePartnerStatus = (rfqId: string, partnerId: string, status: RFQPartner['status']) => {
    updatePartnerStatus(rfqId, partnerId, status)
    load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet appel d\'offre ?')) {
      deleteRFQ(id)
      load()
    }
  }

  const filtered = rfqs.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.producteur.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: rfqs.length,
    envoyees: rfqs.filter(r => r.status === 'envoyee').length,
    confirmees: rfqs.filter(r => r.status === 'confirmee' || r.status === 'en_cours').length,
    livrees: rfqs.filter(r => r.status === 'livree').length,
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Send size={24} /> Appels d'Offre</h1>
          <p className="page-subtitle">Coordination rapide avec vos partenaires via WhatsApp</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={18} /> Nouvel appel d'offre
        </button>
      </div>

      {/* Stats rapides */}
      <div className="rfq-stats-row">
        <div className="rfq-stat-chip" style={{ borderColor: '#2196F3' }}>
          <span className="rfq-stat-num">{stats.envoyees}</span>
          <span className="rfq-stat-label">Envoyées</span>
        </div>
        <div className="rfq-stat-chip" style={{ borderColor: '#4CAF50' }}>
          <span className="rfq-stat-num">{stats.confirmees}</span>
          <span className="rfq-stat-label">Confirmées</span>
        </div>
        <div className="rfq-stat-chip" style={{ borderColor: '#1B5E20' }}>
          <span className="rfq-stat-num">{stats.livrees}</span>
          <span className="rfq-stat-label">Livrées</span>
        </div>
        <div className="rfq-stat-chip" style={{ borderColor: '#9E9E9E' }}>
          <span className="rfq-stat-num">{stats.total}</span>
          <span className="rfq-stat-label">Total</span>
        </div>
      </div>

      {/* Formulaire création */}
      {showCreate && (
        <div className="rfq-create-form">
          <h3>📋 Nouvel appel d'offre</h3>
          <form onSubmit={handleCreate}>
            <div className="rfq-form-grid">
              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input name="title" className="form-input" placeholder="Ex: Transport bananes Le François → FdF" required />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select name="type" className="form-input" required>
                  <option value="transport">🚛 Transport</option>
                  <option value="achat">🥭 Achat / Vente</option>
                  <option value="stockage">🏠 Stockage</option>
                  <option value="export">🌍 Export</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Producteur *</label>
                <input name="producteur" className="form-input" placeholder="Nom du producteur" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Phone size={14} /> Téléphone</label>
                <input name="phone" className="form-input" placeholder="0696 XX XX XX" />
              </div>
              <div className="form-group">
                <label className="form-label">Commune départ *</label>
                <select name="commune_depart" className="form-input" required>
                  {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Commune arrivée</label>
                <select name="commune_arrivee" className="form-input">
                  <option value="">— Non défini —</option>
                  {MARTINIQUE_COMMUNES.map(c => <option key={'a'+c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Produits *</label>
                <input name="produits" className="form-input" placeholder="Banane, Mangue (séparés par virgules)" required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantité *</label>
                <input name="quantite" className="form-input" placeholder="Ex: 500 kg" required />
              </div>
              <div className="form-group">
                <label className="form-label">📅 Date souhaitée</label>
                <input name="date_souhaitee" type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">💰 Budget max</label>
                <input name="budget_max" className="form-input" placeholder="Ex: 300€" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">📝 Notes</label>
              <textarea name="notes" className="form-input" rows={2} placeholder="Frigorifique obligatoire, créneau horaire..." />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary"><Send size={16} /> Créer et matcher</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="rfq-filters">
        <div className="search-bar">
          <Search size={18} />
          <input placeholder="Chercher un appel d'offre..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="rfq-status-filters">
          {(['all', 'brouillon', 'envoyee', 'confirmee', 'en_cours', 'livree'] as const).map(s => (
            <button
              key={s}
              className={`rfq-filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? '📋 Tous' : `${STATUS_CONFIG[s].emoji} ${STATUS_CONFIG[s].label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des appels d'offre */}
      <div className="rfq-list">
        {filtered.map(rfq => {
          const isExpanded = expandedId === rfq.id
          const statusCfg = STATUS_CONFIG[rfq.status]
          const typeCfg = TYPE_CONFIG[rfq.type]
          const confirmedPartners = rfq.partenaires.filter(p => p.status === 'confirme').length
          const totalPartners = rfq.partenaires.length

          return (
            <div key={rfq.id} className={`rfq-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="rfq-card-header" onClick={() => setExpandedId(isExpanded ? null : rfq.id)}>
                <div className="rfq-card-left">
                  <span className="rfq-type-badge">{typeCfg.emoji} {typeCfg.label}</span>
                  <h3>{rfq.title}</h3>
                  <div className="rfq-card-meta">
                    <span>👨‍🌾 {rfq.producteur}</span>
                    <span>📍 {rfq.commune_depart}{rfq.commune_arrivee ? ` → ${rfq.commune_arrivee}` : ''}</span>
                    <span>📦 {rfq.quantite}</span>
                  </div>
                </div>
                <div className="rfq-card-right">
                  <span className="rfq-status-badge" style={{ background: statusCfg.color + '20', color: statusCfg.color, borderColor: statusCfg.color }}>
                    {statusCfg.emoji} {statusCfg.label}
                  </span>
                  <div className="rfq-partners-count">
                    <MessageCircle size={14} /> {confirmedPartners}/{totalPartners} partenaires
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {isExpanded && (
                <div className="rfq-card-body">
                  <div className="rfq-details">
                    <div className="rfq-detail-row">
                      <span>🥭 Produits :</span>
                      <strong>{rfq.produits.join(', ')}</strong>
                    </div>
                    <div className="rfq-detail-row">
                      <span>📅 Date souhaitée :</span>
                      <strong>{rfq.date_souhaitee || 'À définir'}</strong>
                    </div>
                    <div className="rfq-detail-row">
                      <span>💰 Budget max :</span>
                      <strong>{rfq.budget_max || 'À discuter'}</strong>
                    </div>
                    {rfq.notes && (
                      <div className="rfq-detail-row">
                        <span>📝 Notes :</span>
                        <strong>{rfq.notes}</strong>
                      </div>
                    )}
                  </div>

                  {/* Partenaires matchés */}
                  <h4 className="rfq-partners-title">
                    <MessageCircle size={16} /> Partenaires contactés ({totalPartners})
                  </h4>
                  {rfq.partenaires.length === 0 ? (
                    <div className="rfq-no-partners">
                      {rfq.status === 'brouillon' ? (
                        <>
                          <p>Aucun partenaire matché. Envoyez l'appel d'offre pour trouver des partenaires.</p>
                          <button className="btn btn-primary" onClick={() => handleSend(rfq.id)}>
                            <Send size={16} /> Envoyer et matcher
                          </button>
                        </>
                      ) : (
                        <p>Aucun partenaire disponible pour ce type d'appel d'offre.</p>
                      )}
                    </div>
                  ) : (
                    <div className="rfq-partners-list">
                      {rfq.partenaires.map(p => {
                        const pCfg = PARTNER_STATUS[p.status]
                        return (
                          <div key={p.id} className="rfq-partner-card">
                            <div className="rfq-partner-info">
                              <div className="rfq-partner-name">
                                <span className="partner-type-badge">{p.type === 'transporteur' ? '🚛' : p.type === 'acheteur' ? '🏪' : p.type === 'exportateur' ? '🌍' : '🏠'}</span>
                                <strong>{p.name}</strong>
                              </div>
                              <div className="rfq-partner-meta">
                                <span>📍 {p.commune}</span>
                                <span>📞 {p.phone}</span>
                              </div>
                              <span className="rfq-partner-status" style={{ background: pCfg.color + '20', color: pCfg.color }}>
                                {pCfg.label}
                              </span>
                              {p.responded_at && (
                                <span className="rfq-partner-time">
                                  <Clock size={10} /> {new Date(p.responded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div className="rfq-partner-actions">
                              {/* WhatsApp */}
                              <a
                                href={p.status === 'en_attente'
                                  ? `https://wa.me/${p.phone.replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${p.name}, un appel d'offre KopéAgri vous concerne : ${rfq.title}. Êtes-vous disponible ?`)}`
                                  : `https://wa.me/${p.phone.replace(/\s/g, '')}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm whatsapp-btn"
                              >
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                              {/* Actions statut */}
                              {p.status === 'contacte' || p.status === 'en_attente' ? (
                                <>
                                  <button className="btn btn-sm btn-success" onClick={() => handlePartnerStatus(rfq.id, p.id, 'confirme')}>
                                    <CheckCircle size={14} /> Confirmer
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handlePartnerStatus(rfq.id, p.id, 'refuse')}>
                                    <XCircle size={14} />
                                  </button>
                                </>
                              ) : p.status === 'interesse' ? (
                                <button className="btn btn-sm btn-success" onClick={() => handlePartnerStatus(rfq.id, p.id, 'confirme')}>
                                  <CheckCircle size={14} /> Confirmer
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="rfq-card-actions">
                    {rfq.status === 'envoyee' && rfq.partenaires.length > 0 && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSimulate(rfq.id)}
                        disabled={simulating === rfq.id}
                      >
                        <Zap size={16} /> {simulating === rfq.id ? 'Simulation en cours...' : '⚡ Simuler réponses (démo)'}
                      </button>
                    )}
                    {rfq.status === 'confirmee' && (
                      <button className="btn btn-primary" onClick={() => { updatePartnerStatus(rfq.id, '', 'confirme'); load() }}>
                        <Truck size={16} /> Marquer en cours
                      </button>
                    )}
                    {rfq.status === 'en_cours' && (
                      <button className="btn btn-primary" onClick={() => { const r = getAllRFQ().find(x => x.id === rfq.id); if(r) { import('../services/dataService').then(m => m.updateRFQ(rfq.id, { status: 'livree' })); load() } }}>
                        📦 Marquer livrée
                      </button>
                    )}
                    {/* WhatsApp broadcast producteur */}
                    <a
                      href={`https://wa.me/${rfq.producteur_phone.replace(/\s/g, '')}?text=${encodeURIComponent(
                        `Bonjour, votre appel d'offre "${rfq.title}" est ${statusCfg.label.toLowerCase()}. ` +
                        `${confirmedPartners} partenaire(s) confirmé(s) sur ${totalPartners}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                    >
                      <MessageCircle size={16} /> Notifier le producteur
                    </a>
                    <button className="btn btn-outline btn-danger" onClick={() => handleDelete(rfq.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>Aucun appel d'offre trouvé</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Créer un appel d'offre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppelOffrePage

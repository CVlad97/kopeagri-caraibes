import React, { useState, useEffect } from 'react'
import { FileText, Plus, Send, CheckCircle, XCircle, CreditCard, MessageCircle, Search, ChevronDown, ChevronUp, Trash2, Zap, X, Phone, MapPin } from 'lucide-react'
import {
  getAllDocuments, createDocument, updateDocStatus, deleteDocument,
  calcLine, calcTotals, getAllQontoTransactions, syncQontoTransaction, getQontoBalance,
  getAllGeoMembers, addGeoMember, removeGeoMember, COMMUNE_COORDS,
  getQuickEstimate, PRICE_REFERENCES,
} from '../services/billingService'
import type { DocumentType, DocumentStatus, BillingDocument, DocumentLine, QontoTransaction, GeoMember, QuickEstimate } from '../services/billingService'

const TYPE_LABELS: Record<DocumentType, { label: string; emoji: string; color: string }> = {
  devis: { label: 'Devis', emoji: '📋', color: '#2196F3' },
  facture: { label: 'Facture', emoji: '🧾', color: '#4CAF50' },
  bon_commande: { label: 'Bon de commande', emoji: '📦', color: '#FF9800' },
}

const STATUS_CFG: Record<DocumentStatus, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: '#9E9E9E' },
  envoye: { label: 'Envoyé', color: '#2196F3' },
  accepte: { label: 'Accepté', color: '#4CAF50' },
  refuse: { label: 'Refusé', color: '#F44336' },
  paye: { label: 'Payé', color: '#4CAF50' },
  annule: { label: 'Annulé', color: '#9E9E9E' },
  expire: { label: 'Expiré', color: '#FF5722' },
}

const TVA_RATES = [0, 2.1, 5.5, 8.5, 10, 20]

const FacturationPage: React.FC = () => {
  const [tab, setTab] = useState<'documents' | 'qonto' | 'geo' | 'estimate'>('documents')
  const [docs, setDocs] = useState<BillingDocument[]>([])
  const [qontoTxs, setQontoTxs] = useState<QontoTransaction[]>([])
  const [qontoBalance, setQontoBalance] = useState({ income: 0, expenses: 0, balance: 0 })
  const [geoMembers, setGeoMembers] = useState<GeoMember[]>([])
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newDocType, setNewDocType] = useState<DocumentType>('devis')
  const [estimateQuery, setEstimateQuery] = useState('')
  const [estimateQty, setEstimateQty] = useState(1)
  const [estimateResult, setEstimateResult] = useState<QuickEstimate | null>(null)
  const [showGeoForm, setShowGeoForm] = useState(false)

  // Form state for new document
  const [formClient, setFormClient] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formLines, setFormLines] = useState<Array<{ description: string; quantity: number; unit: string; unit_price: number; tva_rate: number }>>([
    { description: '', quantity: 1, unit: 'kg', unit_price: 0, tva_rate: 8.5 }
  ])

  const load = () => {
    setDocs(getAllDocuments())
    setQontoTxs(getAllQontoTransactions())
    setQontoBalance(getQontoBalance())
    setGeoMembers(getAllGeoMembers())
  }
  useEffect(load, [])

  const filteredDocs = docs
    .filter(d => filterType === 'all' || d.type === filterType)
    .filter(d => !searchQuery || d.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.reference.toLowerCase().includes(searchQuery.toLowerCase()))

  const statsDocs = {
    devis: docs.filter(d => d.type === 'devis').length,
    factures: docs.filter(d => d.type === 'facture').length,
    bc: docs.filter(d => d.type === 'bon_commande').length,
    total_ttc: Math.round(docs.reduce((s, d) => s + d.total_ttc, 0) * 100) / 100,
    payees: Math.round(docs.filter(d => d.payment_status === 'paye').reduce((s, d) => s + d.total_ttc, 0) * 100) / 100,
    en_attente: Math.round(docs.filter(d => d.payment_status !== 'paye').reduce((s, d) => s + d.total_ttc, 0) * 100) / 100,
  }

  // Handle line change
  const handleLineChange = (idx: number, field: string, value: string | number) => {
    setFormLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const addLine = () => {
    setFormLines(prev => [...prev, { description: '', quantity: 1, unit: 'kg', unit_price: 0, tva_rate: 8.5 }])
  }

  const removeLine = (idx: number) => {
    setFormLines(prev => prev.filter((_, i) => i !== idx))
  }

  // Create document
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const computedLines: DocumentLine[] = formLines.map((l, i) => {
      const { total_ht, total_ttc } = calcLine(l)
      return { id: String(i + 1), description: l.description, quantity: l.quantity, unit: l.unit, unit_price: l.unit_price, tva_rate: l.tva_rate, total_ht, total_ttc }
    })
    const { subtotal_ht, total_tva, total_ttc } = calcTotals(computedLines)
    createDocument({
      type: newDocType,
      status: 'brouillon',
      payment_status: 'non_paye',
      client_name: formClient,
      client_email: formEmail,
      client_phone: formPhone,
      client_address: formAddress,
      lines: computedLines,
      subtotal_ht,
      total_tva,
      total_ttc,
      due_date: formDueDate,
      notes: formNotes,
      qonto_synced: false,
    })
    setShowCreate(false)
    resetForm()
    load()
  }

  const resetForm = () => {
    setFormClient(''); setFormEmail(''); setFormPhone(''); setFormAddress(''); setFormNotes(''); setFormDueDate('')
    setFormLines([{ description: '', quantity: 1, unit: 'kg', unit_price: 0, tva_rate: 8.5 }])
  }

  const handleQuickEstimate = () => {
    if (!estimateQuery) return
    setEstimateResult(getQuickEstimate(estimateQuery, estimateQty))
  }

  // Generate WhatsApp message for document
  const getWhatsAppLink = (doc: BillingDocument) => {
    const lines = doc.lines.map(l => `• ${l.description}: ${l.quantity} ${l.unit} x ${l.unit_price}€ = ${l.total_ttc}€`).join('\n')
    const msg = `Bonjour, voici ${TYPE_LABELS[doc.type].label} ${doc.reference} :\n\n${lines}\n\nTotal TTC: ${doc.total_ttc}€\nEchéance: ${new Date(doc.due_date).toLocaleDateString('fr-FR')}\n\nMerci de votre confirmation.`
    return `https://wa.me/${doc.client_phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><FileText size={24} /> Facturation & Business</h1>
          <p className="page-subtitle">Devis, factures, bons de commande — tout votre business en un endroit</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="adhesion-tabs">
        <button className={`adhesion-tab ${tab === 'documents' ? 'active' : ''}`} onClick={() => setTab('documents')}>
          📄 Documents ({docs.length})
        </button>
        <button className={`adhesion-tab ${tab === 'estimate' ? 'active' : ''}`} onClick={() => setTab('estimate')}>
          ⚡ Estimation rapide
        </button>
        <button className={`adhesion-tab ${tab === 'qonto' ? 'active' : ''}`} onClick={() => setTab('qonto')}>
          🏦 Qonto
        </button>
        <button className={`adhesion-tab ${tab === 'geo' ? 'active' : ''}`} onClick={() => setTab('geo')}>
          📍 Carte & Géoloc
        </button>
      </div>

      {/* ===== DOCUMENTS ===== */}
      {tab === 'documents' && (
        <>
          {/* Stats */}
          <div className="billing-stats-row">
            <div className="billing-stat" style={{ borderColor: '#2196F3' }}>
              <span className="billing-stat-num">{statsDocs.devis}</span>
              <span className="billing-stat-label">Devis</span>
            </div>
            <div className="billing-stat" style={{ borderColor: '#4CAF50' }}>
              <span className="billing-stat-num">{statsDocs.factures}</span>
              <span className="billing-stat-label">Factures</span>
            </div>
            <div className="billing-stat" style={{ borderColor: '#FF9800' }}>
              <span className="billing-stat-num">{statsDocs.bc}</span>
              <span className="billing-stat-label">Bons de commande</span>
            </div>
            <div className="billing-stat" style={{ borderColor: '#4CAF50' }}>
              <span className="billing-stat-num">{statsDocs.payees}€</span>
              <span className="billing-stat-label">Payé</span>
            </div>
            <div className="billing-stat" style={{ borderColor: '#F44336' }}>
              <span className="billing-stat-num">{statsDocs.en_attente}€</span>
              <span className="billing-stat-label">En attente</span>
            </div>
          </div>

          {/* Filters + Create */}
          <div className="billing-actions-row">
            <div className="billing-filters">
              <select className="form-input billing-filter-select" value={filterType} onChange={e => setFilterType(e.target.value as DocumentType | 'all')}>
                <option value="all">Tous les types</option>
                <option value="devis">📋 Devis</option>
                <option value="facture">🧾 Factures</option>
                <option value="bon_commande">📦 Bons de commande</option>
              </select>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input className="form-input billing-search" placeholder="Rechercher client ou réf..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true) }}>
              <Plus size={16} /> Nouveau document
            </button>
          </div>

          {/* Document list */}
          <div className="billing-docs-list">
            {filteredDocs.map(doc => {
              const typeCfg = TYPE_LABELS[doc.type]
              const statusCfg = STATUS_CFG[doc.status]
              const isExpanded = expandedDoc === doc.id
              return (
                <div key={doc.id} className="billing-doc-card">
                  <div className="billing-doc-header" onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}>
                    <div className="billing-doc-left">
                      <span className="billing-type-badge" style={{ background: typeCfg.color + '20', color: typeCfg.color }}>{typeCfg.emoji} {typeCfg.label}</span>
                      <strong className="billing-ref">{doc.reference}</strong>
                      <span className="billing-client-name">{doc.client_name}</span>
                    </div>
                    <div className="billing-doc-right">
                      <span className="billing-status-badge" style={{ background: statusCfg.color + '20', color: statusCfg.color }}>{statusCfg.label}</span>
                      <span className="billing-amount-bold">{doc.total_ttc}€</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="billing-doc-body">
                      <div className="billing-lines-table">
                        <table>
                          <thead>
                            <tr><th>Description</th><th>Qté</th><th>Unité</th><th>P.U. HT</th><th>TVA</th><th>Total TTC</th></tr>
                          </thead>
                          <tbody>
                            {doc.lines.map(line => (
                              <tr key={line.id}>
                                <td>{line.description}</td>
                                <td>{line.quantity}</td>
                                <td>{line.unit}</td>
                                <td>{line.unit_price}€</td>
                                <td>{line.tva_rate}%</td>
                                <td><strong>{line.total_ttc}€</strong></td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr><td colSpan={5}>Sous-total HT</td><td>{doc.subtotal_ht}€</td></tr>
                            <tr><td colSpan={5}>TVA</td><td>{doc.total_tva}€</td></tr>
                            <tr className="total-row"><td colSpan={5}>Total TTC</td><td><strong>{doc.total_ttc}€</strong></td></tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="billing-details-grid">
                        <div className="billing-detail"><span className="billing-detail-label">📧 Email</span><span>{doc.client_email}</span></div>
                        <div className="billing-detail"><span className="billing-detail-label">📱 Tél</span><span>{doc.client_phone}</span></div>
                        <div className="billing-detail"><span className="billing-detail-label">📍 Adresse</span><span>{doc.client_address}</span></div>
                        <div className="billing-detail"><span className="billing-detail-label">📅 Échéance</span><span>{new Date(doc.due_date).toLocaleDateString('fr-FR')}</span></div>
                        <div className="billing-detail"><span className="billing-detail-label">📝 Notes</span><span>{doc.notes}</span></div>
                        <div className="billing-detail"><span className="billing-detail-label">🏦 Qonto</span><span>{doc.qonto_synced ? '✅ Synchronisé' : '❌ Non synchronisé'}</span></div>
                      </div>
                      <div className="billing-doc-actions">
                        {doc.status === 'brouillon' && (
                          <button className="btn btn-primary btn-sm" onClick={() => { updateDocStatus(doc.id, 'envoye'); load() }}><Send size={14} /> Envoyer</button>
                        )}
                        {doc.status === 'envoye' && doc.type === 'devis' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => { updateDocStatus(doc.id, 'accepte'); load() }}><CheckCircle size={14} /> Accepter</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { updateDocStatus(doc.id, 'refuse'); load() }}><XCircle size={14} /> Refuser</button>
                          </>
                        )}
                        {doc.status === 'accepte' && doc.type === 'devis' && (
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            // Convert devis to facture
                            createDocument({
                              type: 'facture', status: 'envoye', payment_status: 'non_paye',
                              client_name: doc.client_name, client_email: doc.client_email, client_phone: doc.client_phone, client_address: doc.client_address,
                              lines: doc.lines, subtotal_ht: doc.subtotal_ht, total_tva: doc.total_tva, total_ttc: doc.total_ttc,
                              due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                              notes: `Issue du devis ${doc.reference}`, qonto_synced: false,
                            })
                            updateDocStatus(doc.id, 'paye')
                            load()
                          }}><FileText size={14} /> Convertir en facture</button>
                        )}
                        {doc.status === 'envoye' && doc.type === 'facture' && (
                          <button className="btn btn-success btn-sm" onClick={() => {
                            updateDocStatus(doc.id, 'paye')
                            syncQontoTransaction({ date: new Date().toISOString(), amount: doc.total_ttc, description: `Paiement ${doc.reference} - ${doc.client_name}`, category: 'vente', status: 'completed', linked_document_id: doc.id })
                            load()
                          }}><CreditCard size={14} /> Marquer payé (→ Qonto)</button>
                        )}
                        <a href={getWhatsAppLink(doc)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-whatsapp">
                          <MessageCircle size={14} /> WhatsApp client
                        </a>
                        <button className="btn btn-danger btn-sm btn-outline" onClick={() => { deleteDocument(doc.id); load() }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredDocs.length === 0 && <div className="empty-state"><p>Aucun document</p></div>}
          </div>

          {/* Create modal */}
          {showCreate && (
            <div className="checkout-overlay" onClick={() => setShowCreate(false)}>
              <div className="checkout-modal billing-create-modal" onClick={e => e.stopPropagation()}>
                <div className="checkout-header">
                  <h3>📄 Nouveau document</h3>
                  <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Type de document *</label>
                    <select className="form-input" value={newDocType} onChange={e => setNewDocType(e.target.value as DocumentType)} required>
                      <option value="devis">📋 Devis</option>
                      <option value="facture">🧾 Facture</option>
                      <option value="bon_commande">📦 Bon de commande</option>
                    </select>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Nom client *</label>
                      <input className="form-input" value={formClient} onChange={e => setFormClient(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Phone size={14} /> Tél WhatsApp</label>
                      <input className="form-input" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="0696 XX XX XX" />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">📧 Email</label>
                      <input className="form-input" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">📅 Échéance</label>
                      <input className="form-input" type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">📍 Adresse</label>
                    <input className="form-input" value={formAddress} onChange={e => setFormAddress(e.target.value)} />
                  </div>

                  {/* Lignes */}
                  <div className="billing-lines-section">
                    <h4>📦 Lignes</h4>
                    {formLines.map((line, idx) => {
                      const { total_ttc } = calcLine(line)
                      return (
                        <div key={idx} className="billing-line-row">
                          <input className="form-input billing-line-desc" placeholder="Description" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} required />
                          <input className="form-input billing-line-qty" type="number" min="0" step="0.01" placeholder="Qté" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                          <select className="form-input billing-line-unit" value={line.unit} onChange={e => handleLineChange(idx, 'unit', e.target.value)}>
                            <option>kg</option><option>pièce</option><option>lot</option><option>course</option><option>sac</option><option>unité</option><option>plants</option>
                          </select>
                          <input className="form-input billing-line-price" type="number" min="0" step="0.01" placeholder="P.U." value={line.unit_price} onChange={e => handleLineChange(idx, 'unit_price', parseFloat(e.target.value) || 0)} />
                          <select className="form-input billing-line-tva" value={line.tva_rate} onChange={e => handleLineChange(idx, 'tva_rate', parseFloat(e.target.value))}>
                            {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                          </select>
                          <span className="billing-line-total">{total_ttc.toFixed(2)}€</span>
                          {formLines.length > 1 && <button type="button" className="btn-icon-sm" onClick={() => removeLine(idx)}><X size={14} /></button>}
                        </div>
                      )
                    })}
                    <button type="button" className="btn btn-outline btn-sm" onClick={addLine}><Plus size={14} /> Ajouter ligne</button>
                    {(() => {
                      const computed = formLines.map((l, i) => ({ ...l, id: String(i + 1), ...calcLine(l) }))
                      const totals = calcTotals(computed as unknown as DocumentLine[])
                      return (
                        <div className="billing-create-totals">
                          <div className="billing-create-total-row"><span>Sous-total HT</span><strong>{totals.subtotal_ht.toFixed(2)}€</strong></div>
                          <div className="billing-create-total-row"><span>TVA</span><strong>{totals.total_tva.toFixed(2)}€</strong></div>
                          <div className="billing-create-total-row total-final"><span>Total TTC</span><strong className="big-amount">{totals.total_ttc.toFixed(2)}€</strong></div>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="form-group">
                    <label className="form-label">📝 Notes</label>
                    <textarea className="form-input" rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)} />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Annuler</button>
                    <button type="submit" className="btn btn-primary"><FileText size={16} /> Créer {TYPE_LABELS[newDocType].label}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== ESTIMATION RAPIDE ===== */}
      {tab === 'estimate' && (
        <div className="estimate-section">
          <div className="estimate-hero">
            <Zap size={32} className="estimate-icon" />
            <h2>Estimation rapide</h2>
            <p>Obtenez une fourchette de prix instantanée — en attendant le devis officiel</p>
          </div>
          <div className="estimate-form-card">
            <div className="estimate-form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">🔍 Produit ou service</label>
                <input
                  className="form-input estimate-input"
                  placeholder="Ex: banane, mangue, transport, igname..."
                  value={estimateQuery}
                  onChange={e => setEstimateQuery(e.target.value)}
                  list="product-suggestions"
                />
                <datalist id="product-suggestions">
                  {Object.keys(PRICE_REFERENCES).map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Quantité</label>
                <input className="form-input" type="number" min="1" value={estimateQty} onChange={e => setEstimateQty(parseInt(e.target.value) || 1)} />
              </div>
              <button className="btn btn-primary estimate-btn" onClick={handleQuickEstimate}>
                <Zap size={16} /> Estimer
              </button>
            </div>
            {estimateResult && (
              <div className="estimate-result-card">
                <h3>📊 Résultat pour « {estimateResult.product} » × {estimateResult.quantity} {estimateResult.unit}</h3>
                <div className="estimate-result-grid">
                  <div className="estimate-result-item">
                    <span className="estimate-result-label">💰 Prix estimé</span>
                    <span className="estimate-result-value range">{estimateResult.estimated_price_min.toFixed(2)}€ — {estimateResult.estimated_price_max.toFixed(2)}€</span>
                  </div>
                  <div className="estimate-result-item">
                    <span className="estimate-result-label">🚛 Transport estimé</span>
                    <span className="estimate-result-value range">{estimateResult.transport_cost_min.toFixed(2)}€ — {estimateResult.transport_cost_max.toFixed(2)}€</span>
                  </div>
                  <div className="estimate-result-item">
                    <span className="estimate-result-label">📅 Délai livraison</span>
                    <span className="estimate-result-value">{estimateResult.delivery_days} jour(s)</span>
                  </div>
                  <div className="estimate-result-item">
                    <span className="estimate-result-label">🎯 Fiabilité</span>
                    <span className={`estimate-confidence ${estimateResult.confidence}`}>{estimateResult.confidence === 'haute' ? '🟢 Haute' : estimateResult.confidence === 'moyenne' ? '🟡 Moyenne' : '🔴 Basse'}</span>
                  </div>
                </div>
                <div className="estimate-total-range">
                  <strong>Total estimé (produit + transport) :</strong>
                  <span className="big-amount"> {(estimateResult.estimated_price_min + estimateResult.transport_cost_min).toFixed(2)}€ — {(estimateResult.estimated_price_max + estimateResult.transport_cost_max).toFixed(2)}€</span>
                </div>
                <div className="estimate-disclaimer">
                  ⚠️ Estimation indicative basée sur les prix du marché local. Demandez un devis officiel pour un prix ferme.
                </div>
                <div className="estimate-cta-row">
                  <button className="btn btn-primary" onClick={() => { setTab('documents'); setShowCreate(true); setNewDocType('devis'); }}>
                    📋 Demander un devis officiel
                  </button>
                  <a
                    href={`https://wa.me/596696000000?text=${encodeURIComponent(`Bonjour, estimation pour ${estimateResult.quantity} ${estimateResult.unit} de ${estimateResult.product}. Fourchette: ${(estimateResult.estimated_price_min + estimateResult.transport_cost_min).toFixed(2)}€ — ${(estimateResult.estimated_price_max + estimateResult.transport_cost_max).toFixed(2)}€. Pouvez-vous confirmer ?`)} `}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <MessageCircle size={16} /> WhatsApp confirmation
                  </a>
                </div>
              </div>
            )}
          </div>
          {/* Price reference table */}
          <div className="price-ref-section">
            <h3>📖 Référence des prix Martinique</h3>
            <div className="price-ref-grid">
              {Object.entries(PRICE_REFERENCES).filter(([k]) => k !== 'transport martinique').map(([product, ref]) => (
                <div key={product} className="price-ref-chip" onClick={() => { setEstimateQuery(product); setEstimateQty(1) }}>
                  <span className="price-ref-name">{product}</span>
                  <span className="price-ref-range">{ref.min.toFixed(2)}€ — {ref.max.toFixed(2)}€/{ref.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== QONTO ===== */}
      {tab === 'qonto' && (
        <div className="qonto-section">
          <div className="qonto-header-card">
            <div className="qonto-logo">🏦</div>
            <div>
              <h2>Qonto — Compte pro connecté</h2>
              <p>Suivez vos encaissements, dépenses et synchronisez vos factures</p>
            </div>
          </div>
          <div className="qonto-balance-row">
            <div className="qonto-balance-card income">
              <span className="qonto-balance-num">+{qontoBalance.income.toFixed(2)}€</span>
              <span className="qonto-balance-label">📈 Encaissements</span>
            </div>
            <div className="qonto-balance-card expenses">
              <span className="qonto-balance-num">-{qontoBalance.expenses.toFixed(2)}€</span>
              <span className="qonto-balance-label">📉 Dépenses</span>
            </div>
            <div className={`qonto-balance-card ${qontoBalance.balance >= 0 ? 'positive' : 'negative'}`}>
              <span className="qonto-balance-num">{qontoBalance.balance >= 0 ? '+' : ''}{qontoBalance.balance.toFixed(2)}€</span>
              <span className="qonto-balance-label">💼 Solde</span>
            </div>
          </div>
          <div className="qonto-tx-list">
            <h3>📝 Transactions récentes</h3>
            {qontoTxs.map(tx => (
              <div key={tx.id} className={`qonto-tx-card ${tx.amount >= 0 ? 'income' : 'expense'}`}>
                <div className="qonto-tx-left">
                  <span className={`qonto-tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}€
                  </span>
                  <span className="qonto-tx-desc">{tx.description}</span>
                </div>
                <div className="qonto-tx-right">
                  <span className={`qonto-tx-status ${tx.status}`}>{tx.status === 'completed' ? '✅' : '⏳'}</span>
                  <span className="qonto-tx-date">{new Date(tx.date).toLocaleDateString('fr-FR')}</span>
                  {tx.linked_document_id && <span className="qonto-tx-linked">🔗 Facture liée</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="qonto-info-box">
            <h4>💡 Comment connecter Qonto ?</h4>
            <ol>
              <li>Créez un compte pro sur <strong>qonto.com</strong></li>
              <li>Dans les paramètres, activez l'<strong>API</strong></li>
              <li>Renseignez votre clé API dans les paramètres KopéAgri</li>
              <li>Vos encaissements et dépenses seront synchronisés automatiquement</li>
            </ol>
          </div>
        </div>
      )}

      {/* ===== GÉOLOCALISATION ===== */}
      {tab === 'geo' && (
        <div className="geo-section">
          <div className="geo-header">
            <MapPin size={24} />
            <div>
              <h2>Géolocalisation — Membres & Parcelles</h2>
              <p>Visualisez votre réseau et optimisez la stratégie logistique</p>
            </div>
          </div>

          {/* Simple map visualization */}
          <div className="geo-map-container">
            <div className="geo-map-placeholder">
              <div className="geo-map-title">🗺️ Carte de Martinique — {geoMembers.length} points</div>
              <svg viewBox="0 0 400 500" className="geo-svg-map">
                {/* Martinique simplified outline */}
                <path d="M180,30 L220,50 L240,100 L250,180 L245,250 L230,320 L210,380 L190,420 L170,460 L155,480 L145,460 L150,400 L160,340 L170,280 L175,220 L170,160 L160,100 L165,60 Z" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" />
                {/* Plot members */}
                {geoMembers.map((m) => {
                  const x = ((m.lng + 61.25) / 0.45) * 400
                  const y = ((14.9 - m.lat) / 0.5) * 500
                  const color = m.type === 'producteur' ? '#4CAF50' : m.type === 'transporteur' ? '#2196F3' : m.type === 'distributeur' ? '#FF9800' : '#9C27B0'
                  const icon = m.type === 'producteur' ? '🌾' : m.type === 'transporteur' ? '🚛' : m.type === 'distributeur' ? '🏪' : '📍'
                  return (
                    <g key={m.id}>
                      <circle cx={x} cy={y} r="8" fill={color} opacity="0.7" stroke="white" strokeWidth="1.5" />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="white">{icon}</text>
                      <text x={x} y={y + 20} textAnchor="middle" fontSize="8" fill="#333">{m.name}</text>
                    </g>
                  )
                })}
              </svg>
              <div className="geo-legend">
                <span className="geo-legend-item" style={{ color: '#4CAF50' }}>🌾 Producteur</span>
                <span className="geo-legend-item" style={{ color: '#2196F3' }}>🚛 Transporteur</span>
                <span className="geo-legend-item" style={{ color: '#FF9800' }}>🏪 Distributeur</span>
                <span className="geo-legend-item" style={{ color: '#9C27B0' }}>📍 Parcelle</span>
              </div>
            </div>
          </div>

          {/* Strategy insights */}
          <div className="geo-strategy-card">
            <h3>🎯 Insights stratégiques</h3>
            <div className="geo-strategy-grid">
              <div className="geo-strategy-item">
                <strong>Zone Nord (Saint-Pierre / Morne-Rouge)</strong>
                <p>🌿 Café, cacao, vanille — produits à haute valeur ajoutée. Potentiel export.</p>
                <p>🚛 Transporteur le plus proche : Lamentin (25km)</p>
              </div>
              <div className="geo-strategy-item">
                <strong>Zone Centre (Le François / FdF)</strong>
                <p>🍌 Banane, mangue, ananas — volume important. Circuit court possible.</p>
                <p>🚛 Transporteur le plus proche : Lamentin (10km)</p>
              </div>
              <div className="geo-strategy-item">
                <strong>Zone Sud (Le Marin / Sainte-Anne)</strong>
                <p>🛒 Zone touristique — demande élevée restaurateurs. Circuit court recommandé.</p>
                <p>🚛 Transporteur local disponible</p>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="geo-members-list">
            <div className="geo-members-header">
              <h3>👥 Membres géolocalisés ({geoMembers.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowGeoForm(true)}><Plus size={14} /> Ajouter</button>
            </div>
            {geoMembers.map(m => (
              <div key={m.id} className="geo-member-card">
                <div className="geo-member-left">
                  <span className={`geo-member-type ${m.type}`}>
                    {m.type === 'producteur' ? '🌾' : m.type === 'transporteur' ? '🚛' : m.type === 'distributeur' ? '🏪' : '📍'} {m.type}
                  </span>
                  <strong>{m.name}</strong>
                  <span className="geo-member-commune">{m.commune}</span>
                  {m.superficie_ha && <span className="geo-member-surface">{m.superficie_ha} ha</span>}
                </div>
                <div className="geo-member-right">
                  <span className="geo-member-coords">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                  {m.phone && <a href={`https://wa.me/${m.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-whatsapp"><MessageCircle size={12} /></a>}
                  <button className="btn-icon-sm btn-danger" onClick={() => { removeGeoMember(m.id); load() }}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add geo member form */}
          {showGeoForm && (
            <div className="checkout-overlay" onClick={() => setShowGeoForm(false)}>
              <div className="checkout-modal" onClick={e => e.stopPropagation()}>
                <div className="checkout-header">
                  <h3>📍 Ajouter un point géolocalisé</h3>
                  <button className="btn-icon" onClick={() => setShowGeoForm(false)}><X size={20} /></button>
                </div>
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const commune = fd.get('commune') as string
                  const coords = COMMUNE_COORDS[commune] || { lat: 14.6161, lng: -61.0636 }
                  addGeoMember({
                    name: fd.get('name') as string,
                    type: fd.get('type') as GeoMember['type'],
                    lat: coords.lat + (Math.random() - 0.5) * 0.02,
                    lng: coords.lng + (Math.random() - 0.5) * 0.02,
                    commune,
                    phone: fd.get('phone') as string,
                    specialites: (fd.get('specialites') as string).split(',').map(s => s.trim()).filter(Boolean),
                    superficie_ha: parseFloat(fd.get('superficie') as string) || undefined,
                  })
                  setShowGeoForm(false)
                  load()
                }}>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input name="name" className="form-input" required />
                  </div>
                  <div className="form-row-2">
                    <div className="group">
                      <label className="form-label">Type</label>
                      <select name="type" className="form-input">
                        <option value="producteur">🌾 Producteur</option>
                        <option value="transporteur">🚛 Transporteur</option>
                        <option value="distributeur">🏪 Distributeur</option>
                        <option value="parcelle">📍 Parcelle</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Commune</label>
                      <select name="commune" className="form-input">
                        {Object.keys(COMMUNE_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">📱 Téléphone</label>
                      <input name="phone" className="form-input" placeholder="0696 XX XX XX" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">📐 Superficie (ha)</label>
                      <input name="superficie" className="form-input" type="number" step="0.1" placeholder="Optionnel" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">🌿 Spécialités (séparées par virgules)</label>
                    <input name="specialites" className="form-input" placeholder="banane, mangue, igname" />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setShowGeoForm(false)}>Annuler</button>
                    <button type="submit" className="btn btn-primary"><MapPin size={16} /> Ajouter</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FacturationPage

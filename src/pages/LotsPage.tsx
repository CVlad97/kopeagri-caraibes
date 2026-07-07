import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, DollarSign, Pencil, Trash2, Eye, EyeOff, ShoppingCart, Plus, X, Check } from 'lucide-react'
import { getAll, add, update, remove, toggleActive, MARTINIQUE_COMMUNES } from '../services/dataService'
import type { Lot, Order } from '../services/dataService'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: '#757575' },
  pending: { label: 'En attente', color: '#F57C00' },
  approved: { label: 'Approuvé', color: '#2E7D32' },
  rejected: { label: 'Rejeté', color: '#C62828' },
  sold: { label: 'Vendu', color: '#0277BD' },
}

const UNITS = ['kg', 'pièce', 'botte']
const QUALITIES = ['Extra', 'Premium', 'Standard']
const STATUSES = ['draft', 'pending', 'approved', 'rejected', 'sold']
const CERT_OPTIONS = ['Bio', 'HVE', 'Commerce équitable', 'AOP']

const COMMISSION_RATE = 0.05

const LotsPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Lot | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderLot, setOrderLot] = useState<Lot | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Form state
  const [formProduct, setFormProduct] = useState('')
  const [formProducer, setFormProducer] = useState('')
  const [formCommune, setFormCommune] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formUnit, setFormUnit] = useState('kg')
  const [formPrice, setFormPrice] = useState('')
  const [formQuality, setFormQuality] = useState('Standard')
  const [formAvailable, setFormAvailable] = useState('')
  const [formStatus, setFormStatus] = useState('draft')
  const [formCerts, setFormCerts] = useState<string[]>([])
  const [formImage, setFormImage] = useState('📦')

  // Order form state
  const [orderBuyer, setOrderBuyer] = useState('')
  const [orderQty, setOrderQty] = useState('')
  const [orderPhone, setOrderPhone] = useState('')
  const [orderDelivery, setOrderDelivery] = useState('')

  const load = () => setLots(getAll('lots') as Lot[])
  useEffect(load, [])

  const resetForm = () => {
    setFormProduct('')
    setFormProducer('')
    setFormCommune('')
    setFormQty('')
    setFormUnit('kg')
    setFormPrice('')
    setFormQuality('Standard')
    setFormAvailable('')
    setFormStatus('draft')
    setFormCerts([])
    setFormImage('📦')
  }

  const openCreate = () => {
    resetForm()
    setEditItem(null)
    setShowForm(true)
  }

  const openEdit = (lot: Lot) => {
    setFormProduct(lot.product)
    setFormProducer(lot.producer)
    setFormCommune(lot.commune)
    setFormQty(lot.qty.toString())
    setFormUnit(lot.unit)
    setFormPrice(lot.price.toString())
    setFormQuality(lot.quality)
    setFormAvailable(lot.available)
    setFormStatus(lot.status)
    setFormCerts([...lot.certs])
    setFormImage(lot.image)
    setEditItem(lot)
    setShowForm(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      product: formProduct,
      producer: formProducer,
      commune: formCommune,
      qty: parseFloat(formQty) || 0,
      unit: formUnit,
      price: parseFloat(formPrice) || 0,
      quality: formQuality,
      available: formAvailable,
      status: formStatus,
      certs: formCerts,
      image: formImage,
      active: true,
    }
    if (editItem) {
      update('lots', editItem.id, data as any)
    } else {
      add('lots', data as any)
    }
    setShowForm(false)
    setEditItem(null)
    load()
  }

  const handleDelete = (id: string) => {
    remove('lots', id)
    setConfirmDeleteId(null)
    load()
  }

  const handleToggle = (id: string) => {
    toggleActive('lots', id)
    load()
  }

  const openOrderModal = (lot: Lot) => {
    setOrderLot(lot)
    setOrderBuyer('')
    setOrderQty(lot.qty.toString())
    setOrderPhone('')
    setOrderDelivery('')
    setShowOrderModal(true)
  }

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderLot) return
    const qty = parseFloat(orderQty) || 0
    const total = qty * orderLot.price
    const commission = Math.round(total * COMMISSION_RATE * 100) / 100
    const ref = 'CMD-' + Date.now().toString().slice(-6)

    const orderData = {
      ref,
      buyer: orderBuyer,
      items: [{ product: orderLot.product, qty, unit: orderLot.unit, price: orderLot.price }],
      total,
      commission,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      delivery: orderDelivery,
      active: true,
    }
    add('orders', orderData as any)
    update('lots', orderLot.id, { status: 'sold' } as any)
    setShowOrderModal(false)
    setOrderLot(null)
    load()
  }

  const toggleCert = (cert: string) => {
    setFormCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])
  }

  const filtered = lots.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false
    if (search && !l.product.toLowerCase().includes(search.toLowerCase()) && !l.producer.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>📦 Lots de production</h1>
        <p className="page-subtitle">Produits disponibles, lots exportables et traçabilité</p>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Rechercher un produit ou producteur..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        <div className="filter-btns">
          {['all', 'draft', 'pending', 'approved', 'sold'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tous' : STATUS_LABELS[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      <div className="lots-grid">
        {filtered.map(lot => {
          const st = STATUS_LABELS[lot.status] || { label: lot.status, color: '#666' }
          return (
            <div key={lot.id} className={`lot-card ${!lot.active ? 'inactive' : ''}`}>
              <div className="lot-image">{lot.image}</div>
              <div className="lot-content">
                <div className="lot-header">
                  <h3>{lot.product}</h3>
                  <span className="lot-status" style={{ backgroundColor: st.color + '20', color: st.color }}>{st.label}</span>
                </div>
                <p className="lot-producer">👤 {lot.producer}</p>
                <div className="lot-meta">
                  <span><MapPin size={14} /> {lot.commune}</span>
                  <span>📦 {lot.qty} {lot.unit}</span>
                  <span><DollarSign size={14} /> {lot.price}€/{lot.unit}</span>
                  <span><Calendar size={14} /> {lot.available}</span>
                </div>
                <div className="lot-quality">
                  {lot.quality === 'Extra' && <span className="badge badge-gold">⭐ Extra</span>}
                  {lot.quality === 'Premium' && <span className="badge badge-green">Premium</span>}
                  {lot.quality === 'Standard' && <span className="badge badge-blue">Standard</span>}
                  {lot.certs.map(c => <span key={c} className="badge badge-teal">{c}</span>)}
                </div>
                <div className="lot-actions">
                  {lot.status === 'approved' && (
                    <button className="btn btn-sm btn-primary" onClick={() => openOrderModal(lot)}>
                      <ShoppingCart size={14} /> Commander
                    </button>
                  )}
                  {lot.status === 'sold' && (
                    <span className="btn btn-sm" style={{ opacity: 0.5, cursor: 'default' }}>Vendu</span>
                  )}
                  {lot.status !== 'approved' && lot.status !== 'sold' && (
                    <span className="btn btn-sm" style={{ opacity: 0.5, cursor: 'default' }}>Indisponible</span>
                  )}
                  <button className="btn-icon-sm" onClick={() => openEdit(lot)} title="Modifier"><Pencil size={16} /></button>
                  <button className="btn-icon-sm" onClick={() => handleToggle(lot.id)} title={lot.active ? 'Désactiver' : 'Activer'}>
                    {lot.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  {confirmDeleteId === lot.id ? (
                    <span className="confirm-delete">
                      <span className="confirm-text">Confirmer ?</span>
                      <button className="btn-icon-sm" onClick={() => handleDelete(lot.id)} title="Confirmer"><Check size={16} /></button>
                      <button className="btn-icon-sm" onClick={() => setConfirmDeleteId(null)} title="Annuler"><X size={16} /></button>
                    </span>
                  ) : (
                    <button className="btn-icon-sm" onClick={() => setConfirmDeleteId(lot.id)} title="Supprimer"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">Aucun lot trouvé</div>}

      <button className="fab" onClick={openCreate} title="Nouveau lot"><Plus size={24} /></button>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditItem(null) }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Modifier le lot' : 'Nouveau lot'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditItem(null) }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="entity-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Produit *</label>
                  <input value={formProduct} onChange={e => setFormProduct(e.target.value)} required className="form-input" placeholder="Banane Cavendish" />
                </div>
                <div className="form-group">
                  <label>Producteur *</label>
                  <input value={formProducer} onChange={e => setFormProducer(e.target.value)} required className="form-input" placeholder="EARL Larcher" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Commune *</label>
                  <select value={formCommune} onChange={e => setFormCommune(e.target.value)} required className="form-input">
                    <option value="">Sélectionner</option>
                    {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantité *</label>
                  <input type="number" min="0" value={formQty} onChange={e => setFormQty(e.target.value)} required className="form-input" placeholder="500" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unité *</label>
                  <select value={formUnit} onChange={e => setFormUnit(e.target.value)} required className="form-input">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prix (€/{formUnit}) *</label>
                  <input type="number" min="0" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} required className="form-input" placeholder="2.50" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Qualité *</label>
                  <select value={formQuality} onChange={e => setFormQuality(e.target.value)} required className="form-input">
                    {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Disponibilité *</label>
                  <input type="date" value={formAvailable} onChange={e => setFormAvailable(e.target.value)} required className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Statut *</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} required className="form-input">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Image (emoji)</label>
                  <input value={formImage} onChange={e => setFormImage(e.target.value)} className="form-input" placeholder="🍌" />
                </div>
              </div>
              <div className="form-group">
                <label>Certifications</label>
                <div className="chip-grid">
                  {CERT_OPTIONS.map(c => (
                    <button key={c} type="button" className={`chip ${formCerts.includes(c) ? 'active' : ''}`}
                      onClick={() => toggleCert(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditItem(null) }}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? <><Pencil size={16} /> Modifier</> : <><Plus size={16} /> Créer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && orderLot && (
        <div className="modal-overlay" onClick={() => { setShowOrderModal(false); setOrderLot(null) }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🛒 Commander — {orderLot.product}</h3>
              <button className="modal-close" onClick={() => { setShowOrderModal(false); setOrderLot(null) }}><X size={20} /></button>
            </div>
            <form onSubmit={handleOrder} className="entity-form">
              <p style={{ color: '#666', fontSize: '0.9em' }}>
                Prix unitaire : <strong>{orderLot.price}€/{orderLot.unit}</strong> · Stock : <strong>{orderLot.qty} {orderLot.unit}</strong>
                <br />Commission : <strong>5%</strong> · Total estimé : <strong>{((parseFloat(orderQty) || 0) * orderLot.price).toFixed(2)}€</strong>
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de l'acheteur *</label>
                  <input value={orderBuyer} onChange={e => setOrderBuyer(e.target.value)} required className="form-input" placeholder="Hôtel Bakoua" />
                </div>
                <div className="form-group">
                  <label>Quantité souhaitée *</label>
                  <input type="number" min="1" max={orderLot.qty} value={orderQty} onChange={e => setOrderQty(e.target.value)} required className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input value={orderPhone} onChange={e => setOrderPhone(e.target.value)} required className="form-input" placeholder="0696 XX XX XX" />
                </div>
                <div className="form-group">
                  <label>Notes de livraison</label>
                  <input value={orderDelivery} onChange={e => setOrderDelivery(e.target.value)} className="form-input" placeholder="Livraison hôtel, entrée service" />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowOrderModal(false); setOrderLot(null) }}>Annuler</button>
                <button type="submit" className="btn btn-primary"><ShoppingCart size={16} /> Commander</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LotsPage

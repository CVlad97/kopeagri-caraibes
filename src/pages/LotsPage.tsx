import React, { useState } from 'react'
import { Search, MapPin, Calendar, DollarSign, QrCode } from 'lucide-react'

const SAMPLE_LOTS = [
  { id: 1, product: 'Banane Cavendish', producer: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', qty: 500, unit: 'kg', price: 2.5, quality: 'Extra', available: '2026-07-15', status: 'approved', certs: ['Bio', 'Commerce équitable'], image: '🍌' },
  { id: 2, product: 'Mangue José', producer: 'EARL Larcher', commune: 'Saint-Pierre', qty: 200, unit: 'kg', price: 4.0, quality: 'Premium', available: '2026-07-10', status: 'approved', certs: ['Bio'], image: '🥭' },
  { id: 3, product: 'Avocat Haas', producer: 'Coopérative Nord', commune: 'Le François', qty: 300, unit: 'kg', price: 3.8, quality: 'Extra', available: '2026-07-20', status: 'pending', certs: ['Bio', 'HVE'], image: '🥑' },
  { id: 4, product: 'Ananas Victoria', producer: 'SCEA Galbas', commune: 'Sainte-Luce', qty: 150, unit: 'pièce', price: 3.0, quality: 'Premium', available: '2026-07-25', status: 'approved', certs: ['Bio'], image: '🍍' },
  { id: 5, product: 'Patate douce', producer: 'Coopérative Nord', commune: 'Ajoupa-Bouillon', qty: 800, unit: 'kg', price: 1.8, quality: 'Standard', available: '2026-07-18', status: 'approved', certs: [], image: '🍠' },
  { id: 6, product: 'Citron vert', producer: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', qty: 100, unit: 'kg', price: 3.5, quality: 'Extra', available: '2026-07-12', status: 'sold', certs: [], image: '🍋' },
  { id: 7, product: 'Giraumon', producer: 'EARL Larcher', commune: 'Le Robert', qty: 400, unit: 'kg', price: 2.0, quality: 'Standard', available: '2026-07-22', status: 'draft', certs: [], image: '🎃' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: '#757575' },
  pending: { label: 'En attente', color: '#F57C00' },
  approved: { label: 'Approuvé', color: '#2E7D32' },
  rejected: { label: 'Rejeté', color: '#C62828' },
  sold: { label: 'Vendu', color: '#0277BD' },
}

const LotsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = SAMPLE_LOTS.filter(l => {
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
            <div key={lot.id} className="lot-card">
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
                  <button className="btn btn-sm btn-outline"><QrCode size={14} /> QR</button>
                  <button className="btn btn-sm btn-primary" disabled={lot.status !== 'approved'}>
                    {lot.status === 'approved' ? 'Commander' : lot.status === 'sold' ? 'Vendu' : 'Indisponible'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn btn-primary fab">+ Nouveau lot</button>
    </div>
  )
}

export default LotsPage
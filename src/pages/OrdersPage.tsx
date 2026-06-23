import React, { useState } from 'react'
import { Search, Calendar, Package, Eye, CheckCircle, XCircle, Clock, Truck } from 'lucide-react'

const SAMPLE_ORDERS = [
  { id: 'CMD-001', buyer: 'Hôtel Bakoua - Les Trois-Îlets', items: [{ product: 'Banane Cavendish', qty: 200, unit: 'kg', price: 2.5 }], total: 500, commission: 25, status: 'preparing', date: '2026-07-10', delivery: 'Livraison hôtel' },
  { id: 'CMD-002', buyer: 'Marché Fort-de-France', items: [{ product: 'Mangue José', qty: 100, unit: 'kg', price: 4.0 }, { product: 'Avocat Haas', qty: 50, unit: 'kg', price: 3.8 }], total: 590, commission: 29.5, status: 'approved', date: '2026-07-12', delivery: 'Point relais Dillon' },
  { id: 'CMD-003', buyer: 'Restaurant Le Petibonum', items: [{ product: 'Ananas Victoria', qty: 60, unit: 'pièce', price: 3.0 }, { product: 'Citron vert', qty: 20, unit: 'kg', price: 3.5 }], total: 250, commission: 12.5, status: 'delivered', date: '2026-07-05', delivery: 'Livraison restaurant' },
  { id: 'CMD-004', buyer: 'Export Guadeloupe', items: [{ product: 'Banane Cavendish', qty: 1000, unit: 'kg', price: 2.2 }], total: 2200, commission: 110, status: 'pending', date: '2026-07-20', delivery: 'Port de Fort-de-France' },
  { id: 'CMD-005', buyer: 'Épicerie Croix-Rivail', items: [{ product: 'Patate douce', qty: 50, unit: 'kg', price: 1.8 }, { product: 'Giraumon', qty: 30, unit: 'kg', price: 2.0 }], total: 150, commission: 7.5, status: 'cancelled', date: '2026-07-08', delivery: 'Magasin' },
]

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending: { label: 'En attente', color: '#F57C00', icon: Clock },
  approved: { label: 'Approuvée', color: '#2E7D32', icon: CheckCircle },
  preparing: { label: 'En préparation', color: '#0277BD', icon: Package },
  shipped: { label: 'Expédiée', color: '#00838F', icon: Truck },
  delivered: { label: 'Livrée', color: '#2E7D32', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: '#C62828', icon: XCircle },
}

const OrdersPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = SAMPLE_ORDERS.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.buyer.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>🛒 Commandes</h1>
        <p className="page-subtitle">Suivez et gérez vos commandes B2B</p>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Rechercher une commande..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        <div className="filter-btns">
          {['all', 'pending', 'approved', 'preparing', 'delivered', 'cancelled'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Toutes' : STATUS_CFG[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {filtered.map(order => {
          const st = STATUS_CFG[order.status] || { label: order.status, color: '#666', icon: Clock }
          const StIcon = st.icon
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id-row">
                  <strong>{order.id}</strong>
                  <span className={`order-status`} style={{ backgroundColor: st.color + '20', color: st.color }}>
                    <StIcon size={14} /> {st.label}
                  </span>
                </div>
                <p className="order-buyer">{order.buyer}</p>
              </div>
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.product}</span>
                    <span>{item.qty} {item.unit} × {item.price}€</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <div className="order-totals">
                  <span>Total: <strong>{order.total}€</strong></span>
                  <span className="commission">Commission: {order.commission}€</span>
                </div>
                <div className="order-meta">
                  <span><Calendar size={14} /> {order.date}</span>
                  <span>{order.delivery}</span>
                </div>
                <div className="order-actions">
                  <button className="btn btn-sm btn-outline"><Eye size={14} /> Détails</button>
                  <button className="btn btn-sm btn-primary" disabled={!['pending', 'approved'].includes(order.status)}>
                    Valider
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrdersPage
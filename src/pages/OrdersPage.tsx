import React, { useState, useEffect } from 'react'
import { Search, Calendar, Package, Eye, CheckCircle, XCircle, Clock, Truck, XCircle as Cancel } from 'lucide-react'
import { getAll, update } from '../services/dataService'
import type { Order } from '../services/dataService'

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending: { label: 'En attente', color: '#F57C00', icon: Clock },
  approved: { label: 'Approuvée', color: '#2E7D32', icon: CheckCircle },
  preparing: { label: 'En préparation', color: '#0277BD', icon: Package },
  delivered: { label: 'Livrée', color: '#2E7D32', icon: Truck },
  cancelled: { label: 'Annulée', color: '#C62828', icon: XCircle },
}

const NEXT_STATUS: Record<string, string> = {
  pending: 'approved',
  approved: 'preparing',
  preparing: 'delivered',
}

const NEXT_STATUS_LABEL: Record<string, string> = {
  pending: 'Approuver',
  approved: 'Préparer',
  preparing: 'Livrer',
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = () => setOrders(getAll('orders') as Order[])
  useEffect(load, [])

  const advanceStatus = (id: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus]
    if (next) {
      update('orders', id, { status: next } as any)
      load()
    }
  }

  const cancelOrder = (id: string) => {
    update('orders', id, { status: 'cancelled' } as any)
    load()
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search && !o.ref.toLowerCase().includes(search.toLowerCase()) && !o.buyer.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const totalOrders = orders.length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length

  return (
    <div className="page">
      <div className="page-header">
        <h1>🛒 Commandes</h1>
        <p className="page-subtitle">Suivez et gérez vos commandes B2B</p>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="stat-card">
          <span className="stat-number">{totalOrders}</span>
          <span className="stat-label">Total commandes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#F57C00' }}>{pendingCount}</span>
          <span className="stat-label">En attente</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#0277BD' }}>{preparingCount}</span>
          <span className="stat-label">En préparation</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#2E7D32' }}>{deliveredCount}</span>
          <span className="stat-label">Livrées</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#C62828' }}>{cancelledCount}</span>
          <span className="stat-label">Annulées</span>
        </div>
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
          const isExpanded = expandedId === order.id
          const canAdvance = !!NEXT_STATUS[order.status]
          const canCancel = order.status !== 'cancelled' && order.status !== 'delivered'
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id-row">
                  <strong>{order.ref}</strong>
                  <span className="order-status" style={{ backgroundColor: st.color + '20', color: st.color }}>
                    <StIcon size={14} /> {st.label}
                  </span>
                </div>
                <p className="order-buyer">{order.buyer}</p>
              </div>
              <div className="order-items">
                {(isExpanded ? order.items : order.items.slice(0, 2)).map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.product}</span>
                    <span>{item.qty} {item.unit} × {item.price}€</span>
                  </div>
                ))}
                {!isExpanded && order.items.length > 2 && (
                  <div className="order-item-row" style={{ color: '#888', fontStyle: 'italic' }}>
                    <span>+ {order.items.length - 2} autre(s) article(s)</span>
                    <span></span>
                  </div>
                )}
              </div>
              {isExpanded && (
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #eee' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85em', color: '#666' }}>
                    <strong>ID :</strong> {order.id} · <strong>Date :</strong> {order.date} · <strong>Livraison :</strong> {order.delivery}
                  </p>
                </div>
              )}
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
                  <button className="btn btn-sm btn-outline" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                    <Eye size={14} /> Détails
                  </button>
                  {canAdvance && (
                    <button className="btn btn-sm btn-primary" onClick={() => advanceStatus(order.id, order.status)}>
                      {NEXT_STATUS_LABEL[order.status]}
                    </button>
                  )}
                  {canCancel && (
                    <button className="btn btn-sm" style={{ color: '#C62828', borderColor: '#C62828' }} onClick={() => cancelOrder(order.id)}>
                      <Cancel size={14} /> Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">Aucune commande trouvée</div>}
    </div>
  )
}

export default OrdersPage

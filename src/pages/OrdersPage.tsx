import React, { useState, useEffect } from 'react'
import { Search, Calendar, Package, Eye, CheckCircle, XCircle, Clock, Truck, XCircle as Cancel, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAll, update } from '../services/dataService'
import type { Order } from '../services/dataService'
import { createDocument, getAllDocuments, calcLine, calcTotals } from '../services/billingService'
import type { BillingDocument, DocumentLine } from '../services/billingService'

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
  const [invoicedOrderIds, setInvoicedOrderIds] = useState<Set<string>>(new Set())
  const [flashMsg, setFlashMsg] = useState<string | null>(null)

  const load = () => {
    setOrders(getAll('orders') as Order[])
    // Check which orders already have invoices
    const docs = getAllDocuments()
    const ids = new Set<string>()
    docs.forEach(d => {
      if (d.type === 'facture') {
        // Match facture to order by client_name
        const allOrders = getAll('orders') as Order[]
        allOrders.forEach(o => {
          if (o.status === 'delivered' && d.client_name === o.buyer) {
            ids.add(o.id)
          }
        })
      }
    })
    setInvoicedOrderIds(ids)
  }
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

  const generateInvoice = (order: Order) => {
    // Build DocumentLines from order items
    const lines: DocumentLine[] = order.items.map(item => {
      const lineData = {
        description: item.product,
        quantity: item.qty,
        unit: item.unit,
        unit_price: item.price,
        tva_rate: 8.5,
      }
      const { total_ht, total_ttc } = calcLine(lineData)
      return {
        id: crypto.randomUUID(),
        ...lineData,
        total_ht,
        total_ttc,
      }
    })

    const { subtotal_ht, total_tva, total_ttc } = calcTotals(lines)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    createDocument({
      type: 'facture',
      status: 'envoye',
      payment_status: 'non_paye',
      client_name: order.buyer,
      client_email: '',
      client_phone: '',
      client_address: '',
      lines,
      subtotal_ht,
      total_tva,
      total_ttc,
      due_date: dueDate.toISOString().split('T')[0],
      sent_at: new Date().toISOString(),
      notes: `Facture pour commande ${order.ref}`,
      qonto_synced: false,
    })

    setInvoicedOrderIds(prev => new Set(prev).add(order.id))
    setFlashMsg('Facture générée !')
    setTimeout(() => setFlashMsg(null), 2500)
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
      {/* Flash message */}
      {flashMsg && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: '#2E7D32', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', fontWeight: 600, fontSize: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          ✓ {flashMsg}
        </div>
      )}

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
          const isInvoiced = invoicedOrderIds.has(order.id)
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id-row">
                  <strong>{order.ref}</strong>
                  <span className="order-status" style={{ backgroundColor: st.color + '20', color: st.color }}>
                    <StIcon size={14} /> {st.label}
                  </span>
                  {isInvoiced && (
                    <span className="badge badge-green" style={{ marginLeft: 6, fontSize: 11 }}>Facturée ✓</span>
                  )}
                </div>
                <p className="order-buyer">{order.buyer}</p>
              </div>
              <div className="order-items">
                {(isExpanded ? order.items : order.items.slice(0, 2)).map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>
                      {item.product}
                      <Link to="/lots" style={{ marginLeft: 8, fontSize: 11, color: 'var(--blue-600)', textDecoration: 'none' }}>Voir le lot →</Link>
                    </span>
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
                  {order.status === 'delivered' && !isInvoiced && (
                    <button
                      className="btn btn-sm"
                      style={{ background: '#2E7D32', color: '#fff', borderColor: '#2E7D32' }}
                      onClick={() => generateInvoice(order)}
                    >
                      <FileText size={14} /> Générer facture
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

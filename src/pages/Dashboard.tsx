import React, { useState, useEffect, useMemo } from 'react'
import {
  Users, Truck, Package, ShoppingCart, TrendingUp, FileText, Bell, Sprout, MessageCircle, RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAll, getAllRFQ } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor, Plot, Resource, Lot, Order, Booking, RFQ } from '../services/dataService'
import { getAllDocuments } from '../services/billingService'
import type { BillingDocument } from '../services/billingService'
import { hasCredentials, bidirectionalSync, getSyncStatus, onSyncEvent } from '../services/syncService'
import type { SyncStatus } from '../services/syncService'

interface DashStats {
  producersActive: number; producersTotal: number;
  logisticsActive: number; logisticsTotal: number;
  lotsApproved: number; lotsTotal: number;
  ordersInProgress: number; ordersTotal: number;
  revenue: number; commissions: number;
  rfqActive: number; rfqTotal: number;
  unpaidInvoices: number; docsTotal: number;
  // extras for synergy
  lotsByStatus: Record<string, number>;
  ordersByStatus: Record<string, number>;
  plotsAvailable: number; plotsTotal: number;
  resourcesAvailable: number; resourcesTotal: number;
  bookingsTotal: number;
  producersWithoutCerts: number;
  deliveredOrdersCount: number;
}

interface ActivityItem {
  collection: string
  icon: string
  name: string
  date: string
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [invoicedOrders, setInvoicedOrders] = useState<Set<string>>(new Set())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus())
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Subscribe to sync events for live UI updates
  useEffect(() => {
    const unsub = onSyncEvent((event) => {
      setSyncStatus(getSyncStatus())
      if (event === 'sync-complete') {
        const now = new Date()
        setLastSyncTime(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        )
      }
    })
    return unsub
  }, [])

  const handleSync = async () => {
    if (!hasCredentials() || syncing) return
    setSyncing(true)
    try {
      await bidirectionalSync()
      const now = new Date()
      setLastSyncTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      )
      setSyncStatus(getSyncStatus())
    } catch {
      // error is captured in syncStatus
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    const producers = getAll('producers') as Producer[]
    const logistics = getAll('logistics') as LogisticsProvider[]
    const distributors = getAll('distributors') as Distributor[]
    const plots = getAll('plots') as Plot[]
    const resources = getAll('resources') as Resource[]
    const lots = getAll('lots') as Lot[]
    const orders = getAll('orders') as Order[]
    const bookings = getAll('bookings') as Booking[]
    const rfqs = getAllRFQ()
    const docs = getAllDocuments()

    const producersActive = producers.filter(p => p.active).length
    const logisticsActive = logistics.filter(l => l.active).length
    const lotsByStatus: Record<string, number> = {}
    lots.forEach(l => { lotsByStatus[l.status] = (lotsByStatus[l.status] || 0) + 1 })
    const ordersByStatus: Record<string, number> = {}
    orders.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1 })
    const ordersInProgress = (ordersByStatus['pending'] || 0) + (ordersByStatus['approved'] || 0) + (ordersByStatus['preparing'] || 0)
    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const revenue = deliveredOrders.reduce((s, o) => s + (o.total || 0), 0)
    const commissions = deliveredOrders.reduce((s, o) => s + (o.commission || 0), 0)
    const rfqActive = rfqs.filter(r => r.status !== 'annulee').length
    const unpaidInvoices = docs.filter(d => d.type === 'facture' && d.payment_status !== 'paye').length
    const plotsAvailable = plots.filter(p => p.status === 'available').length
    const resourcesAvailable = resources.filter(r => r.available).length
    const producersWithoutCerts = producers.filter(p => p.active && (!p.certifications || p.certifications.length === 0)).length

    // Check which delivered orders already have invoices
    const invoicedOrderIds = new Set<string>()
    docs.forEach(d => {
      if (d.type === 'facture') {
        // Try to match by client name or reference in notes
        orders.forEach(o => {
          if (o.status === 'delivered' && d.client_name === o.buyer) {
            invoicedOrderIds.add(o.id)
          }
        })
      }
    })
    setInvoicedOrders(invoicedOrderIds)

    setStats({
      producersActive, producersTotal: producers.length,
      logisticsActive, logisticsTotal: logistics.length,
      lotsApproved: lotsByStatus['approved'] || 0, lotsTotal: lots.length,
      ordersInProgress, ordersTotal: orders.length,
      revenue, commissions,
      rfqActive, rfqTotal: rfqs.length,
      unpaidInvoices, docsTotal: docs.length,
      lotsByStatus, ordersByStatus,
      plotsAvailable, plotsTotal: plots.length,
      resourcesAvailable, resourcesTotal: resources.length,
      bookingsTotal: bookings.length,
      producersWithoutCerts,
      deliveredOrdersCount: deliveredOrders.length,
    })

    // Recent activity: collect last 5 created items across all collections
    const allItems: ActivityItem[] = []
    producers.forEach(p => allItems.push({ collection: 'Producteur', icon: '👨‍🌾', name: p.name, date: p.created_at }))
    logistics.forEach(l => allItems.push({ collection: 'Transporteur', icon: '🚛', name: l.name, date: l.created_at }))
    distributors.forEach(d => allItems.push({ collection: 'Distributeur', icon: '🏪', name: d.name, date: d.created_at }))
    plots.forEach(p => allItems.push({ collection: 'Parcelle', icon: '🗺️', name: p.name, date: p.created_at }))
    resources.forEach(r => allItems.push({ collection: 'Ressource', icon: '🔧', name: r.name, date: r.created_at }))
    lots.forEach(l => allItems.push({ collection: 'Lot', icon: '📦', name: `${l.product} (${l.qty}${l.unit})`, date: l.created_at }))
    orders.forEach(o => allItems.push({ collection: 'Commande', icon: '🛒', name: o.ref, date: o.created_at }))
    bookings.forEach(b => allItems.push({ collection: 'Réservation', icon: '📅', name: b.item_name, date: b.created_at }))
    rfqs.forEach(r => allItems.push({ collection: 'Appel d\'offre', icon: '📋', name: r.title, date: r.created_at }))
    docs.forEach(d => allItems.push({ collection: 'Document', icon: '🧾', name: d.reference, date: d.created_at }))

    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setActivities(allItems.slice(0, 5))
  }, [])

  const role = profile?.role || 'producteur'
  const roleEmoji: Record<string, string> = {
    producteur: '👨‍🌾', transporteur: '🚛', acheteur_b2b: '🏪',
    cooperative: '🤝', proprietaire: '🏡', institution: '🏛️',
  }

  // Quick actions by role
  const quickActions: Array<{ icon: string; label: string; desc: string; link: string; color: string }> = role === 'producteur' ? [
    { icon: '📦', label: 'Transport', desc: 'Trouver un transporteur frigorifique', link: '/logistics', color: 'var(--blue-100)' },
    { icon: '🏪', label: 'Acheteurs', desc: 'Vendre votre production', link: '/distributors', color: 'var(--purple)' },
    { icon: '🗺️', label: 'Parcelles', desc: 'Voir les terres disponibles', link: '/plots', color: 'var(--green-100)' },
    { icon: '📦', label: 'Mes lots', desc: 'Créer un lot de production', link: '/lots', color: 'var(--gold-100)' },
    { icon: '🔗', label: 'Consolider', desc: 'Grouper pour l\'export', link: '/consolidation', color: '#FFF3E0' },
    { icon: '🔍', label: 'QR Traçabilité', desc: 'Générer un QR code', link: '/qr-codes', color: '#E0F7FA' },
    { icon: '🌍', label: 'Export', desc: 'Préparer un lot export', link: '/export', color: '#FFF3E0' },
    { icon: '📋', label: 'Appels d\'offre', desc: 'Répondre aux demandes', link: '/appels-offre', color: 'var(--green-100)' },
    { icon: '📄', label: 'Facturation', desc: 'Créer une facture', link: '/facturation', color: 'var(--gray-100)' },
  ] : role === 'transporteur' ? [
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Clients potentiels', link: '/producers', color: 'var(--green-100)' },
    { icon: '🏪', label: 'Distributeurs', desc: 'Livraisons à organiser', link: '/distributors', color: 'var(--purple)' },
    { icon: '📦', label: 'Commandes', desc: 'Tournées à planifier', link: '/orders', color: 'var(--gold-100)' },
    { icon: '🔧', label: 'Ressources', desc: 'Matériel & camions', link: '/resources', color: '#E0F7FA' },
    { icon: '🌍', label: 'Export', desc: 'Logistique export', link: '/export', color: '#FFF3E0' },
  ] : role === 'acheteur_b2b' ? [
    { icon: '📦', label: 'Commander', desc: 'Lots disponibles', link: '/lots', color: 'var(--gold-100)' },
    { icon: '🛒', label: 'Mes commandes', desc: 'Suivi des commandes', link: '/orders', color: 'var(--gold-100)' },
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Voir l\'offre disponible', link: '/producers', color: 'var(--green-100)' },
    { icon: '🚛', label: 'Transporteurs', desc: 'Organiser la livraison', link: '/logistics', color: 'var(--blue-100)' },
    { icon: '📋', label: 'Appels d\'offre', desc: 'Créer une demande', link: '/appels-offre', color: 'var(--green-100)' },
    { icon: '🔍', label: 'Traçabilité', desc: 'Scanner un QR lot', link: '/qr-codes', color: '#E0F7FA' },
    { icon: '🌍', label: 'Export', desc: 'Lots exportables', link: '/export', color: '#FFF3E0' },
  ] : role === 'proprietaire' ? [
    { icon: '🗺️', label: 'Mes parcelles', desc: 'Gérer mes terres', link: '/plots', color: 'var(--green-100)' },
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Trouver des fermiers', link: '/producers', color: 'var(--green-100)' },
    { icon: '🔧', label: 'Ressources', desc: 'Matériel partagé', link: '/resources', color: '#E0F7FA' },
    { icon: '⭐', label: 'Adhésion', desc: 'Mon plan', link: '/adhesion', color: 'var(--gold-100)' },
  ] : [
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Gérer les adhérents', link: '/producers', color: 'var(--green-100)' },
    { icon: '🚛', label: 'Transporteurs', desc: 'Gérer le transport', link: '/logistics', color: 'var(--blue-100)' },
    { icon: '🏪', label: 'Distributeurs', desc: 'Réseau distribution', link: '/distributors', color: 'var(--purple)' },
    { icon: '🗺️', label: 'Parcelles', desc: 'Terres & locations', link: '/plots', color: 'var(--green-100)' },
    { icon: '📦', label: 'Lots marché', desc: 'Volumé & disponibilités', link: '/lots', color: 'var(--gold-100)' },
    { icon: '📦', label: 'Commandes', desc: 'Suivi commandes', link: '/orders', color: 'var(--gold-100)' },
    { icon: '🌍', label: 'Export', desc: 'Module export', link: '/export', color: '#FFF3E0' },
    { icon: '📊', label: 'Admin', desc: 'Validation & stats', link: '/admin', color: 'var(--gray-100)' },
  ]

  // AI Suggestions — contextual from real data
  const suggestions = useMemo(() => {
    if (!stats) return []
    const s: Array<{ icon: string; title: string; text: string }> = []
    if (stats.lotsApproved > 0) {
      s.push({ icon: '📦', title: 'Lots approuvés', text: `Vous avez ${stats.lotsApproved} lots approuvés prêts pour la vente` })
    }
    if ((stats.ordersByStatus['pending'] || 0) > 0) {
      s.push({ icon: '⏳', title: 'Commandes en attente', text: `${stats.ordersByStatus['pending']} commandes en attente de validation` })
    }
    if (stats.plotsAvailable > 0) {
      s.push({ icon: '🗺️', title: 'Parcelles disponibles', text: `${stats.plotsAvailable} parcelles disponibles à la location` })
    }
    if (stats.producersWithoutCerts > 0) {
      s.push({ icon: '📋', title: 'Certifications', text: `${stats.producersWithoutCerts} producteurs sans certification — aidez-les à se qualifier` })
    }
    if (s.length === 0) {
      s.push({ icon: '💡', title: 'Bienvenue', text: 'Commencez par ajouter des producteurs ou créer des lots pour activer la plateforme.' })
    }
    return s
  }, [stats])

  // Synergy calculations
  const synergy = useMemo(() => {
    if (!stats) return { lotsToOrders: 0, ordersToInvoices: 0, plotsAvailable: 0, resourcesAvailable: 0, consolidation: 0 }
    const deliveredWithoutInvoice = Math.max(0, stats.deliveredOrdersCount - invoicedOrders.size)
    // Consolidation: count lots with same product across different producers (groupable)
    const lots = getAll('lots') as Lot[]
    const productProducers = new Map<string, Set<string>>()
    lots.filter(l => l.status === 'approved').forEach(l => {
      if (!productProducers.has(l.product)) productProducers.set(l.product, new Set())
      productProducers.get(l.product)!.add(l.producer)
    })
    const consolidation = Array.from(productProducers.values()).filter(s => s.size >= 2).length
    return {
      lotsToOrders: stats.lotsApproved,
      ordersToInvoices: deliveredWithoutInvoice,
      plotsAvailable: stats.plotsAvailable,
      resourcesAvailable: stats.resourcesAvailable,
      consolidation,
    }
  }, [stats, invoicedOrders])

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffH = Math.floor(diffMs / 3600000)
      if (diffH < 1) return 'À l\'instant'
      if (diffH < 24) return `Il y a ${diffH}h`
      const diffD = Math.floor(diffH / 24)
      if (diffD < 7) return `Il y a ${diffD}j`
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch {
      return iso
    }
  }

  if (!stats) return <div className="page"><p>Chargement…</p></div>

  return (
    <div className="page">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <h1>{roleEmoji[role] || '👋'} Bonjour, {profile?.full_name || 'Producteur'} !</h1>
      </div>

      {/* Supabase Sync */}
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h2>☁️ Synchronisation Supabase</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: hasCredentials() ? '#4CAF50' : '#F44336',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {hasCredentials() ? 'Connecté' : 'Mode démo (localStorage)'}
            </span>
          </div>

          {hasCredentials() && (
            <button
              className="btn"
              onClick={handleSync}
              disabled={syncing}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: syncing ? 'var(--gray-200)' : 'var(--blue-100)',
                color: syncing ? 'var(--gray-500)' : 'var(--blue-600)',
                border: 'none', padding: '0.5rem 1rem', borderRadius: 8,
                fontSize: 14, cursor: syncing ? 'not-allowed' : 'pointer',
              }}
            >
              {syncing ? (
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <RefreshCw size={16} />
              )}
              {syncing ? 'Synchronisation…' : 'Synchroniser ↓↑'}
            </button>
          )}

          {lastSyncTime && hasCredentials() && (
            <span style={{ fontSize: 13, color: 'var(--green-700)' }}>
              ✅ Synchronisé à {lastSyncTime}
            </span>
          )}

          {syncStatus.lastSyncFromSupabase && hasCredentials() && !lastSyncTime && (
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              Dernière sync : {new Date(syncStatus.lastSyncFromSupabase).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {!hasCredentials() && (
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            Pour activer le backend Supabase, ajoutez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans <code>.env</code>
          </p>
        )}

        {syncStatus.lastError && hasCredentials() && (
          <p style={{ fontSize: 13, color: '#C62828', marginTop: '0.5rem' }}>
            ⚠️ Erreur : {syncStatus.lastError}
          </p>
        )}
      </div>

      {/* 8 stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}><Users size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.producersActive}/{stats.producersTotal}</span><span className="stat-label">Producteurs actifs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}><Truck size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.logisticsActive}/{stats.logisticsTotal}</span><span className="stat-label">Transporteurs actifs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: '#c66200' }}><Package size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.lotsApproved}</span><span className="stat-label">Lots en vente</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0', color: 'var(--orange)' }}><ShoppingCart size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.ordersInProgress}</span><span className="stat-label">Commandes en cours</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}><TrendingUp size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span><span className="stat-label">Chiffre d'affaires</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: 'var(--purple)' }}><TrendingUp size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.commissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span><span className="stat-label">Commissions</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0F7FA', color: 'var(--teal)' }}><Sprout size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.rfqActive}</span><span className="stat-label">Appels d'offre actifs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFEBEE', color: '#C62828' }}><FileText size={22} /></div>
          <div className="stat-info"><span className="stat-number">{stats.unpaidInvoices}</span><span className="stat-label">Factures en attente</span></div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="section-block">
        <h2>⚡ Actions rapides</h2>
        <div className="quick-actions">
          {quickActions.map((a, i) => (
            <Link key={i} to={a.link} className="quick-action-card" style={{ borderColor: 'transparent' }}>
              <span style={{ fontSize: 28 }}>{a.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>{a.label}</strong>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two columns: Activity + Suggestions */}
      <div className="dash-columns">
        <div className="section-block">
          <h2><Bell size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Activité récente</h2>
          <div className="activity-feed">
            {activities.length > 0 ? activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ fontSize: 22 }}>{a.icon}</div>
                <div className="activity-content">
                  <p>[{a.collection}] Nouveau {a.name} — {formatDate(a.date)}</p>
                </div>
              </div>
            )) : (
              <div className="empty-state">Aucune activité récente</div>
            )}
          </div>
        </div>

        <div className="section-block">
          <h2><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--blue-600)' }} /> Suggestions IA</h2>
          <div className="ai-suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="suggestion-card">
                <span className="suggestion-icon">{s.icon}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synergy Section */}
      <div className="section-block">
        <h2>🔗 Liens rapides</h2>
        <div className="synergy-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <Link to="/lots" className="synergy-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'var(--gold-100)', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>📦</span>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Lots → Commandes</strong>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{synergy.lotsToOrders} lots approuvés peuvent être commandés</span>
            </div>
          </Link>
          <Link to="/facturation" className="synergy-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: '#FFEBEE', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>🧾</span>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Commandes → Factures</strong>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{synergy.ordersToInvoices} commandes livrées sans facture</span>
            </div>
          </Link>
          <Link to="/plots" className="synergy-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'var(--green-100)', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>🗺️</span>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Parcelles → Producteurs</strong>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{synergy.plotsAvailable} parcelles disponibles</span>
            </div>
          </Link>
          <Link to="/resources" className="synergy-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: '#E0F7FA', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>🔧</span>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Ressources → Réservations</strong>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{synergy.resourcesAvailable} ressources disponibles</span>
            </div>
          </Link>
          <Link to="/consolidation" className="synergy-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: '#FFF3E0', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>📊</span>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Consolidation</strong>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{synergy.consolidation} produits groupables pour export</span>
            </div>
          </Link>
        </div>
      </div>

      {/* WhatsApp banner */}
      <div className="whatsapp-banner">
        <span className="wa-banner-icon">💬</span>
        <div className="wa-banner-text">
          <strong>Besoin d'aide ?</strong>
          <p>Contactez-nous sur WhatsApp — réponse rapide</p>
        </div>
        <a
          href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9Agri%2C%20j%27ai%20besoin%20d%27aide"
          target="_blank" rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <MessageCircle size={18} /> Écrire
        </a>
      </div>
    </div>
  )
}

export default Dashboard

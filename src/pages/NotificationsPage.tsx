import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, Package, Calendar, FileText, CreditCard, ExternalLink } from 'lucide-react'
import { getAll, add, update, remove } from '../services/dataService'

interface Notification {
  id: string
  type: 'order' | 'lot' | 'booking' | 'rfq' | 'payment'
  title: string
  message: string
  read: boolean
  created_at: string
  link: string
  active: boolean
}

const TYPE_CFG: Record<string, { icon: React.ReactNode; color: string }> = {
  order: { icon: <ShoppingCart size={18} />, color: '#0277BD' },
  lot: { icon: <Package size={18} />, color: '#2E7D32' },
  booking: { icon: <Calendar size={18} />, color: '#F57C00' },
  rfq: { icon: <FileText size={18} />, color: '#7B1FA2' },
  payment: { icon: <CreditCard size={18} />, color: '#1B5E20' },
}

const SEED_NOTIFICATIONS: Omit<Notification, 'id' | 'created_at' | 'active'>[] = [
  { type: 'order', title: 'Nouvelle commande', message: 'CMD-006 — Hôtel Bakoua commande 200 kg de banane', read: false, link: '/orders' },
  { type: 'lot', title: 'Lot approuvé', message: 'Lot Avocat Haas (300 kg) approuvé par la coopérative', read: false, link: '/lots' },
  { type: 'booking', title: 'Demande de réservation', message: 'Jean-Pierre demande la parcelle Nord-Est pour septembre', read: false, link: '/plots' },
  { type: 'rfq', title: 'Réponse RFQ', message: 'Transports Férand a répondu à votre appel d\'offre transport', read: true, link: '/appels-offre' },
  { type: 'payment', title: 'Paiement reçu', message: '500€ reçu pour la commande CMD-001 — Hôtel Bakoua', read: true, link: '/facturation' },
]

export function seedNotificationsIfEmpty(): void {
  const key = 'kopeagri_notifications_seeded'
  if (localStorage.getItem(key)) return
  const existing = getAll('notifications') as Notification[]
  if (existing.length > 0) return
  SEED_NOTIFICATIONS.forEach(n => {
    add('notifications', { ...n, active: true } as any)
  })
  localStorage.setItem(key, 'true')
}

export function getUnreadCount(): number {
  const all = getAll('notifications') as Notification[]
  return all.filter(n => !n.read && n.active).length
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = () => {
    seedNotificationsIfEmpty()
    setNotifications(getAll('notifications') as Notification[])
  }
  useEffect(load, [])

  const markRead = (id: string) => {
    update('notifications', id, { read: true } as any)
    load()
  }

  const markAllRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      update('notifications', n.id, { read: true } as any)
    })
    load()
  }

  const deleteNotif = (id: string) => {
    remove('notifications', id)
    load()
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Bell size={24} /> Notifications</h1>
          <p className="page-subtitle">{notifications.filter(n => !n.read).length} non lues sur {notifications.length}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>Toutes</button>
          <button className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('unread')}>Non lues</button>
          <button className="btn btn-sm btn-outline" onClick={markAllRead}><CheckCheck size={14} /> Tout lire</button>
        </div>
      </div>

      <div className="notifications-list">
        {filtered.map(n => {
          const cfg = TYPE_CFG[n.type] || { icon: <Bell size={18} />, color: '#666' }
          return (
            <div key={n.id} className={`notification-card ${!n.read ? 'unread' : ''}`} style={{ borderLeft: !n.read ? `4px solid ${cfg.color}` : '4px solid transparent' }}>
              <div className="notification-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
              <div className="notification-content">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <span className="notification-date">{new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="notification-actions">
                {!n.read && (
                  <button className="btn-icon" onClick={() => markRead(n.id)} title="Marquer lu">
                    <Check size={16} />
                  </button>
                )}
                <a href={n.link} className="btn-icon" title="Voir"><ExternalLink size={16} /></a>
                <button className="btn-icon danger" onClick={() => deleteNotif(n.id)} title="Supprimer"><Trash2 size={16} /></button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">Aucune notification</div>}
    </div>
  )
}

export default NotificationsPage

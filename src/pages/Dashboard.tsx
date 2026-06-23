import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { 
  Package, Map, ShoppingCart, Grid, Truck, QrCode,
  TrendingUp, DollarSign, Users, CheckCircle, Clock 
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Mes parcelles', path: '/plots', icon: Map, color: '#2E7D32' },
  { label: 'Créer un lot', path: '/lots', icon: Package, color: '#F57C00' },
  { label: 'Voir les ressources', path: '/resources', icon: Grid, color: '#0277BD' },
  { label: 'Mes commandes', path: '/orders', icon: ShoppingCart, color: '#6A1B9A' },
  { label: 'QR Codes', path: '/qr-codes', icon: QrCode, color: '#00838F' },
]

const ROLE_STATS: Record<string, { label: string; value: string; icon: any; color: string }[]> = {
  producteur: [
    { label: 'Mes lots actifs', value: '4', icon: Package, color: '#2E7D32' },
    { label: 'Commandes en cours', value: '2', icon: ShoppingCart, color: '#F57C00' },
    { label: 'Réservations actives', value: '1', icon: Grid, color: '#0277BD' },
    { label: 'Revenu total', value: '3 250€', icon: TrendingUp, color: '#6A1B9A' },
  ],
  cooperative: [
    { label: 'Membres', value: '45', icon: Users, color: '#2E7D32' },
    { label: 'Commandes totales', value: '28', icon: ShoppingCart, color: '#F57C00' },
    { label: 'Volume consolidé', value: '12.5T', icon: Package, color: '#0277BD' },
    { label: 'Commissions', value: '1 850€', icon: DollarSign, color: '#6A1B9A' },
  ],
  acheteur_b2b: [
    { label: 'Lots disponibles', value: '156', icon: Package, color: '#2E7D32' },
    { label: 'Commandes en cours', value: '3', icon: ShoppingCart, color: '#F57C00' },
    { label: 'Livraisons à venir', value: '2', icon: Truck, color: '#0277BD' },
    { label: 'Dépenses du mois', value: '4 500€', icon: DollarSign, color: '#6A1B9A' },
  ],
  transporteur: [
    { label: 'Tournées à venir', value: '5', icon: Truck, color: '#2E7D32' },
    { label: 'Collectes planifiées', value: '3', icon: Grid, color: '#F57C00' },
    { label: 'Livrées ce mois', value: '12', icon: CheckCircle, color: '#0277BD' },
    { label: 'Revenu transport', value: '2 100€', icon: TrendingUp, color: '#6A1B9A' },
  ],
}

const RECENT_ACTIVITY = [
  { action: 'Nouveau lot créé', detail: 'Bananes Cavendish · 500kg', status: 'approved', time: 'Il y a 2h' },
  { action: 'Commande confirmée', detail: 'Hôtel Bakoua · 12 paniers', status: 'active', time: 'Il y a 4h' },
  { action: 'Réservation équipement', detail: 'Tracteur · 3 jours', status: 'pending', time: 'Il y a 5h' },
  { action: 'Lot certifié bio', detail: 'Mangue José · 200kg', status: 'approved', time: 'Hier' },
  { action: 'Livraison effectuée', detail: 'Marché Fort-de-France', status: 'completed', time: 'Hier' },
]

const STATUS_ICONS: Record<string, any> = {
  pending: { icon: Clock, color: '#F57C00' },
  approved: { icon: CheckCircle, color: '#2E7D32' },
  active: { icon: TrendingUp, color: '#0277BD' },
  completed: { icon: CheckCircle, color: '#558B2F' },
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const role = profile?.role || 'producteur'
  const stats = ROLE_STATS[role] || ROLE_STATS.producteur

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Bonjour, {profile?.full_name}</h1>
          <p className="page-subtitle">Bienvenue sur votre tableau de bord KopéAgri</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="section-block">
        <h2>Actions rapides</h2>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} to={action.path} className="quick-action-card" style={{ borderColor: action.color }}>
              <action.icon size={28} style={{ color: action.color }} />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="dash-columns">
        {/* Activity feed */}
        <div className="section-block">
          <h2>Activité récente</h2>
          <div className="activity-feed">
            {RECENT_ACTIVITY.map((item, i) => {
              const StatusIcon = STATUS_ICONS[item.status]?.icon || CheckCircle
              const statusColor = STATUS_ICONS[item.status]?.color || '#666'
              return (
                <div key={i} className="activity-item">
                  <div className="activity-icon" style={{ color: statusColor }}>
                    <StatusIcon size={18} />
                  </div>
                  <div className="activity-content">
                    <strong>{item.action}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI suggestions */}
        <div className="section-block">
          <h2>🤖 Suggestions IA</h2>
          <div className="ai-suggestions">
            <div className="suggestion-card">
              <div className="suggestion-icon">💡</div>
              <div>
                <strong>Regroupement possible</strong>
                <p>3 producteurs de bananes dans le Nord peuvent consolider 1.2T pour l'export vers la Guadeloupe.</p>
              </div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-icon">🚛</div>
              <div>
                <strong>Tournée mutualisée</strong>
                <p>Optimisez la collecte Nord-Atlantique : 4 points de ramassage pour 6 lots.</p>
              </div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-icon">⚠️</div>
              <div>
                <strong>Alerte volume</strong>
                <p>Commande Hôtel Bakoua à 200kg — il manque 50kg. Activez la consolidation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
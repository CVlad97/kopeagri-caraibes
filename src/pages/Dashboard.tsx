import React, { useState, useEffect } from 'react'
import { Users, Truck, ShoppingCart, ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const [counts, setCounts] = useState({ producers: 0, logistics: 0, distributors: 0 })

  useEffect(() => {
    const p = (getAll('producers') as Producer[]).filter(x => x.active).length
    const l = (getAll('logistics') as LogisticsProvider[]).filter(x => x.active).length
    const d = (getAll('distributors') as Distributor[]).filter(x => x.active).length
    setCounts({ producers: p, logistics: l, distributors: d })
  }, [])

  const role = profile?.role || 'producteur'
  const roleEmoji: Record<string, string> = {
    producteur: '👨‍🌾', transporteur: '🚛', acheteur_b2b: '🏪',
    cooperative: '🤝', proprietaire: '🏡', institution: '🏛️',
  }

  const quickActions = role === 'producteur' ? [
    { icon: '📦', label: 'Besoin de transport', desc: 'Trouvez un transporteur', link: '/logistics' },
    { icon: '🏪', label: 'Trouver un acheteur', desc: 'Vendez votre production', link: '/distributors' },
    { icon: '💬', label: 'Contacter WhatsApp', desc: 'Échangez directement', link: 'https://wa.me/596696000000?text=Bonjour%20KopéAgri' },
  ] : role === 'transporteur' ? [
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Voir les producteurs', link: '/producers' },
    { icon: '🏪', label: 'Distributeurs', desc: 'Clients potentiels', link: '/distributors' },
    { icon: '💬', label: 'Contacter WhatsApp', desc: 'Échangez directement', link: 'https://wa.me/596696000000?text=Bonjour%20KopéAgri' },
  ] : role === 'acheteur_b2b' ? [
    { icon: '👨‍🌾', label: 'Producteurs', desc: "Voir l'offre disponible", link: '/producers' },
    { icon: '🚛', label: 'Transporteurs', desc: 'Organiser la livraison', link: '/logistics' },
    { icon: '💬', label: 'Contacter WhatsApp', desc: 'Commander directement', link: 'https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20je%20souhaite%20commander' },
  ] : [
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Gérer les producteurs', link: '/producers' },
    { icon: '🚛', label: 'Transporteurs', desc: 'Gérer le transport', link: '/logistics' },
    { icon: '🏪', label: 'Distributeurs', desc: 'Gérer la distribution', link: '/distributors' },
    { icon: '💬', label: 'WhatsApp', desc: 'Support', link: 'https://wa.me/596696000000?text=Bonjour%20KopéAgri' },
  ]

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1>{roleEmoji[role] || '👋'} Bonjour, {profile?.full_name || 'Producteur'} !</h1>
          <p className="text-muted">Votre tableau de bord KopéAgri Caraïbes</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-value">{counts.producers}</div>
          <div className="stat-label">Producteurs actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Truck size={24} /></div>
          <div className="stat-value">{counts.logistics}</div>
          <div className="stat-label">Transporteurs actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingCart size={24} /></div>
          <div className="stat-value">{counts.distributors}</div>
          <div className="stat-label">Distributeurs actifs</div>
        </div>
      </div>

      <h2 style={{ marginTop: 32, marginBottom: 16 }}>Actions rapides</h2>
      <div className="quick-actions">
        {quickActions.map((action, i) => (
          action.link.startsWith('http') ? (
            <a key={i} href={action.link} target="_blank" rel="noopener noreferrer" className="quick-action-card">
              <span className="qa-icon">{action.icon}</span>
              <div className="qa-text">
                <strong>{action.label}</strong>
                <p>{action.desc}</p>
              </div>
              <ArrowRight size={16} />
            </a>
          ) : (
            <Link key={i} to={action.link} className="quick-action-card">
              <span className="qa-icon">{action.icon}</span>
              <div className="qa-text">
                <strong>{action.label}</strong>
                <p>{action.desc}</p>
              </div>
              <ArrowRight size={16} />
            </Link>
          )
        ))}
      </div>

      <div className="whatsapp-banner">
        <span className="wa-banner-icon">💬</span>
        <div className="wa-banner-text">
          <strong>Besoin d'aide ?</strong>
          <p>Contactez-nous directement sur WhatsApp pour toute question</p>
        </div>
        <a href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20j%27ai%20besoin%20d%27aide" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <MessageCircle size={18} /> Écrire
        </a>
      </div>
    </div>
  )
}

export default Dashboard

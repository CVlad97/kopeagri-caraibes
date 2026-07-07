import React, { useState, useEffect } from 'react'
import {
  Users, Truck, ShoppingCart, MapPin, Wrench, Package, QrCode, Globe,
  ArrowRight, MessageCircle, TrendingUp, Sprout, Bell
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

interface Counts {
  producers: number; logistics: number; distributors: number;
  plots: number; resources: number; lots: number; orders: number;
  exports: number; communes: number;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const [counts, setCounts] = useState<Counts>({
    producers: 0, logistics: 0, distributors: 0,
    plots: 0, resources: 0, lots: 0, orders: 0,
    exports: 0, communes: 0,
  })

  useEffect(() => {
    const p = (getAll('producers') as Producer[]).filter(x => x.active).length
    const l = (getAll('logistics') as LogisticsProvider[]).filter(x => x.active).length
    const d = (getAll('distributors') as Distributor[]).filter(x => x.active).length
    const allP = getAll('producers') as Producer[]
    const uniqueCommunes = new Set(allP.map(x => x.commune)).size
    // Count other entities from localStorage
    const plots = JSON.parse(localStorage.getItem('kopeagri_plots') || '[]').length
    const resources = JSON.parse(localStorage.getItem('kopeagri_resources') || '[]').length
    const lots = JSON.parse(localStorage.getItem('kopeagri_lots') || '[]').length
    const orders = JSON.parse(localStorage.getItem('kopeagri_orders') || '[]').length
    const exports_ = JSON.parse(localStorage.getItem('kopeagri_export_lots') || '[]').length
    setCounts({
      producers: p, logistics: l, distributors: d,
      plots, resources, lots, orders,
      exports: exports_, communes: uniqueCommunes,
    })
  }, [])

  const role = profile?.role || 'producteur'
  const roleEmoji: Record<string, string> = {
    producteur: '👨‍🌾', transporteur: '🚛', acheteur_b2b: '🏪',
    cooperative: '🤝', proprietaire: '🏡', institution: '🏛️',
  }

  // Quick actions by role — full coverage
  const quickActions: Array<{ icon: string; label: string; desc: string; link: string; color: string }> = role === 'producteur' ? [
    { icon: '📦', label: 'Transport', desc: 'Trouver un transporteur frigorifique', link: '/logistics', color: 'var(--blue-100)' },
    { icon: '🏪', label: 'Acheteurs', desc: 'Vendre votre production', link: '/distributors', color: 'var(--purple)' },
    { icon: '🗺️', label: 'Parcelles', desc: 'Voir les terres disponibles', link: '/plots', color: 'var(--green-100)' },
    { icon: '📦', label: 'Mes lots', desc: 'Créer un lot de production', link: '/lots', color: 'var(--gold-100)' },
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
    { icon: '👨‍🌾', label: 'Producteurs', desc: 'Voir l\'offre disponible', link: '/producers', color: 'var(--green-100)' },
    { icon: '📦', label: 'Lots marché', desc: 'Lots disponibles', link: '/lots', color: 'var(--gold-100)' },
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

  // AI-style suggestions by role
  const suggestions = role === 'producteur' ? [
    { icon: '🍌', title: 'Groupage banane', text: '3 producteurs à Saint-Pierre ont des lots prêts — groupez pour exporter !' },
    { icon: '🌡️', title: 'Alerte saison', text: 'Saison mangue : pic de récolte en juin-juillet. Préparez vos lots maintenant.' },
    { icon: '🚛', title: 'Transport disponible', text: 'Un transporteur frigorifique passe à Lamentin demain — réservez !' },
  ] : role === 'acheteur_b2b' ? [
    { icon: '📦', title: 'Lots fraîcheur', text: '12 lots de légumes pays disponibles cette semaine dans le Nord.' },
    { icon: '💰', title: 'Prix compétitifs', text: 'Le prix banane est à 0,85€/kg — 15% sous le marché métro.' },
    { icon: '🚛', title: 'Livraison groupée', text: 'Tournée Nord → Sud prévue vendredi, places disponibles.' },
  ] : [
    { icon: '📊', title: 'Volume consolidé', text: '450 kg de banane groupable ce mois-ci — record !' },
    { icon: '✅', title: '3 adhésions en attente', text: 'Nouveaux producteurs à valider : Ducos, Saint-Pierre, Marin.' },
    { icon: '🌍', title: 'Opportunité export', text: 'Demande Canada : 2T avocats — lots suffisants ?' },
  ]

  // Recent activity (simulated but realistic)
  const activities = [
    { icon: '🧑‍🌾', text: 'Jean-Pierre (Ducos) a rejoint la coopérative', time: 'Il y a 2h' },
    { icon: '📦', text: 'Lot #004 Banane — statut mis à jour : Disponible', time: 'Il y a 5h' },
    { icon: '🚛', text: 'Tournée Lamentin → Fdf programmée demain 6h', time: 'Il y a 8h' },
    { icon: '📋', text: 'Appel d\'offre #AF-003 : 500kg mangues', time: 'Hier' },
    { icon: '✅', text: 'Marie (Saint-Pierre) validée comme producteur', time: 'Hier' },
  ]

  return (
    <div className="page">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <h1>{roleEmoji[role] || '👋'} Bonjour, {profile?.full_name || 'Producteur'} !</h1>
      </div>

      {/* Full stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}><Users size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.producers}</span><span className="stat-label">Producteurs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}><Truck size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.logistics}</span><span className="stat-label">Transporteurs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: 'var(--purple)' }}><ShoppingCart size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.distributors}</span><span className="stat-label">Distributeurs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}><MapPin size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.plots}</span><span className="stat-label">Parcelles</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0F7FA', color: 'var(--teal)' }}><Wrench size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.resources}</span><span className="stat-label">Ressources</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: '#c66200' }}><Package size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.lots}</span><span className="stat-label">Lots marché</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: '#c66200' }}><Package size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.orders}</span><span className="stat-label">Commandes</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0', color: 'var(--orange)' }}><Globe size={22} /></div>
          <div className="stat-info"><span className="stat-num">{counts.exports}</span><span className="stat-label">Lots export</span></div>
        </div>
      </div>

      {/* Quick actions — full MVP */}
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
            {activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ fontSize: 22 }}>{a.icon}</div>
                <div className="activity-content">
                  <p>{a.text}</p>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.time}</span>
                </div>
              </div>
            ))}
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

      {/* WhatsApp banner */}
      <div className="whatsapp-banner">
        <span className="wa-banner-icon">💬</span>
        <div className="wa-banner-text">
          <strong>Besoin d'aide ?</strong>
          <p>Contactez-nous sur WhatsApp — réponse rapide</p>
        </div>
        <a
          href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20j%27ai%20besoin%20d%27aide"
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

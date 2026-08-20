import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Fish, Tractor, ShoppingCart, Truck, Building2 } from 'lucide-react'

const LandingOfficiellePage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <span className="badge badge-green">Pilote Martinique</span>
        <h1 style={{ marginTop: 10 }}>Vendez vos produits locaux plus simplement</h1>
        <p>
          Agriculteurs, pêcheurs, acheteurs et transporteurs réunis sur une plateforme simple,
          mobile et traçable.
        </p>
        <p style={{ opacity: 0.8 }}>
          Kopé Agri & Pêche aide les petits producteurs et pêcheurs à vendre plus simplement,
          organiser la collecte, prouver l’origine des produits et sécuriser les commandes locales.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/onboarding" className="btn btn-primary">Rejoindre le pilote Martinique</Link>
          <Link to="/sell-now" className="btn btn-outline">Je vends maintenant</Link>
          <a href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9%20Agri%20%26%20P%C3%AAche%2C%20je%20souhaite%20une%20d%C3%A9mo" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Demander une démo
          </a>
        </div>
      </section>

      <section className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card"><div className="stat-icon"><Tractor size={20} /></div><div className="stat-info"><span className="stat-label">Pour producteurs</span><span className="stat-number">Publiez en 1 minute</span></div></div>
        <div className="stat-card"><div className="stat-icon"><Fish size={20} /></div><div className="stat-info"><span className="stat-label">Pour pêcheurs</span><span className="stat-number">Lots + traçabilité</span></div></div>
        <div className="stat-card"><div className="stat-icon"><ShoppingCart size={20} /></div><div className="stat-info"><span className="stat-label">Pour acheteurs</span><span className="stat-number">Volumes localement</span></div></div>
        <div className="stat-card"><div className="stat-icon"><Truck size={20} /></div><div className="stat-info"><span className="stat-label">Pour transporteurs</span><span className="stat-number">Missions de collecte</span></div></div>
        <div className="stat-card"><div className="stat-icon"><Building2 size={20} /></div><div className="stat-info"><span className="stat-label">Pour institutions</span><span className="stat-number">Pilotage filière</span></div></div>
      </section>

      <section className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h2>Parcours simple</h2>
        <ol>
          <li>Je vends</li>
          <li>Je récolte / je pêche</li>
          <li>Je trouve un acheteur</li>
          <li>Je livre ou je fais collecter</li>
          <li>Je prouve l’origine (QR)</li>
          <li>Je suis payé</li>
        </ol>
      </section>

      <section className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h2>Pages publiques partageables</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/lot/lot1" className="btn btn-outline">Page lot</Link>
          <Link to="/marketplace" className="btn btn-outline">Catalogue WhatsApp</Link>
          <Link to="/partners" className="btn btn-outline">Acheteurs partenaires</Link>
          <Link to="/producers" className="btn btn-outline">Page producteurs</Link>
          <Link to="/seafood" className="btn btn-outline">Page pêcheurs</Link>
        </div>
      </section>

      <section className="card" style={{ padding: 16 }}>
        <h2>Appels pilote</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/onboarding" className="btn btn-primary">Inscrire un producteur</Link>
          <Link to="/onboarding" className="btn btn-primary">Inscrire un pêcheur</Link>
          <Link to="/onboarding" className="btn btn-outline">Devenir acheteur partenaire</Link>
          <a href="https://wa.me/596696000000?text=Bonjour%2C%20je%20veux%20rejoindre%20le%20pilote%20Martinique" target="_blank" rel="noopener noreferrer" className="btn btn-outline">Contacter l’équipe</a>
        </div>
      </section>
    </div>
  )
}

export default LandingOfficiellePage

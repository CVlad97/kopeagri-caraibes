import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Fish, Tractor, ShoppingCart, Truck, Building2, ShieldCheck, FileText } from 'lucide-react'

const LandingOfficiellePage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <span className="badge badge-green">Pilote Martinique — Version 1</span>
        <h1 style={{ marginTop: 10 }}>Vendez vos produits locaux plus simplement</h1>
        <p>
          Agriculteurs, pêcheurs, acheteurs et transporteurs réunis sur une plateforme simple,
          mobile et traçable.
        </p>
        <p style={{ opacity: 0.85 }}>
          Kopé Agri & Pêche aide les petits producteurs et pêcheurs à publier leurs lots,
          trouver des acheteurs, organiser la collecte et partager une preuve d’origine via QR.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <Link to="/onboarding" className="btn btn-primary">Rejoindre le pilote Martinique</Link>
          <Link to="/sell-now" className="btn btn-outline">Je vends maintenant</Link>
          <a
            href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9%20Agri%20%26%20P%C3%AAche%2C%20je%20souhaite%20une%20d%C3%A9mo"
            className="btn btn-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} /> Demander une démo
          </a>
        </div>
      </section>

      <section className="card" style={{ padding: 16, marginBottom: 16, border: '1px solid #d9f2e2' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Cadre de confiance (version pilote)
        </h2>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Statut du projet : plateforme pilote opérationnelle en Martinique.</li>
          <li>Traçabilité : niveaux D0 à D3 (déclaré, recoupé, documenté, validé tiers).</li>
          <li>Aucune promesse de certification automatique : la plateforme organise la preuve, elle ne remplace pas les autorités.</li>
          <li>Données sensibles : non affichées publiquement (RIB, téléphone privé, email privé, adresse exacte).</li>
        </ul>
        <div style={{ marginTop: 10 }}>
          <Link to="/legal" className="btn btn-outline"><FileText size={16} /> Mentions légales, RGPD et limites</Link>
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
        <h2>Parcours terrain simple</h2>
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
        <h2>Références officielles utiles</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL — Données personnelles</a>
          <a href="https://www.legifrance.gouv.fr" target="_blank" rel="noopener noreferrer">Légifrance — Cadre juridique</a>
          <a href="https://agriculture.gouv.fr" target="_blank" rel="noopener noreferrer">Ministère de l’Agriculture</a>
          <a href="https://www.economie.gouv.fr/dgccrf" target="_blank" rel="noopener noreferrer">DGCCRF — Information consommateur / origine</a>
          <a href="https://www.mer.gouv.fr" target="_blank" rel="noopener noreferrer">mer.gouv.fr — Réglementation pêche</a>
        </div>
      </section>
    </div>
  )
}

export default LandingOfficiellePage

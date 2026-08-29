import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Fish,
  Tractor,
  ShoppingCart,
  Truck,
  Building2,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { checkBackendHealth, type BackendHealth } from '../services/backendHealth'
import '../styles/landing-premium.css'

const LandingOfficiellePage: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const h = await checkBackendHealth()
      if (mounted) setHealth(h)
    }
    run()
    const id = setInterval(run, 30000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const trustLabel = useMemo(() => {
    if (!health) return 'Vérification en cours'
    if (health.mode === 'connected') return 'Fiabilité: élevée'
    if (health.mode === 'degraded') return 'Fiabilité: à surveiller'
    return 'Mode local: actif'
  }, [health])

  const trustClass = useMemo(() => {
    if (!health) return 'local'
    return health.mode
  }, [health])

  return (
    <div className="page landing-premium">
      <section className="premium-hero">
        <div className="premium-grid">
          <div>
            <span className="premium-badge">Pilote Martinique — version terrain</span>
            <h1 className="premium-title">Vends ton lot aujourd’hui. Encaisse plus vite.</h1>
            <p className="premium-sub">
              Une app simple pour agriculteurs et pêcheurs: publier, partager sur WhatsApp,
              trouver acheteur, organiser collecte, prouver l’origine avec QR.
            </p>

            <div className="premium-cta">
              <Link to="/sell-now" className="btn btn-primary">Publier mon lot</Link>
              <Link to="/demo" className="btn btn-outline">Voir la démo</Link>
              <Link to="/onboarding" className="btn btn-outline">Créer mon compte</Link>
              <a
                href="https://wa.me/596696653589?text=Bonjour%2C%20je%20veux%20vendre%20mon%20lot%20avec%20Kop%C3%A9"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp direct
              </a>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={`health-pill ${trustClass}`}>{trustLabel}</span>
            </div>
          </div>

          <div className="premium-glass">
            <h3>Ce que tu gagnes</h3>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Publication guidée en moins de 5 min</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Lien WhatsApp prêt à envoyer</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> QR de traçabilité partageable</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Commandes et suivi au même endroit</p>
          </div>
        </div>
      </section>

      <section className="premium-cards">
        <div className="premium-card"><h4><Tractor size={16} /> Je suis producteur</h4><p>Je publie mes récoltes, je fixe mon prix, je vends plus vite.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Vendre maintenant</Link></div>
        <div className="premium-card"><h4><Fish size={16} /> Je suis pêcheur</h4><p>Je publie mes espèces du jour et je partage en un clic.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Publier ma pêche</Link></div>
        <div className="premium-card"><h4><ShoppingCart size={16} /> Je suis acheteur</h4><p>Je vois les lots dispo et je commande rapidement.</p><Link to="/marketplace" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les lots</Link></div>
        <div className="premium-card"><h4><Truck size={16} /> Je suis transporteur</h4><p>Je récupère des missions de collecte/livraison.</p><Link to="/logistics" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les demandes</Link></div>
        <div className="premium-card"><h4><Building2 size={16} /> Je suis institution</h4><p>Je suis les flux filière avec des indicateurs clairs.</p><Link to="/dashboard" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir le dashboard</Link></div>
      </section>

      <section className="trust-strip">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Confiance & cadre
        </h2>
        <ul>
          <li>Traçabilité D0 à D3: déclaré, recoupé, documenté, validé tiers.</li>
          <li>Aucune promesse de certification automatique.</li>
          <li>Données sensibles non affichées publiquement.</li>
        </ul>
        <div style={{ marginTop: 10 }}>
          <Link to="/legal" className="btn btn-outline"><FileText size={16} /> Mentions légales & RGPD</Link>
        </div>
      </section>

      <section className="section-block" style={{ marginBottom: 16 }}>
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
    </div>
  )
}

export default LandingOfficiellePage

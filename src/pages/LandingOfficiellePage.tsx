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
  Wifi,
  Database,
  Gauge,
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

  const healthClass = useMemo(() => {
    if (!health) return 'local'
    return health.mode
  }, [health])

  const healthLabel = useMemo(() => {
    if (!health) return 'Vérification backend...'
    if (health.mode === 'connected') return 'Backend connecté'
    if (health.mode === 'degraded') return 'Backend dégradé'
    return 'Mode local actif'
  }, [health])

  return (
    <div className="page landing-premium">
      <section className="premium-hero">
        <div className="premium-grid">
          <div>
            <span className="premium-badge">Pilote Martinique — Version fusionnée v1.1</span>
            <h1 className="premium-title">Kopé Agri & Pêche</h1>
            <p className="premium-sub">
              Vendez plus vite, trouvez des acheteurs, organisez la collecte,
              partagez un QR lot traçable. Simple sur téléphone.
            </p>

            <div className="premium-cta">
              <Link to="/onboarding" className="btn btn-primary">Rejoindre le pilote</Link>
              <Link to="/sell-now" className="btn btn-outline">Je vends maintenant</Link>
              <a
                href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9%20Agri%20%26%20P%C3%AAche%2C%20je%20souhaite%20une%20d%C3%A9mo"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp démo
              </a>
            </div>
          </div>

          <div className="premium-glass">
            <h3>⚙️ État plateforme</h3>
            <p>Vue live frontend + backend pour éviter les mauvaises surprises.</p>

            <div className="premium-health">
              <span className={`health-pill ${healthClass}`}>{healthLabel}</span>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database size={14} /> Supabase creds: {health?.hasSupabaseCreds ? 'oui' : 'non'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Gauge size={14} /> Latence: {health?.latencyMs != null ? `${health.latencyMs} ms` : 'n/a'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wifi size={14} /> Partages offline en attente: {health?.pendingOfflineShares ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Cadre de confiance (pilote)
        </h2>
        <ul>
          <li>Traçabilité D0 à D3 (déclaré, recoupé, documenté, validation tierce).</li>
          <li>Aucune promesse de certification automatique.</li>
          <li>Données sensibles non exposées publiquement.</li>
        </ul>
        <div style={{ marginTop: 10 }}>
          <Link to="/legal" className="btn btn-outline"><FileText size={16} /> Mentions légales & RGPD</Link>
        </div>
      </section>

      <section className="premium-cards">
        <div className="premium-card"><h4><Tractor size={16} /> Producteurs</h4><p>Publiez un lot en moins de 5 min.</p></div>
        <div className="premium-card"><h4><Fish size={16} /> Pêcheurs</h4><p>Lots + QR origine + partage direct.</p></div>
        <div className="premium-card"><h4><ShoppingCart size={16} /> Acheteurs</h4><p>Accès rapide aux volumes disponibles.</p></div>
        <div className="premium-card"><h4><Truck size={16} /> Transporteurs</h4><p>Missions de collecte en un clic.</p></div>
        <div className="premium-card"><h4><Building2 size={16} /> Institutions</h4><p>Suivi filière avec indicateurs terrain.</p></div>
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

      <section className="section-block" style={{ marginBottom: 16 }}>
        <h2>Accès rapide</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/lot/lot1" className="btn btn-outline">Page lot</Link>
          <Link to="/marketplace" className="btn btn-outline">Catalogue</Link>
          <Link to="/sell-now" className="btn btn-primary">Publier maintenant</Link>
          <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
        </div>
      </section>
    </div>
  )
}

export default LandingOfficiellePage

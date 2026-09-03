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
  BookOpen,
  QrCode,
  Globe,
  MapPin,
  Sprout,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'
import { checkBackendHealth, type BackendHealth } from '../services/backendHealth'
import { MARTINIQUE_COMMUNES, AGRICULTURE_CULTURES, LOGISTICS_SERVICES } from '../services/dataService'
import '../styles/landing-premium.css'

const FAQ = [
  {
    q: 'Qu’est-ce que KopéAgri exactement ?',
    a: 'Une plateforme GIE agricole et pêche pour la Martinique et les Caraïbes. Les producteurs publient leurs lots, les acheteurs commandent en direct, la traçabilité est prouvée par QR.',
  },
  {
    q: 'Ça marche-t-il avec une connexion faible ?',
    a: 'Oui. Conçu pour le terrain: tes données restent sur ton téléphone et se synchronisent dès que le réseau revient.',
  },
  {
    q: 'Comment je suis payé ?',
    a: 'Tes commandes et paiements sont enregistrés dans la facturation intégrée, avec historique complet et exportable.',
  },
  {
    q: 'Et l’export vers l’international ?',
    a: 'La marketplace a deux canaux: circuit court local (Martinique/Caraïbes) et export international avec groupage, documentation et transit.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'SIRET, RIB et téléphone ne s’affichent jamais publiquement. Détails sur la page Mentions légales & RGPD.',
  },
]

const LandingOfficiellePage: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
      {/* ===== HERO ===== */}
      <section className="premium-hero">
        <svg className="hero-pattern" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.14)" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dots)" />
        </svg>

        <div className="premium-grid">
          <div>
            <span className="premium-badge">🌱 Pilote Martinique — version terrain</span>
            <h1 className="premium-title">Vends ton lot aujourd’hui.<br />Encaisse plus vite.</h1>
            <p className="premium-sub">
              La plateforme agricole et pêche de la Martinique: publier, partager sur WhatsApp,
              trouver un acheteur, organiser la collecte et prouver l’origine avec un QR.
            </p>

            <div className="premium-cta">
              <Link to="/sell-now" className="btn btn-primary">Publier mon lot <ArrowRight size={15} /></Link>
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
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Lien WhatsApp prêt à envoyer en 1 clic</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> QR de traçabilité D0 à D3 partageable</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Commandes, facturation et suivi au même endroit</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Marché local <strong>et</strong> export international</p>
          </div>
        </div>
      </section>

      {/* ===== CHIFFRES RÉELS ===== */}
      <section className="lp-stats">
        <div className="lp-stat"><span className="lp-stat-num">{MARTINIQUE_COMMUNES.length}</span><span className="lp-stat-label"><MapPin size={13} /> communes couvertes</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{AGRICULTURE_CULTURES.length}</span><span className="lp-stat-label"><Sprout size={13} /> cultures référencées</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{LOGISTICS_SERVICES.length}</span><span className="lp-stat-label"><Truck size={13} /> services logistiques</span></div>
        <div className="lp-stat"><span className="lp-stat-num">2</span><span className="lp-stat-label"><Globe size={13} /> canaux: local + export</span></div>
        <div className="lp-stat"><span className="lp-stat-num">5</span><span className="lp-stat-label"><QrCode size={13} /> profils métiers</span></div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Comment ça marche</h2>
        <p className="lp-section-sub">4 étapes, aucune compétence technique requise.</p>
        <div className="lp-steps">
          <div className="lp-step"><span className="lp-step-num">1</span><h4>Publie</h4><p>Produit, quantité, prix, commune. Choisis ton canal: circuit court local ou export international.</p></div>
          <div className="lp-step"><span className="lp-step-num">2</span><h4>Partage</h4><p>Le lien WhatsApp et le QR du lot sont générés automatiquement. Envoie-les en 1 clic.</p></div>
          <div className="lp-step"><span className="lp-step-num">3</span><h4>Vends</h4><p>L’acheteur commande depuis la marketplace. Tu suis la commande en temps réel.</p></div>
          <div className="lp-step"><span className="lp-step-num">4</span><h4>Encaisse</h4><p>Facts enregistrées, paiement suivi, historique exportable. Origine prouvée par QR.</p></div>
        </div>
        <div className="lp-guide-cta">
          <Link to="/guide" className="btn btn-outline"><BookOpen size={16} /> Mode d’emploi complet</Link>
        </div>
      </section>

      {/* ===== DEUX CANAUX ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Deux marchés, une plateforme</h2>
        <div className="lp-channels">
          <div className="lp-channel lp-channel-local">
            <h3><MapPin size={18} /> Circuit court — Martinique & Caraïbes</h3>
            <p>Vente locale, délais courts, logistique de proximité. Anti-gaspillage intégré: les invendus partent à prix réduit avant expiration.</p>
            <Link to="/marketplace" className="btn btn-sm btn-outline">Voir le marché local</Link>
          </div>
          <div className="lp-channel lp-channel-export">
            <h3><Globe size={18} /> Export — flux long international</h3>
            <p>Groupage, conformité documentaire, transit portuaire et délais maritimes. Vends au-delà des Caraïbes.</p>
            <Link to="/marketplace" className="btn btn-sm btn-outline">Voir l’export</Link>
          </div>
        </div>
      </section>

      {/* ===== PROFILS ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Une plateforme, 5 profils</h2>
        <p className="lp-section-sub">Chaque métier a son parcours dédié.</p>
        <div className="premium-cards">
          <div className="premium-card"><h4><Tractor size={16} /> Producteur</h4><p>Je publie mes récoltes, je fixe mon prix, je vends plus vite.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Vendre maintenant</Link></div>
          <div className="premium-card"><h4><Fish size={16} /> Pêcheur</h4><p>Je publie mes espèces du jour et je partage en un clic.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Publier ma pêche</Link></div>
          <div className="premium-card"><h4><ShoppingCart size={16} /> Acheteur B2B</h4><p>Hôtels, restaurants, grossistes: j’achète en direct au juste prix.</p><Link to="/marketplace" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les lots</Link></div>
          <div className="premium-card"><h4><Truck size={16} /> Transporteur</h4><p>Je récupère des missions de collecte et livraison rémunérées.</p><Link to="/logistics" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les missions</Link></div>
          <div className="premium-card"><h4><Building2 size={16} /> Institution</h4><p>Je pilote les flux de la filière avec des indicateurs clairs.</p><Link to="/dashboard" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir le dashboard</Link></div>
        </div>
      </section>

      {/* ===== CONFIANCE ===== */}
      <section className="trust-strip">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Confiance & cadre
        </h2>
        <ul>
          <li>Traçabilité D0 à D3: déclarée, recoupée, documentée, validée par un tiers.</li>
          <li>Aucune promesse de certification automatique — la confiance se prouve.</li>
          <li>Données sensibles (SIRET, RIB, téléphone) jamais affichées publiquement.</li>
          <li>Mode faible connexion: tes données restent sur ton téléphone.</li>
        </ul>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/legal" className="btn btn-outline"><FileText size={16} /> Mentions légales & RGPD</Link>
          <Link to="/guide" className="btn btn-outline"><BookOpen size={16} /> Mode d’emploi</Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Questions fréquentes</h2>
        <div className="guide-faq">
          {FAQ.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openFaq === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="lp-final-cta">
        <h2>Prêt à vendre ton premier lot ?</h2>
        <p>Publication en 5 minutes. Démo libre, sans inscription.</p>
        <div className="premium-cta" style={{ justifyContent: 'center' }}>
          <Link to="/sell-now" className="btn btn-primary">Publier mon lot <ArrowRight size={15} /></Link>
          <Link to="/demo" className="btn btn-outline">Voir la démo</Link>
          <a href="https://wa.me/596696653589?text=Bonjour%2C%20je%20veux%20lancer%20Kop%C3%A9Agri%20avec%20vous" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Parler à l’équipe
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <span>KopéAgri Caraïbes — Plateforme GIE agricole & pêche, Martinique</span>
        <span>
          <Link to="/guide">Mode d’emploi</Link> · <Link to="/legal">Mentions légales</Link> · <Link to="/pricing">Tarifs</Link>
        </span>
      </footer>
    </div>
  )
}

export default LandingOfficiellePage

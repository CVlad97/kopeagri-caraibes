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
    a: 'Un projet de plateforme coopérative / GIE agricole et pêche pour la Martinique et les Caraïbes. Le but est de mutualiser les parcelles, ressources, lots, transport, froid, acheteurs et preuves de traçabilité. La forme juridique et les agréments restent à valider avant tout lancement officiel.',
  },
  {
    q: 'Ça marche-t-il avec une connexion faible ?',
    a: 'L’objectif est un usage terrain mobile-first : brouillons locaux, WhatsApp, QR code, synchronisation progressive et écrans simples. Le mode hors ligne complet dépendra de la configuration backend finale.',
  },
  {
    q: 'Comment les producteurs sont-ils payés ?',
    a: 'Le paiement en ligne, les commissions, la facturation et les reversements sont prévus dans la roadmap. Aucun paiement réel ne doit être présenté comme activé tant que les contrats, KYC, assurances, CGV et comptes de paiement ne sont pas validés.',
  },
  {
    q: 'Et l’export vers l’international ?',
    a: 'La plateforme prévoit deux canaux : circuit court local / Caraïbes et export avec groupage, documentation, froid, conditionnement et transit. Les envois de végétaux frais restent soumis aux règles sanitaires et phytosanitaires applicables selon les produits et destinations.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Les données sensibles comme RIB, téléphone privé, adresse exacte ou documents justificatifs ne doivent pas être affichées publiquement. Le backend devra appliquer rôles, RLS Supabase, journalisation et droits RGPD.',
  },
]

const PHOTO_CARDS = [
  {
    title: 'Production locale',
    caption: 'Banane, canne, cultures tropicales et parcelles : l’identité visuelle doit parler aux producteurs martiniquais.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sugar%20cane%20banana%20martinique.JPG?width=1200',
    credit: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Sugar_cane_banana_martinique.JPG',
  },
  {
    title: 'Marchés & acheteurs',
    caption: 'Relier producteurs, pêcheurs, restaurateurs, familles, hôtels, collectivités et distributeurs locaux.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20March%C3%A9%20de%20Fort-de-France%20%28Martinique%29%20-%2001.jpg?width=1200',
    credit: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Grand_March%C3%A9_de_Fort-de-France_(Martinique)_-_01.jpg',
  },
  {
    title: 'Volumes mutualisés',
    caption: 'Regrouper les volumes, organiser le froid, le stockage, le transport et la traçabilité pour vendre mieux.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Le-vauclin-fruits-and-vegetables-market.jpg?width=1200',
    credit: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Le-vauclin-fruits-and-vegetables-market.jpg',
  },
]

const COMPLIANCE_ITEMS = [
  {
    title: 'Statut GIE / coopérative à choisir',
    body: 'Le GIE permet de mutualiser des moyens entre membres indépendants. Une société coopérative agricole relève d’un autre cadre : gouvernance, contrôle, agrément et obligations à valider avant communication officielle.',
    source: 'Service-Public / HCCA',
    href: 'https://entreprendre.service-public.fr/vosdroits/F37404',
  },
  {
    title: 'Export végétal réglementé',
    body: 'Les flux de végétaux frais depuis la Martinique vers l’UE ou l’international doivent être vérifiés produit par produit : certificats, restrictions, exemptions, interdictions et exigences phytosanitaires.',
    source: 'DAAF Martinique',
    href: 'https://daaf.martinique.agriculture.gouv.fr/envoi-de-vegetaux-vers-la-france-et-l-ue-strictement-reglementee-a650.html',
  },
  {
    title: 'Paiements et données à sécuriser',
    body: 'Stripe, facturation, notifications, RLS Supabase, CGV, RGPD, assurance et KYC doivent être finalisés avant encaissement réel ou promesse de service commercial.',
    source: 'CNIL / obligations contractuelles',
    href: 'https://www.cnil.fr/',
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
    if (health.mode === 'connected') return 'Backend connecté'
    if (health.mode === 'degraded') return 'Backend à surveiller'
    return 'Mode démo local actif'
  }, [health])

  const trustClass = useMemo(() => {
    if (!health) return 'local'
    return health.mode
  }, [health])

  return (
    <div className="page landing-premium">
      {/* ===== HERO ===== */}
      <section className="premium-hero premium-hero-photo">
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
            <span className="premium-badge">🌱 Projet de GIE / coopérative agricole & pêche — Martinique</span>
            <h1 className="premium-title">Mutualiser les terres.<br />Vendre plus fort ensemble.</h1>
            <p className="premium-sub">
              KopéAgri aide producteurs, pêcheurs, transporteurs et acheteurs à partager les parcelles,
              louer les ressources, regrouper les volumes, organiser le froid et préparer les marchés local,
              caribéen et export.
            </p>

            <div className="premium-cta">
              <Link to="/sell-now" className="btn btn-primary">Publier un lot <ArrowRight size={15} /></Link>
              <Link to="/plots" className="btn btn-outline">Partager une parcelle</Link>
              <Link to="/resources" className="btn btn-outline">Louer une ressource</Link>
              <Link to="/demo" className="btn btn-outline">Voir la démo</Link>
              <a
                href="https://wa.me/596696653589?text=Bonjour%2C%20je%20veux%20rejoindre%20Kop%C3%A9Agri"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp direct
              </a>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={`health-pill ${trustClass}`}>{trustLabel}</span>
              <span className="pilot-pill">Version pilote : agréments à sécuriser</span>
            </div>
          </div>

          <div className="premium-glass">
            <h3>Ce que la plateforme doit résoudre</h3>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Parcelles partagées ou louées entre agriculteurs</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Matériel, froid, stockage, emballages et main-d’œuvre mutualisés</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Lots regroupés pour atteindre les volumes B2B/export</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> QR de traçabilité, commandes et facturation au même endroit</p>
            <p><CheckCircle2 size={14} style={{ marginRight: 6 }} /> Marché local, Caraïbes et export international</p>
          </div>
        </div>
      </section>

      {/* ===== CHIFFRES RÉELS / PARAMÈTRES APP ===== */}
      <section className="lp-stats">
        <div className="lp-stat"><span className="lp-stat-num">{MARTINIQUE_COMMUNES.length}</span><span className="lp-stat-label"><MapPin size={13} /> communes couvertes</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{AGRICULTURE_CULTURES.length}</span><span className="lp-stat-label"><Sprout size={13} /> productions référencées</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{LOGISTICS_SERVICES.length}</span><span className="lp-stat-label"><Truck size={13} /> services logistiques</span></div>
        <div className="lp-stat"><span className="lp-stat-num">2</span><span className="lp-stat-label"><Globe size={13} /> canaux: local + export</span></div>
        <div className="lp-stat"><span className="lp-stat-num">5</span><span className="lp-stat-label"><QrCode size={13} /> profils métiers</span></div>
      </section>

      {/* ===== PHOTOS TERRAIN ===== */}
      <section className="lp-section lp-photo-section">
        <h2 className="lp-h2">Photos terrain pour parler vrai</h2>
        <p className="lp-section-sub">Des visuels contextualisés Martinique / Caraïbes, avec crédits visibles.</p>
        <div className="lp-photo-grid">
          {PHOTO_CARDS.map((photo) => (
            <article className="lp-photo-card" key={photo.title}>
              <img src={photo.src} alt={photo.title} loading="lazy" />
              <div>
                <h3>{photo.title}</h3>
                <p>{photo.caption}</p>
                <a href={photo.source} target="_blank" rel="noopener noreferrer">Crédit : {photo.credit}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Comment ça marche</h2>
        <p className="lp-section-sub">4 étapes, aucune compétence technique requise.</p>
        <div className="lp-steps">
          <div className="lp-step"><span className="lp-step-num">1</span><h4>Déclare</h4><p>Parcelle, ressource, récolte ou besoin. Commune, quantité, disponibilité, prix ou conditions.</p></div>
          <div className="lp-step"><span className="lp-step-num">2</span><h4>Mutualise</h4><p>Terrain, matériel, froid, transport, main-d’œuvre, stockage ou emballage sont proposés à la communauté.</p></div>
          <div className="lp-step"><span className="lp-step-num">3</span><h4>Regroupe</h4><p>Les lots sont consolidés pour répondre à un acheteur local, un hôtel, une collectivité ou un exportateur.</p></div>
          <div className="lp-step"><span className="lp-step-num">4</span><h4>Trace & facture</h4><p>QR code, statut, commande, documents, paiement prévu et historique exportable.</p></div>
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
            <p>Groupage, conformité documentaire, transit portuaire, chaîne du froid et délais à confirmer selon destination.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link to="/marketplace" className="btn btn-sm btn-outline">Voir l’export</Link>
              <Link to="/export-pro" className="btn btn-sm btn-outline">Distributeurs métropole →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROFILS ===== */}
      <section className="lp-section">
        <h2 className="lp-h2">Une plateforme, 5 profils</h2>
        <p className="lp-section-sub">Chaque métier a son parcours dédié.</p>
        <div className="premium-cards">
          <div className="premium-card"><h4><Tractor size={16} /> Producteur</h4><p>Je publie mes récoltes, parcelles et ressources disponibles.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Vendre maintenant</Link></div>
          <div className="premium-card"><h4><Fish size={16} /> Pêcheur</h4><p>Je publie mes espèces du jour et je partage en un clic.</p><Link to="/sell-now" className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>Publier ma pêche</Link></div>
          <div className="premium-card"><h4><ShoppingCart size={16} /> Acheteur B2B</h4><p>Hôtels, restaurants, grossistes: j’achète en direct au juste prix.</p><Link to="/marketplace" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les lots</Link></div>
          <div className="premium-card"><h4><Truck size={16} /> Transporteur</h4><p>Je récupère des missions de collecte, froid, groupage et livraison.</p><Link to="/logistics" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir les missions</Link></div>
          <div className="premium-card"><h4><Building2 size={16} /> Institution</h4><p>Je pilote les besoins, appels d’offres, filières et indicateurs.</p><Link to="/dashboard" className="btn btn-sm btn-outline" style={{ marginTop: 10 }}>Voir le dashboard</Link></div>
        </div>
      </section>

      {/* ===== CONFORMITÉ ===== */}
      <section className="lp-section compliance-panel">
        <h2 className="lp-h2"><ShieldCheck size={20} /> Agrément & conformité à sécuriser</h2>
        <p className="lp-section-sub">La plateforme doit rester démonstrative tant que les validations juridiques, sanitaires, fiscales et contractuelles ne sont pas obtenues.</p>
        <div className="compliance-cards">
          {COMPLIANCE_ITEMS.map((item) => (
            <article className="compliance-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a href={item.href} target="_blank" rel="noopener noreferrer">Source : {item.source}</a>
            </article>
          ))}
        </div>
      </section>

      {/* ===== CONFIANCE ===== */}
      <section className="trust-strip">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Confiance & cadre
        </h2>
        <ul>
          <li>Traçabilité D0 à D3: déclarée, recoupée, documentée, validée par un tiers.</li>
          <li>Aucune promesse de certification, agrément ou immatriculation automatique — la confiance se prouve.</li>
          <li>Données sensibles (SIRET, RIB, téléphone privé, adresse exacte) jamais affichées publiquement.</li>
          <li>Mode faible connexion prévu: brouillons et données terrain gardés sur le téléphone avant synchronisation.</li>
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
        <h2>Prêt à construire le pilote ?</h2>
        <p>Démo libre, terrain, parcelles, lots, ressources, acheteurs et logistique.</p>
        <div className="premium-cta" style={{ justifyContent: 'center' }}>
          <Link to="/sell-now" className="btn btn-primary">Publier un lot <ArrowRight size={15} /></Link>
          <Link to="/plots" className="btn btn-outline">Mutualiser une parcelle</Link>
          <Link to="/demo" className="btn btn-outline">Voir la démo</Link>
          <a href="https://wa.me/596696653589?text=Bonjour%2C%20je%20veux%20lancer%20Kop%C3%A9Agri%20avec%20vous" className="btn btn-outline" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Parler à l’équipe
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <span>KopéAgri Caraïbes — projet GIE / coopérative agricole & pêche, Martinique</span>
        <span>
          <Link to="/guide">Mode d’emploi</Link> · <Link to="/export-pro">Export</Link> · <Link to="/legal">Mentions légales</Link> · <Link to="/pricing">Tarifs</Link>
        </span>
      </footer>
    </div>
  )
}

export default LandingOfficiellePage

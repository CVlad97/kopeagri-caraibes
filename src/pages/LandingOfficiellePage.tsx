import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle, Fish, Tractor, ShoppingCart, Truck, Building2, ShieldCheck,
  BookOpen, QrCode, Globe, MapPin, Sprout, ChevronDown, ArrowRight, Package,
} from 'lucide-react'
import { MARTINIQUE_COMMUNES, AGRICULTURE_CULTURES, LOGISTICS_SERVICES } from '../services/dataService'
import '../styles/landing-premium.css'

const DELIKREOL_URL = 'https://delikreol.com'
const demoTo = (path: string) => `/demo?next=${encodeURIComponent(path)}`

const FAQ = [
  {
    q: 'KopéAgri, c’est quoi ?',
    a: 'Un projet de mutualisation agricole, pêche et logistique. Il aide à rendre visibles les productions, regrouper les volumes, partager des ressources et trouver des débouchés.',
  },
  {
    q: 'Pourquoi le relier à DELIKREOL ?',
    a: 'KopéAgri organise l’amont : producteurs, pêcheurs, volumes, froid et transport. DELIKREOL organise l’aval : traiteurs, commandes, retrait et livraison. Les deux outils restent distincts mais complémentaires.',
  },
  {
    q: 'La plateforme est-elle déjà commercialisée ?',
    a: 'Non. Le site est présenté comme un pilote démonstrateur. Les paiements, contrats, assurances et validations réglementaires doivent être sécurisés avant un lancement commercial complet.',
  },
  {
    q: 'Que veut prouver le pilote Martinique ?',
    a: 'Qu’un petit groupe d’acteurs peut mieux partager ses disponibilités, regrouper des volumes, organiser la logistique et trouver des débouchés mesurables avant d’élargir le dispositif.',
  },
]

const PHOTO_CARDS = [
  {
    title: 'Production locale',
    caption: 'Mieux rendre visibles les productions et les disponibilités du territoire.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sugar%20cane%20banana%20martinique.JPG?width=1200',
    source: 'https://commons.wikimedia.org/wiki/File:Sugar_cane_banana_martinique.JPG',
  },
  {
    title: 'Marchés & acheteurs',
    caption: 'Relier plus simplement producteurs, pêcheurs, restaurateurs, hôtels, collectivités et distributeurs.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20March%C3%A9%20de%20Fort-de-France%20%28Martinique%29%20-%2001.jpg?width=1200',
    source: 'https://commons.wikimedia.org/wiki/File:Grand_March%C3%A9_de_Fort-de-France_(Martinique)_-_01.jpg',
  },
  {
    title: 'Volumes mutualisés',
    caption: 'Regrouper des lots pour rendre la logistique et les ventes plus simples.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Le-vauclin-fruits-and-vegetables-market.jpg?width=1200',
    source: 'https://commons.wikimedia.org/wiki/File:Le-vauclin-fruits-and-vegetables-market.jpg',
  },
]

const LandingOfficiellePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="page landing-premium">
      <header className="public-nav">
        <Link to="/" className="public-brand">KopéAgri <span>& Pêche Caraïbes</span></Link>
        <nav className="public-nav-links" aria-label="Navigation principale">
          <a href="#fonctionnement">Comment ça marche</a>
          <a href="#complementarite">Complémentarité</a>
          <a href="#demo">Démo</a>
          <Link to="/guide">Mode d’emploi</Link>
          <a href={DELIKREOL_URL} target="_blank" rel="noopener noreferrer">DELIKREOL ↗</a>
        </nav>
        <Link to="/demo" className="btn btn-primary btn-sm">Voir la démo</Link>
      </header>

      <section className="premium-hero premium-hero-photo">
        <div className="premium-grid">
          <div>
            <span className="premium-badge">🌱 Pilote Martinique — agriculture, pêche & logistique</span>
            <h1 className="premium-title">Du producteur au débouché,<br />plus simplement.</h1>
            <p className="premium-sub">
              KopéAgri aide producteurs, pêcheurs, transporteurs et acheteurs à mieux voir les disponibilités,
              regrouper des volumes et organiser les moyens utiles : parcelles, matériel, froid, stockage et transport.
            </p>
            <div className="premium-cta">
              <Link to="/demo" className="btn btn-primary">Démarrer la démo <ArrowRight size={16} /></Link>
              <a href="#fonctionnement" className="btn btn-outline">Comprendre en 2 minutes</a>
              <a
                href="https://wa.me/596696653589?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20Kop%C3%A9Agri"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <p className="hero-note">Version de démonstration : le pilote sert à tester le fonctionnement avant lancement commercial.</p>
          </div>

          <div className="premium-glass presentation-card">
            <span className="mini-kicker">En 30 secondes</span>
            <h3>Une seule chaîne à rendre plus fluide</h3>
            <div className="mini-flow">
              <span>👨‍🌾 Produire</span><b>→</b>
              <span>📦 Regrouper</span><b>→</b>
              <span>🚚 Acheminer</span><b>→</b>
              <span>🤝 Vendre</span>
            </div>
            <p><strong>KopéAgri</strong> organise l’amont et les moyens partagés.</p>
            <p><strong>DELIKREOL</strong> peut valoriser l’aval pour les offres de restauration et la livraison.</p>
          </div>
        </div>
      </section>

      <section className="lp-stats" aria-label="Périmètre du démonstrateur">
        <div className="lp-stat"><span className="lp-stat-num">{MARTINIQUE_COMMUNES.length}</span><span className="lp-stat-label"><MapPin size={13} /> communes</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{AGRICULTURE_CULTURES.length}</span><span className="lp-stat-label"><Sprout size={13} /> productions référencées</span></div>
        <div className="lp-stat"><span className="lp-stat-num">{LOGISTICS_SERVICES.length}</span><span className="lp-stat-label"><Truck size={13} /> services logistiques</span></div>
        <div className="lp-stat"><span className="lp-stat-num">2</span><span className="lp-stat-label"><Globe size={13} /> marchés : local + export</span></div>
      </section>

      <section className="lp-section demo-section" id="demo">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">Démonstration guidée</span>
            <h2 className="lp-h2">Cliquez, explorez, comprenez</h2>
            <p className="lp-section-sub">Chaque bouton active automatiquement le mode démo puis ouvre le module choisi.</p>
          </div>
          <Link to="/guide" className="btn btn-outline"><BookOpen size={16} /> Mode d’emploi</Link>
        </div>
        <div className="demo-grid">
          <Link to={demoTo('/dashboard')} className="demo-card">
            <Building2 size={24} /><h3>Vue d’ensemble</h3><p>Voir le tableau de bord et les principaux indicateurs.</p><span>Ouvrir →</span>
          </Link>
          <Link to={demoTo('/marketplace')} className="demo-card">
            <ShoppingCart size={24} /><h3>Marché & lots</h3><p>Voir comment les disponibilités et besoins peuvent être rapprochés.</p><span>Ouvrir →</span>
          </Link>
          <Link to={demoTo('/seafood')} className="demo-card">
            <Fish size={24} /><h3>Pêche</h3><p>Voir le volet pêche et la logique de commercialisation des espèces.</p><span>Ouvrir →</span>
          </Link>
          <Link to={demoTo('/qr-codes')} className="demo-card">
            <QrCode size={24} /><h3>Traçabilité</h3><p>Voir l’origine d’un lot et les informations utiles au suivi.</p><span>Ouvrir →</span>
          </Link>
        </div>
      </section>

      <section className="lp-section complement-section" id="complementarite">
        <span className="section-eyebrow">Deux outils complémentaires</span>
        <h2 className="lp-h2">KopéAgri organise l’amont. DELIKREOL valorise l’aval.</h2>
        <p className="lp-section-sub">Le but n’est pas de mélanger les activités, mais de créer un passage simple entre production, transformation et vente.</p>
        <div className="complement-flow">
          <div className="flow-node"><Tractor size={26} /><strong>Producteur / pêcheur</strong><span>Déclare une disponibilité</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-node flow-primary"><Package size={26} /><strong>KopéAgri</strong><span>Regroupe volumes & moyens</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-node"><Truck size={26} /><strong>Logistique / acheteur</strong><span>Collecte, froid, débouché</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-node flow-secondary"><ShoppingCart size={26} /><strong>DELIKREOL</strong><span>Commande, retrait, livraison</span></div>
        </div>
        <div className="complement-actions">
          <Link to="/demo" className="btn btn-primary">Voir KopéAgri en démo</Link>
          <a href={DELIKREOL_URL} className="btn btn-outline" target="_blank" rel="noopener noreferrer">Ouvrir DELIKREOL ↗</a>
        </div>
      </section>

      <section className="lp-section" id="fonctionnement">
        <span className="section-eyebrow">Fonctionnement simple</span>
        <h2 className="lp-h2">4 étapes pour tester le circuit</h2>
        <p className="lp-section-sub">Pas de jargon : on déclare, on regroupe, on organise, on vend.</p>
        <div className="lp-steps">
          <div className="lp-step"><span className="lp-step-num">1</span><h4>Déclarer</h4><p>Produit, pêche, parcelle ou besoin : quantité, commune et disponibilité.</p></div>
          <div className="lp-step"><span className="lp-step-num">2</span><h4>Regrouper</h4><p>Plusieurs disponibilités peuvent être réunies pour atteindre un volume intéressant.</p></div>
          <div className="lp-step"><span className="lp-step-num">3</span><h4>Organiser</h4><p>Transport, froid, stockage ou conditionnement sont associés au besoin réel.</p></div>
          <div className="lp-step"><span className="lp-step-num">4</span><h4>Vendre & suivre</h4><p>L’acheteur voit l’offre, la traçabilité est conservée et le résultat du pilote peut être mesuré.</p></div>
        </div>
      </section>

      <section className="lp-section lp-photo-section">
        <span className="section-eyebrow">Le terrain d’abord</span>
        <h2 className="lp-h2">Un projet pensé pour la Martinique</h2>
        <p className="lp-section-sub">Production, marchés et mutualisation : les fonctions partent de besoins concrets.</p>
        <div className="lp-photo-grid">
          {PHOTO_CARDS.map((photo) => (
            <article className="lp-photo-card" key={photo.title}>
              <img src={photo.src} alt={photo.title} loading="lazy" />
              <div><h3>{photo.title}</h3><p>{photo.caption}</p><a href={photo.source} target="_blank" rel="noopener noreferrer">Source photo ↗</a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section pilot-proof">
        <span className="section-eyebrow">Ce que le pilote doit prouver</span>
        <h2 className="lp-h2">Commencer petit, mesurer, puis élargir</h2>
        <div className="premium-cards">
          <div className="premium-card"><h4>🌱 Offre réelle</h4><p>Des produits et volumes réellement disponibles, sur un petit périmètre.</p></div>
          <div className="premium-card"><h4>🤝 Débouchés réels</h4><p>Des acheteurs ou transformateurs identifiés et un besoin mesurable.</p></div>
          <div className="premium-card"><h4>🚚 Logistique réaliste</h4><p>Un circuit de collecte, froid, transport ou retrait adapté au terrain.</p></div>
          <div className="premium-card"><h4>📊 Résultats mesurés</h4><p>Volumes vendus, commandes réussies, délais, pertes évitées et retour des partenaires.</p></div>
        </div>
      </section>

      <section className="trust-strip">
        <h2><ShieldCheck size={20} /> Un pilote, pas une promesse excessive</h2>
        <p>La forme juridique, les paiements, les contrats, l’assurance et les obligations sanitaires doivent être validés avant un lancement commercial complet. Le site sert aujourd’hui à démontrer et tester le parcours.</p>
      </section>

      <section className="lp-section">
        <h2 className="lp-h2">Questions fréquentes</h2>
        <div className="guide-faq">
          {FAQ.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}<ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
              </button>
              {openFaq === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="lp-final-cta">
        <h2>Voir le fonctionnement maintenant</h2>
        <p>La démo est libre et ne réalise aucun paiement réel.</p>
        <div className="premium-cta" style={{ justifyContent: 'center' }}>
          <Link to="/demo" className="btn btn-primary">Démarrer la démo <ArrowRight size={15} /></Link>
          <a href={DELIKREOL_URL} className="btn btn-outline" target="_blank" rel="noopener noreferrer">Voir DELIKREOL ↗</a>
          <a href="https://wa.me/596696653589?text=Bonjour%2C%20je%20souhaite%20parler%20du%20pilote%20Kop%C3%A9Agri" className="btn btn-outline" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Nous contacter</a>
        </div>
      </section>

      <footer className="lp-footer">
        <span>KopéAgri & Pêche Caraïbes — pilote de mutualisation, Martinique</span>
        <span><Link to="/guide">Mode d’emploi</Link> · <Link to="/legal">Mentions légales</Link> · <a href={DELIKREOL_URL} target="_blank" rel="noopener noreferrer">DELIKREOL ↗</a></span>
      </footer>
    </div>
  )
}

export default LandingOfficiellePage

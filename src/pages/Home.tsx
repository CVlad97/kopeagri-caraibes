import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, MessageCircle, ChevronDown, Shield, Truck, TrendingUp, Users, Leaf } from 'lucide-react'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'
import '../styles/home-enhancements.css'

const FAQ_ITEMS = [
  {
    q: 'KopéAgri, c’est quoi exactement ?',
    a: 'KopéAgri est un projet de plateforme coopérative agricole et pêche pour la Martinique et la Caraïbe : mise en relation entre producteurs, pêcheurs, transporteurs, acheteurs B2B, institutions et partenaires export. Le projet doit encore sécuriser sa forme juridique définitive et ses agréments avant toute promesse officielle.',
  },
  {
    q: 'Qui peut rejoindre la plateforme ?',
    a: 'Producteurs de banane, maraîchers, planteurs, pêcheurs, transporteurs frigorifiques, acheteurs B2B, hôtels, restaurants, distributeurs, transformateurs, institutions et porteurs de projets agricoles de la Caraïbe.',
  },
  {
    q: 'Commission : qui paie et comment ?',
    a: 'La commission doit rester transparente : affichage du prix producteur, du coût logistique, de la commission plateforme et du prix final acheteur. Les taux Grati, Standard, Premium et Plantasyon sont des hypothèses commerciales à valider avant lancement.',
  },
  {
    q: 'Comment fonctionne la gouvernance ?',
    a: 'Objectif : gouvernance démocratique et traçable. Si la structure devient une société coopérative agricole, les règles d’adhésion, de vote, de contrôle et d’agrément devront respecter le cadre du Haut Conseil de la Coopération Agricole. Si le choix reste un GIE, les membres conservent leur indépendance et mutualisent des moyens selon les statuts.',
  },
  {
    q: 'Le paiement en ligne est-il prévu ?',
    a: 'Oui. L’objectif est d’intégrer Stripe, virement, paiement local et facturation. En phase démo, aucun paiement réel ne doit être présenté comme activé tant que les contrats, KYC, assurances et CGV définitives ne sont pas validés.',
  },
  {
    q: 'Faut-il un ordinateur ?',
    a: 'Non. L’application est pensée mobile-first : inscription rapide, contact WhatsApp, catalogue de lots, demandes de transport, QR code de traçabilité et tableau de bord simple pour le terrain.',
  },
  {
    q: 'Est-ce seulement pour la Martinique ?',
    a: 'Le démarrage est martiniquais, avec extension progressive vers Guadeloupe, Guyane, Sainte-Lucie, Dominique, Saint-Martin et autres marchés caribéens selon les partenaires disponibles.',
  },
  {
    q: 'La pêche est-elle intégrée ?',
    a: 'Oui, un module pêche peut connecter pêcheurs, mareyeurs, restaurants et hôtels : produits frais, calendrier saisonnier, froid, criée digitale, disponibilité et livraison locale ou régionale.',
  },
]

const BENEFITS = [
  {
    icon: <Shield size={28} />,
    iconBg: 'var(--green-100)',
    iconColor: 'var(--green-700)',
    title: 'Débouchés plus sécurisés',
    desc: 'Regrouper les volumes, qualifier les lots et trouver des acheteurs fiables pour limiter les invendus et mieux planifier les récoltes.',
  },
  {
    icon: <Truck size={28} />,
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-600)',
    title: 'Transport & froid mutualisés',
    desc: 'Comparer les disponibilités de transport, organiser le groupage, préparer l’export et réduire les trajets à vide.',
  },
  {
    icon: <TrendingUp size={28} />,
    iconBg: 'var(--gold-100)',
    iconColor: '#c66200',
    title: 'Meilleur prix producteur',
    desc: 'Rendre visible le prix producteur, la qualité, la traçabilité, le coût logistique et la marge de service pour vendre plus clairement.',
  },
  {
    icon: <Users size={28} />,
    iconBg: '#F3E5F5',
    iconColor: 'var(--purple)',
    title: 'Ressources partagées',
    desc: 'Terrains, matériel, main-d’œuvre, stockage, emballages, facturation, calendrier cultural et appels d’offres accessibles au même endroit.',
  },
  {
    icon: <Leaf size={28} />,
    iconBg: '#E0F7FA',
    iconColor: '#006D77',
    title: 'Agriculture + pêche locale',
    desc: 'Une plateforme unique pour fruits, légumes pays, cacao, vanille, tubercules, poisson frais, restaurants, hôtels et acheteurs publics.',
  },
]

const PHOTO_CARDS = [
  {
    title: 'Production locale',
    caption: 'Banane, canne et cultures tropicales : base visuelle pour parler au marché martiniquais.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sugar%20cane%20banana%20martinique.JPG?width=1200',
    credit: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Sugar_cane_banana_martinique.JPG',
  },
  {
    title: 'Marchés & acheteurs',
    caption: 'Valoriser le lien direct producteurs, restaurateurs, distributeurs, marchés et familles.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20March%C3%A9%20de%20Fort-de-France%20%28Martinique%29%20-%2001.jpg?width=1200',
    credit: 'Wikimedia Commons CC0',
    source: 'https://commons.wikimedia.org/wiki/File:Grand_March%C3%A9_de_Fort-de-France_(Martinique)_-_01.jpg',
  },
  {
    title: 'Volumes mutualisés',
    caption: 'Regrouper fruits et légumes pour atteindre les volumes attendus par le local, le régional et l’export.',
    src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Le-vauclin-fruits-and-vegetables-market.jpg?width=1200',
    credit: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Le-vauclin-fruits-and-vegetables-market.jpg',
  },
]

const COMPLIANCE_ITEMS = [
  {
    title: 'Statut GIE à cadrer',
    body: 'Le GIE sert à mutualiser des moyens entre acteurs économiques qui conservent leur indépendance. Il doit être immatriculé et ses membres peuvent être responsables des dettes selon les statuts.',
    link: 'https://entreprendre.service-public.fr/vosdroits/F37404',
    linkLabel: 'Source Service-Public',
  },
  {
    title: 'Agrément coopératif',
    body: 'Si KopéAgri devient une société coopérative agricole, l’agrément, le contrôle et les règles de gouvernance relèvent du cadre HCCA.',
    link: 'https://www.hcca.coop/',
    linkLabel: 'Source HCCA',
  },
  {
    title: 'Export végétal Martinique',
    body: 'Les expéditions de végétaux frais depuis la Martinique vers l’UE sont strictement réglementées : certificats, exemptions ou interdictions selon les produits.',
    link: 'https://daaf.martinique.agriculture.gouv.fr/envoi-de-vegetaux-vers-la-france-et-l-ue-strictement-reglementee-a650.html',
    linkLabel: 'Source DAAF Martinique',
  },
]

const Home: React.FC = () => {
  const { user, useDemoMode } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [counts, setCounts] = useState({ producers: 0, logistics: 0, distributors: 0, communes: 0 })
  const legalHref = `${import.meta.env.BASE_URL}legal`

  useEffect(() => {
    const p = (getAll('producers') as Producer[]).filter(x => x.active).length
    const l = (getAll('logistics') as LogisticsProvider[]).filter(x => x.active).length
    const d = (getAll('distributors') as Distributor[]).filter(x => x.active).length
    const allP = getAll('producers') as Producer[]
    const uniqueCommunes = new Set(allP.map(x => x.commune)).size
    setCounts({ producers: p, logistics: l, distributors: d, communes: uniqueCommunes })
  }, [])

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)

  return (
    <div className="home-page">
      <section className="hero hero-with-photo">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">🌴 Projet de GIE / coopérative agricole & pêche — Caraïbes</span>
          <h1>KopéAgri Caraïbes</h1>
          <p className="hero-subtitle">
            Mutualiser terrains, matériel, transport, froid, production et acheteurs pour renforcer les volumes locaux, caribéens et export.
          </p>
          <div className="hero-stats">
            <span><strong>{counts.producers}</strong> producteurs</span>
            <span><strong>{counts.logistics}</strong> transporteurs</span>
            <span><strong>{counts.distributors}</strong> acheteurs</span>
            <span><strong>{counts.communes}</strong> communes</span>
          </div>
          <div className="hero-actions">
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
                Tableau de bord <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>
                  Rejoindre KopéAgri <ArrowRight size={20} />
                </button>
                <button className="btn btn-outline btn-lg" onClick={useDemoMode}>
                  Essayer la démo
                </button>
              </>
            )}
          </div>
          <a
            href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20je%20souhaite%20en%20savoir%20plus"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-whatsapp"
          >
            <MessageCircle size={20} /> Nous contacter sur WhatsApp
          </a>
        </div>
      </section>

      <section className="section section-photo-story">
        <div className="section-header">
          <h2>Photos terrain pour parler vrai 🌿</h2>
          <p className="section-sub">Une identité plus crédible : production locale, marchés, volumes mutualisés et export.</p>
        </div>
        <div className="photo-grid">
          {PHOTO_CARDS.map((photo) => (
            <article key={photo.title} className="photo-card">
              <img src={photo.src} alt={photo.title} loading="lazy" />
              <div className="photo-card-body">
                <span className="badge badge-green">{photo.title}</span>
                <p>{photo.caption}</p>
                <a href={photo.source} target="_blank" rel="noopener noreferrer">Crédit : {photo.credit}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Pourquoi adhérer ? 🌱</h2>
          <p className="section-sub">Des bénéfices concrets pour l’exploitant, le pêcheur, le logisticien et l’acheteur antillais.</p>
        </div>
        <div className="benefits-grid">
          {BENEFITS.map((b, i) => (
            <div key={i} className="benefit-card">
              <div className="benefit-icon" style={{ background: b.iconBg, color: b.iconColor }}>{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-header">
          <h2>Comment ça marche ?</h2>
          <p className="section-sub">3 étapes simples, adaptées au terrain et au téléphone.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-emoji">👨‍🌾</span>
            <span className="step-num">1</span>
            <h3>Inscrivez-vous</h3>
            <p>Identité, téléphone, commune, activité, production, matériel, parcelles ou besoins logistiques.</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">🔍</span>
            <span className="step-num">2</span>
            <h3>Trouvez des partenaires</h3>
            <p>Lots disponibles, terrains à mutualiser, matériel à louer, transport, froid, acheteurs et appels d’offres.</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">💬</span>
            <span className="step-num">3</span>
            <h3>Organisez l’opération</h3>
            <p>Contact WhatsApp, devis, commande, traçabilité QR code, facture et suivi de livraison.</p>
          </div>
        </div>
      </section>

      <section className="section compliance-section">
        <div className="section-header">
          <h2>Agrément & conformité à sécuriser 🛡️</h2>
          <p className="section-sub">Le site ne doit pas promettre un agrément déjà obtenu : il présente une plateforme en phase projet / démo.</p>
        </div>
        <div className="compliance-grid">
          {COMPLIANCE_ITEMS.map((item) => (
            <article key={item.title} className="compliance-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer">{item.linkLabel}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Questions fréquentes 💬</h2>
          <p className="section-sub">Les points à clarifier avant l’adhésion et le lancement commercial.</p>
        </div>
        <div className="faq-section">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(i)}>
                <span>{item.q}</span>
                <ChevronDown size={20} className="faq-arrow" />
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à coopérer ? 🌴</h2>
          <p>Rejoignez une plateforme pensée pour mieux vendre, mieux livrer et mieux organiser la production locale.</p>
          <div className="whatsapp-cta">
            <span className="whatsapp-icon">💬</span>
            <div>
              <strong>Parlez-nous sur WhatsApp</strong>
              <p>Réponse rapide, zéro complication</p>
            </div>
          </div>
          <a
            href="https://wa.me/596696000000?text=Bonjour%20KopéAgri"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            <MessageCircle size={20} /> Ouvrir WhatsApp
          </a>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 KopéAgri Caraïbes — plateforme agricole & pêche en phase projet</p>
        <p className="footer-small">Fait avec 🌴 en Martinique</p>
        <p className="footer-small" style={{ marginTop: 8 }}>
          <a href={legalHref} style={{ color: 'var(--green-500)', textDecoration: 'underline' }}>Mentions légales · CGV · RGPD</a>
        </p>
      </footer>
    </div>
  )
}

export default Home

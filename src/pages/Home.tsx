import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, MessageCircle, ChevronDown, Shield, Truck, TrendingUp, Users, Leaf } from 'lucide-react'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

const FAQ_ITEMS = [
  {
    q: 'KopéAgri, c\'est quoi exactement ?',
    a: 'KopéAgri est un projet de GIE / coopérative agricole & pêche en cours de création pour la Martinique et les Caraïbes. La plateforme mutualise terrains, matériel, transport, froid, production et acheteurs pour renforcer les volumes locaux et l’export. Actuellement en phase démonstration, elle est ouverte aux producteurs, pêcheurs, transporteurs et acheteurs.',
  },
  {
    q: 'Qui peut rejoindre la plateforme ?',
    a: 'Toute personne physique ou morale active en Martinique et dans les Caraïbes (et dans les autres départements d’ici) peut adhérer : agriculteurs, pêcheurs, maraîchers, éleveurs, transformeurs, transporteurs frigorifiques, acheteurs B2B, restaurateurs, hôteliers, distributeurs et institutions. Si vous produisez ou achetez dans la zone, vous êtes le bienvenu.',
  },
  {
    q: 'Commission : qui paie et comment ?',
    a: 'La commission est prévue sur les transactions réalisées via la plateforme : 6 % pour le plan Gratuit, 4 % pour le plan Standard, 3 % pour le plan Premium et 2 % pour le plan Plantation. Ce sont les acheteurs qui paient la commission, pas les producteurs. Les tarifs exacts seront communiqués dans les CGV validées avant lancement commercial.',
  },
  {
    q: 'Comment fonctionne la gouvernance ?',
    a: 'Le projet prévoit une gouvernance démocratique : 1 adhérent = 1 vote, assemblée générale annuelle, comptes rendus financiers transparents, administration bénévole. La forme juridique finale (GIE ou coopérative agricole) déterminera les modalités précises, à valider avec un expert-comptable et la Chambre d’Agriculture.',
  },
  {
    q: 'Le paiement en ligne est-il prévu ?',
    a: 'Oui, le paiement en ligne est prévu via Stripe (carte bancaire, mobile). Cependant, le paiement réel ne sera activé qu’après validation KYC, CGV signées, assurance et conformité. Pour l’instant, la plateforme est en phase démonstration. Vous pouvez également régler via WhatsApp en attendant.',
  },
  {
    q: 'Faut-il un ordinateur pour utiliser KopéAgri ?',
    a: 'Non. WhatsApp est le canal principal : toute l’équipe peut s’en servir quotidiennement depuis son téléphone. Vous n’avez pas besoin d’un ordinateur — tout peut se faire depuis votre smartphone. Le formulaire d’inscription est accessible en 2 minutes, même depuis un téléphone simple.',
  },
  {
    q: 'Est-ce que c’est seulement pour la Martinique ?',
    a: 'KopéAgri commence en Martinique, mais ouvre ensuite à toute la Caraïbe : Guadeloupe, Guyane française, Sainte-Lucie, Dominique et au-delà. Si vous avez un partenaire dans la région, on pourra vous intégrer rapidement.',
  },
  {
    q: 'La pêche est-elle intégrée ?',
    a: 'Oui ! KopéAgri accueille aussi les pêcheurs : thazard, dorade, lambi, oursin, langouste, crevette, vivaneau. Vous avez un calendrier saisonnier, un accès à la criée digitale, le transport frigorifique et l’export Caraïbes. Rendez-vous sur la page « Marché de la pêche » pour en savoir plus.',
  },
]

const BENEFITS = [
  {
    icon: <Shield size={28} />,
    iconBg: 'var(--green-100)',
    iconColor: 'var(--green-700)',
    title: 'Sécurisation des débouchés',
    desc: 'Trouvez des acheteurs fiables pour votre production. Fini les invendus et les pertes de récolte — KopéAgri connecte votre champ aux marchés.',
  },
  {
    icon: <Truck size={28} />,
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-600)',
    title: 'Accès au transport frigorifique',
    desc: 'Transport tropical express, froid, groupage — trouvez le bon logisticien en 2 clics. Vos bananes, mangues et avocats arrivent frais.',
  },
  {
    icon: <TrendingUp size={28} />,
    iconBg: 'var(--gold-100)',
    iconColor: '#c66200',
    title: 'Valorisation de la production locale',
    desc: 'Fruits tropicaux, légumes pays, canne, cacao, vanille — la Caraïbe a du goût. KopéAgri le fait savoir et vous en tirez le meilleur prix.',
  },
  {
    icon: <Users size={28} />,
    iconBg: '#F3E5F5',
    iconColor: 'var(--purple)',
    title: 'Outils partagés entre paysans',
    desc: 'Facturation, estimation rapide, géolocalisation des parcelles, calendrier saisonnier — des outils pensés pour le terrain, pas le bureau.',
  },
  {
    icon: <Leaf size={28} />,
    iconBg: '#E0F7FA',
    iconColor: '#006D77',
    title: 'Marché de la pêche intégré',
    desc: 'Thazard, dorade, lambi, oursin — du bateau à l\'assiette en 24h. Calendrier saisonnier, criée digitale, export Caraïbes.',
  },
]

const Home: React.FC = () => {
  const { user, useDemoMode, demoEnabled } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [counts, setCounts] = useState({ producers: 0, logistics: 0, distributors: 0, communes: 0 })

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
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">Projet de GIE / coopérative agricole & pêche — Caraïbes</span>
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
                {demoEnabled && (
                  <button className="btn btn-outline btn-lg" onClick={useDemoMode}>
                    Essayer la démo
                  </button>
                )}
              </>
            )}
          </div>
          {/* TODO: remplacer par le vrai numéro WhatsApp professionnel */}
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
  {/* Photos terrain pour parler vrai 🌿 */}
      <section className="section photos-terrain">
        <div className="section-header">
          <h2>Photos terrain pour parler vrai 🌿</h2>
          <p className="section-sub">Production locale, marchés et volumes mutualisés de Martinique et des Caraïbes</p>
        </div>
        <div className="photos-grid">
          {/* Production locale */}
          <div className="photo-card">
            <img 
              src="https://images.unsplash.com/photo-1523741543627-0c77d5c9dd08?auto=format&fit=crop&w=800&q=60" 
              alt="Production locale de bananes, canne à sucre et cultures tropicales en Martinique" 
              loading="lazy"
            />
            <div className="photo-credit">
              Photo de <a href="https://unsplash.com/@theblm">Bénedicte Morisse</a>, Unsplash — Licence libre d'utilisation
            </div>
            <div className="photo-caption">Production locale : banane, canne à sucre, ananas, légumes tropicaux — la richesse agricole de la Martinique.</div>
          </div>

          {/* Marchés et acheteurs */}
          <div className="photo-card">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d893f3322b?auto=format&fit=crop&w=800&q=60" 
              alt="Marché aux producteurs de Martinique avec acheteurs locaux et produits frais" 
              loading="lazy"
            />
            <div className="photo-credit">
              Photo de <a href="https://unsplash.com/@sorren">Sorren </a>, Unsplash — Licence libre d'utilisation
            </div>
            <div className="photo-caption">Marchés et acheteurs : producteurs, hôtellerie, collectivités et distributeurs s'approvisionnent en produits locaux.</div>
          </div>

          {/* Volumes mutualisés */}
          <div className="photo-card">
            <img 
              src="https://images.unsplash.com/photo-1498579309177-1a3608e75353?auto=format&fit=crop&w=800&q=60" 
              alt="Groupage de produits agricoles martiniquais pour l'export Caraïbes" 
              loading="lazy"
            />
            <div className="photo-credit">
              Photo de <a href="https://unsplash.com/@designecologist">Designecologist</a>, Unsplash — Licence libre d'utilisation
            </div>
            <div className="photo-caption">Groupage et export : des volumes mutualisés pour atteindre les marchés des Caraïbes.</div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section">
        <div className="section-header">
          <h2>Poukiwi adhère ? 🌱</h2>
          <p className="section-sub">Des bénéfices concrets pour l'exploitant antillais</p>
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

      {/* HOW IT WORKS */}
      <section className="section section-alt">
        <div className="section-header">
          <h2>Comment ça marche ?</h2>
          <p className="section-sub">3 étapes simples, même en bare-foot dan jaden a</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-emoji">👨‍🌾</span>
            <span className="step-num">1</span>
            <h3>Inscrivez-vous</h3>
            <p>Nom, prénom, téléphone, commune — 2 minit osinonpé. Photo si ou vlé.</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">🔍</span>
            <span className="step-num">2</span>
            <h3>Trouvez des partenaires</h3>
            <p>Producteurs de banane, transporteurs frigorifiques, acheteurs — tout dan zon a ou</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">💬</span>
            <span className="step-num">3</span>
            <h3>Contactez par WhatsApp</h3>
            <p>Échangez directement, commandez mangues, avocats, légumes pays, organisez transport</p>
          </div>
        </div>
      </section>

      {/* FAQ — Prompt 2 */}
      <section className="section">
        <div className="section-header">
          <h2>Question yo posé souvan 💬</h2>
          <p className="section-sub">Tout sa ou bizwen savé avan ou adhère</p>
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
                                <a
                                  href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20je%20souhaite%20en%20savoir%20plus"
                                  target="_blank"
                                  className="whatsapp-cta"
                                >
                                  <MessageCircle size={20} />
                                  <span>Ouvrir WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Agrément & conformité à sécuriser 🛡️ */}
                      <section className="section conformite-section">
                          <div className="section-header">
                            <h2>Agrément & conformité à sécuriser 🛡️</h2>
                            <p className="section-sub">Le projet est en phase démonstration. Ces informations sont à valider avant tout lancement commercial.</p>
                        </div>
        <div className="conformite-grid">
          <div className="carte">
            <h3>Carte 1 — Statut GIE à cadrer</h3>
            <p>Le GIE (Groupement d'Intérêt Économique) mutualise des moyens entre membres indépendants et doit être immatriculé au Registre du Commerce et des Sociétés. Le projet KopéAgri est actuellement une plateforme en phase démonstration.</p>
            <a href="https://entreprendre.service-public.fr/vosdroits/F37404" target="_blank" rel="noopener noreferrer" className="source-link">
              Source : Service-Public.fr — GIE
            </a>
          </div>
          <div className="carte">
            <h3>Carte 2 — Agrément coopératif</h3>
            <p>Si KopéAgri devient une société coopérative agricole, l'agrément et le contrôle relèvent du cadre de l'HCCA (Haut Comité de la Coopération Agricole). La coopération agricole suit des procédures spécifiques d'agrément et de contrôle.</p>
            <a href="https://www.hcca.coop/" target="_blank" rel="noopener noreferrer" className="source-link">
              Source : HCCA — Coopération agricole
            </a>
          </div>
          <div className="carte">
            <h3>Carte 3 — Export végétal Martinique</h3>
            <p>Les expéditions de végétaux frais depuis la Martinique vers la France et l'UE sont réglementées selon les produits, certificats, exemptions ou interdictions. Se référer aux réglementations du DAAF Martinique pour chaque type de produit.</p>
            <a href="https://daaf.martinique.agriculture.gouv.fr/envoi-de-vegetaux-vers-la-france-et-l-ue-strictement-reglementee-a650.html" target="_blank" rel="noopener noreferrer" className="source-link">
              Source : DAAF Martinique — Export végétaux
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à kopérer ? 🌴</h2>
          <p>Ansanm nou ka fè péyi a viv — Rejoignez la communauté agricole de Martinique</p>
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
        <p>© 2026 KopéAgri Caraïbes — GIE agricole & pêche digitale</p>
        <p className="footer-small">Fait avec 🌴 en Martinique</p>
        <p className="footer-small" style={{ marginTop: 8 }}>
          <a href="/legal" style={{ color: 'var(--green-500)', textDecoration: 'underline' }}>Mentions légales · CGV · RGPD</a>
        </p>
      </footer>
    </div>
  )
}

export default Home

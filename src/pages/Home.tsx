import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, MessageCircle, ChevronDown, Shield, Truck, TrendingUp, Users, Leaf } from 'lucide-react'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

const FAQ_ITEMS = [
  {
    q: 'KopéAgri, c\'est quoi exact ?',
    a: 'Sé on coopérative agricole digitale pour tout péyi Karayib la. Nou mété aksé producté, transpòrtè é achté pou fasilite komèrs la. Nou ka apòté débouté, zouti partager é valòrizasyon prodiksyon lokal.',
  },
  {
    q: 'Ki moun ki ka adhère ?',
    a: 'Tout moun ka travay dan péyi a : producté banann, manmgo, canne, légim, transpòrtè frigorifik, achté B2B, lotèl, restoran, enstitisyon. Pa pé — si ou ka prodwi osinon ka achité dan Karayib, ou lafè aks.',
  },
  {
    q: 'Komisyon, sé kiès ki péyé ?',
    a: 'Komisyon sé an poutras koté sou tranzaksyon : 6% plan Grati, 4% Standard, 3% Premium, 2% Plantasyon. Sé achté ki péyé, osinon copé ant producté é platfòm. Producté toujou ka gadé majorité pri a.',
  },
  {
    q: 'Kouman governans la maché ?',
    a: 'Gouvernans démokratik : 1 adhérent = 1 vwa. Assemblée jénéral tou lané, konpté rend finansyé transparent, bisò administrasyon élI. Tout définon lé pran a tout moun.',
  },
  {
    q: 'Eske mwen péyé an liy ?',
    a: 'Wi ! Nou ka aksepté Vibman, chèk, èspes é pèman an liy via Stripe (CB, Mobil). Tout an ka fè fasè. Ou pé osinon alé WhatsApp pou réglé.',
  },
  {
    q: 'Mwen pé itilizé WhatsApp osinon mwen bizwen an ordi ?',
    a: 'WhatsApp sé prensipal ! Nou konfé tout Karayib-la ka sèvi WhatsApp chak jou. Pa bizwen an PC — tout ka fè osinonpé dé tout sou télefon. Fòmèl enskripsyon sé 2 minit osinonpé.',
  },
  {
    q: 'Eske sé sèlman Matinik ?',
    a: 'KopéAgri ka koumansé Matinik, mé nou vlé louvri tou Karayib : Gwadloup, Guyann, Sent-Lisi, Dominik. Si ou ka chaché partné dan réjyon la, nou ké mété ou an kontak.',
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
]

const Home: React.FC = () => {
  const { user, useDemoMode } = useAuth()
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
          <span className="hero-badge">🌴 Coopérative agricole digitale — Caraïbes</span>
          <h1>KopéAgri Caraïbes</h1>
          <p className="hero-subtitle">
            Ansanm nou ka fè péyi a viv — Connectez producteurs, transporteurs et acheteurs de Martinique et des Caraïbes
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

      {/* BENEFITS — Prompt 2 */}
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
              </div>
            </div>
          ))}
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
        <p>© 2026 KopéAgri Caraïbes — Coopérative agricole digitale</p>
        <p className="footer-small">Fait avec 🌴 en Martinique</p>
        <p className="footer-small" style={{ marginTop: 8 }}>
          <a href="/legal" style={{ color: 'var(--green-500)', textDecoration: 'underline' }}>Mentions légales · CGV · RGPD</a>
        </p>
      </footer>
    </div>
  )
}

export default Home

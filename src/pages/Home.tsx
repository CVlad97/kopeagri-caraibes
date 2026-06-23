import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Map, Package, Truck, BarChart3, QrCode, Globe, ChevronRight } from 'lucide-react'

const Home: React.FC = () => {
  const { user, useDemoMode } = useAuth()
  const navigate = useNavigate()

  const handleDemo = () => {
    useDemoMode()
    navigate('/dashboard')
  }

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">🌱 Coopérative agricole digitale</div>
          <h1>KopéAgri <span className="text-gold">Caraïbes</span></h1>
          <p className="hero-subtitle">Mutualisons terres, productions et ressources<br />pour nourrir la Martinique et les Caraïbes</p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Rejoindre <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Connexion
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Tableau de bord <ChevronRight size={20} />
              </Link>
            )}
            <button onClick={handleDemo} className="btn btn-demo btn-lg">
              🧪 Essai démo
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stat"><span className="stat-num">45+</span><span className="stat-label">Producteurs</span></div>
        <div className="stat"><span className="stat-num">120ha</span><span className="stat-label">Terres mutualisées</span></div>
        <div className="stat"><span className="stat-num">15</span><span className="stat-label">Communes</span></div>
        <div className="stat"><span className="stat-num">200T</span><span className="stat-label">Volume/an</span></div>
      </section>

      {/* Vision */}
      <section className="section">
        <div className="section-header">
          <h2>Notre vision</h2>
          <p className="section-sub">Transformer des petits lots agricoles dispersés en volumes fiables, traçables et vendables sur le marché local, caribéen et international.</p>
        </div>
        <div className="vision-cards">
          {[
            { icon: Map, title: 'Mutualisation des terres', desc: 'Propriétaires et producteurs connectés pour une exploitation optimale des parcelles disponibles.' },
            { icon: Package, title: 'Consolidation des volumes', desc: 'Regroupez plusieurs producteurs sur une même commande pour atteindre des volumes exportables.' },
            { icon: Truck, title: 'Logistique mutualisée', desc: 'Collecte, chambre froide, transport — optimisez vos tournées et réduisez les coûts.' },
            { icon: QrCode, title: 'Traçabilité totale', desc: 'QR code par lot : origine, producteur, qualité, certifications — transparence garantie.' },
            { icon: BarChart3, title: 'Dashboard intelligent', desc: 'Pilotage en temps réel : production, ventes, stocks, litiges, commissions.' },
            { icon: Globe, title: 'Export facilité', desc: 'Documents, groupage, logistique portuaire — ouvrez les marchés caribéens et internationaux.' },
          ].map((item, i) => (
            <div key={i} className="vision-card">
              <div className="vision-icon"><item.icon size={32} /></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rôles */}
      <section className="section section-alt">
        <h2>Pour qui ?</h2>
        <div className="roles-grid">
          {[
            { emoji: '👨‍🌾', title: 'Producteur', desc: 'Vendez vos lots, accédez aux ressources, consolidez vos volumes.' },
            { emoji: '🏠', title: 'Propriétaire', desc: 'Mettez vos terres à disposition et générez des revenus.' },
            { emoji: '🤝', title: 'Coopérative', desc: 'Administrez, validez, pilotez et gérez les commissions.' },
            { emoji: '🏪', title: 'Acheteur B2B', desc: 'Commandez des lots tracés, qualité garantie, livraison fiable.' },
            { emoji: '🚛', title: 'Transporteur', desc: 'Proposez vos services de collecte et de livraison.' },
            { emoji: '🏛️', title: 'Institution', desc: 'Financez, conseillez et suivez l\'impact territorial.' },
          ].map((role, i) => (
            <div key={i} className="role-card">
              <span className="role-emoji">{role.emoji}</span>
              <h4>{role.title}</h4>
              <p>{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-content">
          <h2>Prêt à rejoindre la coopérative ?</h2>
          <p>Créez votre compte gratuitement et commencez à mutualiser.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Créer un compte <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 KopéAgri Caraïbes — Plateforme coopérative agricole digitale</p>
        <p className="footer-small">Martinique · Caraïbes · Export</p>
      </footer>
    </div>
  )
}

export default Home
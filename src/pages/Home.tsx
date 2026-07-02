import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { getAll } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

const Home: React.FC = () => {
  const { user, useDemoMode } = useAuth()
  const navigate = useNavigate()

  const [counts, setCounts] = useState({ producers: 0, logistics: 0, distributors: 0, communes: 0 })

  useEffect(() => {
    const p = (getAll('producers') as Producer[]).filter(x => x.active).length
    const l = (getAll('logistics') as LogisticsProvider[]).filter(x => x.active).length
    const d = (getAll('distributors') as Distributor[]).filter(x => x.active).length
    const allP = getAll('producers') as Producer[]
    const uniqueCommunes = new Set(allP.map(x => x.commune)).size
    setCounts({ producers: p, logistics: l, distributors: d, communes: uniqueCommunes })
  }, [])

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>🌴 KopéAgri Caraïbes</h1>
          <p className="hero-subtitle">
            La coopérative agricole digitale de Martinique — Connectez producteurs, transporteurs et acheteurs
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
                Tableau de bord <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>
                  Rejoindre KopéAgri <ArrowRight size={18} />
                </button>
                <button className="btn btn-secondary btn-lg" onClick={useDemoMode}>
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
            <MessageCircle size={18} /> Nous contacter sur WhatsApp
          </a>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Comment ça marche ?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-emoji">👨‍🌾</span>
            <span className="step-num">1</span>
            <h3>Inscrivez-vous</h3>
            <p>Photo, nom, téléphone — 2 minutes suffisent</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">🔍</span>
            <span className="step-num">2</span>
            <h3>Trouvez des partenaires</h3>
            <p>Producteurs, transporteurs, acheteurs près de chez vous</p>
          </div>
          <div className="step-card">
            <span className="step-emoji">💬</span>
            <span className="step-num">3</span>
            <h3>Contactez par WhatsApp</h3>
            <p>Échangez directement, commandez, organisez le transport</p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="cta-content">
          <h2>Prêt à kopérer ? 🌱</h2>
          <p>Rejoignez la communauté agricole de Martinique</p>
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
            <MessageCircle size={18} /> Ouvrir WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home

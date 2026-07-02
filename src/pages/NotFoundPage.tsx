import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFoundPage: React.FC = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1B5E20, #004d40)', textAlign: 'center', padding: 20
  }}>
    <div>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🌴</div>
      <h1 style={{ color: 'white', fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32 }}>
        Cette page s'est perdue dans les champs !
      </p>
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'white', color: '#1B5E20', padding: '12px 28px',
        borderRadius: 8, fontWeight: 700, textDecoration: 'none'
      }}>
        <Home size={18} /> Retour à l'accueil
      </Link>
    </div>
  </div>
)

export default NotFoundPage

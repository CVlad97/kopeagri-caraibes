import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await signIn(email, password)
    if (err) setError(err)
    else navigate('/dashboard')
    setLoading(false)
  }

  const demoAccounts = [
    { email: 'producteur@demo.fr', label: 'Producteur', color: 'badge-green' },
    { email: 'cooperative@demo.fr', label: 'Coopérative', color: 'badge-gold' },
    { email: 'acheteur@demo.fr', label: 'Acheteur B2B', color: 'badge-purple' },
    { email: 'transporteur@demo.fr', label: 'Transporteur', color: 'badge-orange' },
  ]

  const fillDemo = (e: string) => {
    setEmail(e)
    setPassword('demo1234')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><Leaf size={28} /> KopéAgri</Link>
          <h1>Connexion</h1>
          <p>Accédez à votre espace coopératif</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}
          <div className="form-group">
            <label><Mail size={16} /> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.fr" required className="form-input" />
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Mot de passe</label>
            <div className="input-group">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="form-input" />
              <button type="button" className="input-append" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">🧪 Comptes de démonstration</p>
          <div className="demo-list">
            {demoAccounts.map((acc, i) => (
              <button key={i} className="demo-btn" onClick={() => fillDemo(acc.email)}>
                <span className={`badge ${acc.color}`}>{acc.label}</span>
                <span className="demo-email">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="demo-hint">Mot de passe pour tous : <strong>demo1234</strong></p>
        </div>

        <p className="auth-footer-text">
          Pas encore inscrit ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
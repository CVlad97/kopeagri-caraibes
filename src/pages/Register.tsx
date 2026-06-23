import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, User, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react'

const COMMUNES = [
  'Fort-de-France', 'Le Lamentin', 'Saint-Pierre', 'Le Morne-Rouge', 'Sainte-Marie',
  'Le Robert', 'Le François', 'Le Vauclin', 'Rivière-Pilote', 'Sainte-Luce',
  'Les Trois-Îlets', 'Diamant', 'Schœlcher', 'Case-Pilote', 'Bellefontaine',
  'Le Carbet', 'Fonds-Saint-Denis', 'Ajoupa-Bouillon', 'Basse-Pointe', 'Grand-Rivière',
  'Macouba', 'La Trinité', 'Gros-Morne', 'Saint-Joseph', 'Ducos',
]

const ROLES = [
  { value: 'producteur', label: '👨‍🌾 Producteur / Agriculteur' },
  { value: 'proprietaire', label: '🏠 Propriétaire de terrain' },
  { value: 'cooperative', label: '🤝 Coopérative' },
  { value: 'acheteur_b2b', label: '🏪 Acheteur B2B' },
  { value: 'transporteur', label: '🚛 Transporteur / Logisticien' },
  { value: 'institution', label: '🏛️ Institution / Financeur' },
]

const Register: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPw: '', fullName: '', role: '', commune: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPw) { setError('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return }
    setLoading(true)
    const err = await signUp(form.email, form.password, form.fullName, form.role, form.commune, form.phone)
    if (err) setError(err)
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><Leaf size={28} /> KopéAgri</Link>
          <h1>Créer un compte</h1>
          <p>Rejoignez la coopérative agricole digitale</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label><User size={16} /> Nom complet</label>
              <input type="text" value={form.fullName} onChange={handleChange('fullName')} placeholder="Jean Dupont" required className="form-input" />
            </div>
            <div className="form-group">
              <label><Phone size={16} /> Téléphone</label>
              <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="0696 XX XX XX" required className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label>👤 Votre rôle</label>
            <select value={form.role} onChange={handleChange('role')} required className="form-input">
              <option value="">Sélectionnez votre rôle</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label><MapPin size={16} /> Commune</label>
            <select value={form.commune} onChange={handleChange('commune')} required className="form-input">
              <option value="">Votre commune</option>
              {COMMUNES.sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label><Mail size={16} /> Email</label>
            <input type="email" value={form.email} onChange={handleChange('email')} placeholder="vous@email.fr" required className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Lock size={16} /> Mot de passe</label>
              <input type="password" value={form.password} onChange={handleChange('password')} placeholder="Min. 6 caractères" required className="form-input" />
            </div>
            <div className="form-group">
              <label><Lock size={16} /> Confirmation</label>
              <input type="password" value={form.confirmPw} onChange={handleChange('confirmPw')} placeholder="Répétez le mot de passe" required className="form-input" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer-text">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
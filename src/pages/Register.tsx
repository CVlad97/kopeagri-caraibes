import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, User, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight, ArrowLeft, Sprout, Truck, ShoppingBag, Building, CheckCircle } from 'lucide-react'

const COMMUNES = [
  'Fort-de-France', 'Le Lamentin', 'Saint-Pierre', 'Le Morne-Rouge', 'Sainte-Marie',
  'Le Robert', 'Le François', 'Le Vauclin', 'Rivière-Pilote', 'Sainte-Luce',
  'Les Trois-Îlets', 'Diamant', 'Schœlcher', 'Case-Pilote', 'Bellefontaine',
  'Le Carbet', 'Fonds-Saint-Denis', 'Ajoupa-Bouillon', 'Basse-Pointe', 'Grand-Rivière',
  'Macouba', 'La Trinité', 'Gros-Morne', 'Saint-Joseph', 'Ducos',
  'Marigot', 'Le Marin', 'Saint-Esprit', 'Le Prêcheur', 'Anse-Bertrand',
].sort()

const PRODUCTIONS = [
  'Banane', 'Mangue', 'Ananas', 'Canne à sucre', 'Avocat', 'Citron',
  'Ignam', 'Manioc', 'Dachine', 'Légumes pays', 'Piment', 'Cacao',
  'Vanille', 'Café', 'Fruit à pain', 'Goyave', 'Papaye', 'Patate douce',
]

const ROLES = [
  { value: 'producteur', label: '👨‍🌾 Producteur / Agriculteur', icon: <Sprout size={24} /> },
  { value: 'proprietaire', label: '🏠 Propriétaire de terrain', icon: <Leaf size={24} /> },
  { value: 'cooperative', label: '🤝 Coopérative', icon: <User size={24} /> },
  { value: 'acheteur_b2b', label: '🏪 Acheteur B2B', icon: <ShoppingBag size={24} /> },
  { value: 'transporteur', label: '🚛 Transporteur', icon: <Truck size={24} /> },
  { value: 'institution', label: '🏛️ Institution', icon: <Building size={24} /> },
]

type FieldErrors = Record<string, string>

const Register: React.FC = () => {
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [form, setForm] = useState({
    fullName: '', phone: '', role: '', commune: '', production: '',
    email: '', password: '', confirmPw: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Persist form data to localStorage on change
  useEffect(() => {
    try { localStorage.setItem('kopeagri_register_draft', JSON.stringify(form)) } catch {}
  }, [form])

  // Restore form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kopeagri_register_draft')
      if (saved) setForm(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch {}
  }, [])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const validateStep = (s: number): boolean => {
    const errs: FieldErrors = {}
    if (s === 1) {
      if (!form.fullName.trim()) errs.fullName = 'Non ou bizwen rèmpli'
      if (!form.phone.trim()) errs.phone = 'Niméwo téléfon obligatwè'
      else if (!/^0[5-7]\d{8}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Fòma : 0696 XX XX XX'
      if (!form.role) errs.role = 'Chwazi wòl ou'
      if (!form.commune) errs.commune = 'Chwazi komun ou'
    }
    if (s === 2) {
      if (!form.email.trim()) errs.email = 'Email obligatwè'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email pa valid'
      if (!form.password) errs.password = 'Mot de passe obligatwè'
      else if (form.password.length < 6) errs.password = 'Fok li fè a moens 6 karaktè'
      if (form.password !== form.confirmPw) errs.confirmPw = 'De mot de passe yo pa konfòm'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep(step)) setStep(step + 1) }
  const back = () => setStep(step - 1)

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    setGlobalError('')
    setLoading(true)
    const err = await signUp(form.email, form.password, form.fullName, form.role, form.commune, form.phone)
    if (err) setGlobalError(err)
    else {
      localStorage.removeItem('kopeagri_register_draft')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const stepTitles = ['Identité', 'Sécurité', 'Confirmation']

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><Leaf size={28} /> KopéAgri</Link>
          <h1>Rejoignez la coopérative</h1>
          <p>3 étapes, 2 minit — osinponpé !</p>
        </div>

        {/* Progress steps */}
        <div className="onboarding-progress">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div className={`progress-step${step >= i ? ' active' : ''}`}>
                <div className="step-dot">{i < step ? '✓' : i}</div>
                <span>{stepTitles[i - 1]}</span>
              </div>
              {i < 3 && <div className="progress-line" style={step > i ? { background: 'var(--green-700)' } : {}} />}
            </React.Fragment>
          ))}
        </div>

        {globalError && <div className="form-error"><AlertCircle size={16} /> {globalError}</div>}

        {/* STEP 1: Identité */}
        {step === 1 && (
          <div className="auth-form">
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Ki moun ou yè ? 👋</h2>

            <div className="form-group">
              <label><User size={16} /> Nom complet</label>
              <input
                type="text" value={form.fullName} onChange={handleChange('fullName')}
                placeholder="Jèn Dupo, Titè Lalo" required className={`form-input${errors.fullName ? ' error' : ''}`}
              />
              {errors.fullName && <div className="field-error"><AlertCircle size={14} /> {errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Téléphone</label>
              <input
                type="tel" value={form.phone} onChange={handleChange('phone')}
                placeholder="0696 XX XX XX" required className={`form-input${errors.phone ? ' error' : ''}`}
              />
              {errors.phone && <div className="field-error"><AlertCircle size={14} /> {errors.phone}</div>}
            </div>

            <div className="form-group">
              <label>👤 Votre rôle dans la coopérative</label>
              <div className="role-selector">
                {ROLES.map(r => (
                  <button
                    key={r.value} type="button"
                    className={`role-option${form.role === r.value ? ' selected' : ''}`}
                    onClick={() => { setForm({ ...form, role: r.value }); if (errors.role) setErrors({ ...errors, role: '' }) }}
                  >
                    <span className="role-option-label">{r.label.split(' ').slice(1).join(' ')}</span>
                    <span className="role-option-desc">{r.icon}</span>
                  </button>
                ))}
              </div>
              {errors.role && <div className="field-error"><AlertCircle size={14} /> {errors.role}</div>}
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Commune</label>
              <select value={form.commune} onChange={handleChange('commune')} required className={`form-input${errors.commune ? ' error' : ''}`}>
                <option value="">Chwazi Kommun ou</option>
                {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.commune && <div className="field-error"><AlertCircle size={14} /> {errors.commune}</div>}
            </div>

            <div className="form-group">
              <label><Sprout size={16} /> Production principale (optionnel)</label>
              <select value={form.production} onChange={handleChange('production')} className="form-input">
                <option value="">Chwazi prodiksyon ou</option>
                {PRODUCTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="step-nav">
              <button type="button" className="btn btn-primary" onClick={next}>
                Kontinué <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Sécurité */}
        {step === 2 && (
          <div className="auth-form">
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Sékirizé kont ou 🔐</h2>

            <div className="form-group">
              <label><Mail size={16} /> Email</label>
              <input
                type="email" value={form.email} onChange={handleChange('email')}
                placeholder="ou@lapost.mq osinon ou@email.fr" required
                className={`form-input${errors.email ? ' error' : ''}`}
              />
              {errors.email && <div className="field-error"><AlertCircle size={14} /> {errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Lock size={16} /> Mot de passe</label>
                <input
                  type="password" value={form.password} onChange={handleChange('password')}
                  placeholder="Min. 6 karaktè" required
                  className={`form-input${errors.password ? ' error' : ''}`}
                />
                {errors.password && <div className="field-error"><AlertCircle size={14} /> {errors.password}</div>}
              </div>
              <div className="form-group">
                <label><Lock size={16} /> Konfirmasyon</label>
                <input
                  type="password" value={form.confirmPw} onChange={handleChange('confirmPw')}
                  placeholder="Répété mot de passe a" required
                  className={`form-input${errors.confirmPw ? ' error' : ''}`}
                />
                {errors.confirmPw && <div className="field-error"><AlertCircle size={14} /> {errors.confirmPw}</div>}
              </div>
            </div>

            <div className="step-nav">
              <button type="button" className="btn btn-outline" onClick={back}>
                <ArrowLeft size={18} /> Retou
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { if (validateStep(2)) setStep(3) }}>
                Kontinué <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="auth-form">
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Tout bon ? ✅</h2>

            <div className="confirm-card">
              <div className="confirm-info">
                <div className="confirm-row"><User size={16} /> <strong>{form.fullName}</strong></div>
                <div className="confirm-row"><Phone size={16} /> {form.phone}</div>
                <div className="confirm-row"><MapPin size={16} /> {form.commune}</div>
                <div className="confirm-row"><span className="role-emoji-confirm">{ROLES.find(r => r.value === form.role)?.label.split(' ')[0]}</span> {ROLES.find(r => r.value === form.role)?.label.split(' ').slice(1).join(' ')}</div>
                {form.production && <div className="confirm-row"><Sprout size={16} /> {form.production}</div>}
                <div className="confirm-row"><Mail size={16} /> {form.email}</div>
              </div>
            </div>

            <div className="step-nav">
              <button type="button" className="btn btn-outline" onClick={back}>
                <ArrowLeft size={18} /> Modifié
              </button>
              <button type="button" className="btn btn-primary btn-lg" disabled={loading} onClick={handleSubmit}>
                {loading ? 'Kréasyon...' : 'Kréé mon kont'} <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        <p className="auth-footer-text">
          Déjà inskri ? <Link to="/login">Konekté ou</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

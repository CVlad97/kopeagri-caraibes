import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Camera, User, Phone, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { MARTINIQUE_COMMUNES } from '../components/EntityForms'

const ROLE_OPTIONS = [
  { value: 'producteur', label: 'Producteur', emoji: '👨‍🌾', desc: 'Je produis et vends' },
  { value: 'transporteur', label: 'Transporteur', emoji: '🚛', desc: 'Je transporte' },
  { value: 'acheteur_b2b', label: 'Acheteur', emoji: '🏪', desc: "J'achète en gros" },
  { value: 'cooperative', label: 'Coopérative', emoji: '🤝', desc: 'Je gère un groupement' },
  { value: 'proprietaire', label: 'Propriétaire', emoji: '🏡', desc: 'Je loue des terres' },
  { value: 'institution', label: 'Institution', emoji: '🏛️', desc: 'Collectivité / ONG' },
]

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp, useDemoMode } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    photo: '',
    fullName: '',
    phone: '',
    commune: 'Fort-de-France',
    role: 'producteur',
  })

  const handlePhotoCapture = () => fileRef.current?.click()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, photo: ev.target?.result as string }))
    }
    reader.readAsDataURL(f)
  }

  const handleFinish = async () => {
    setLoading(true)
    setError('')
    try {
      const email = form.phone.replace(/\s/g, '') + '@kopeagri.mq'
      const err = await signUp(email, 'kopeagri2024', form.fullName, form.role, form.commune, form.phone)
      if (err) { setError(err); setLoading(false); return }
      navigate('/dashboard')
    } catch {
      useDemoMode()
      navigate('/dashboard')
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-logo">
          <Leaf size={28} className="logo-icon" />
          KopéAgri Caraïbes
        </div>
        <div className="onboarding-progress">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              {s > 1 && <div className="progress-line" />}
              <div className={`progress-step ${step === s ? 'active' : ''}`}>
                <div className="step-dot">{s <= step ? <Check size={14} /> : s}</div>
                <span>{s === 1 ? 'Identité' : s === 2 ? 'Localisation' : "C'est prêt !"}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />

        {step === 1 && (
          <div className="onboarding-step">
            <h2>Qui êtes-vous ?</h2>
            <p className="step-subtitle">Photo, nom et téléphone — simple et rapide</p>
            <div className="photo-upload" onClick={handlePhotoCapture}>
              {form.photo
                ? <img src={form.photo} alt="Photo" className="photo-preview" />
                : <div className="photo-placeholder"><Camera size={28} /><span>Photo</span></div>
              }
            </div>
            <div className="form-group">
              <label className="form-label"><User size={14} /> Nom complet</label>
              <input className="form-input" placeholder="Ex: Jean-Marie Larcher" value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={14} /> Téléphone</label>
              <input className="form-input" placeholder="0696 12 34 56" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div className="step-nav">
              <button className="btn btn-primary" disabled={!form.fullName || !form.phone} onClick={() => setStep(2)}>
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2>Où et quoi ?</h2>
            <p className="step-subtitle">Votre commune et votre rôle dans la filière</p>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} /> Commune</label>
              <select className="form-select" value={form.commune} onChange={e => setForm(p => ({...p, commune: e.target.value}))}>
                {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Votre rôle</label>
              <div className="role-selector">
                {ROLE_OPTIONS.map(r => (
                  <div key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => setForm(p => ({...p, role: r.value}))}>
                    <span className="role-emoji">{r.emoji}</span>
                    <span className="role-option-label">{r.label}</span>
                    <span className="role-option-desc">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={16} /> Retour</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Suivant <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2>C'est presque fini !</h2>
            <p className="step-subtitle">Vérifiez vos informations</p>
            <div className="confirm-card">
              {form.photo
                ? <img src={form.photo} alt="Photo" className="confirm-photo" />
                : <div className="confirm-photo" style={{ background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
              }
              <div className="confirm-info">
                <div className="confirm-row"><strong>{form.fullName}</strong></div>
                <div className="confirm-row"><Phone size={14} /> {form.phone}</div>
                <div className="confirm-row"><MapPin size={14} /> {form.commune}</div>
                <div className="confirm-row"><span className="role-emoji-confirm">{ROLE_OPTIONS.find(r => r.value === form.role)?.emoji}</span> {ROLE_OPTIONS.find(r => r.value === form.role)?.label}</div>
              </div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="step-nav">
              <button className="btn btn-secondary" onClick={() => setStep(2)}><ChevronLeft size={16} /> Retour</button>
              <button className="btn btn-primary" disabled={loading || !form.fullName} onClick={handleFinish}>
                {loading ? 'Création...' : "🚀 C'est parti !"}
              </button>
            </div>
          </div>
        )}

        <div className="onboarding-footer">
          Déjà inscrit ? <a href="/login">Se connecter</a>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage

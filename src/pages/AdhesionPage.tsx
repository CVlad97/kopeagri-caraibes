import React, { useState, useEffect } from 'react'
import { CheckCircle, X, Star, CreditCard, MessageCircle, ChevronDown, ChevronUp, Phone } from 'lucide-react'
import {
  PLANS, getAllSubscriptions, createSubscription, updateSubscription,
  getAllCommissions, markCommissionPaid,
} from '../services/subscriptionService'
import type { PlanType, Subscription, Commission } from '../services/subscriptionService'

const PAYMENT_LABELS: Record<string, string> = {
  virement: '🏦 Virement bancaire',
  cheque: '📝 Chèque',
  especes: '💵 Espèces',
  mobile_money: '📱 Mobile Money',
}

const COMMISSION_STATUS: Record<string, { label: string; color: string }> = {
  a_payer: { label: 'À payer', color: '#F44336' },
  payee: { label: 'Payée', color: '#4CAF50' },
  en_attente: { label: 'En attente', color: '#FF9800' },
}

const SUB_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#4CAF50' },
  en_attente: { label: 'En attente', color: '#FF9800' },
  expiree: { label: 'Expirée', color: '#F44336' },
  resiliee: { label: 'Résiliée', color: '#9E9E9E' },
}

const AdhesionPage: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [annual, setAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [expandedSub, setExpandedSub] = useState<string | null>(null)
  const [tab, setTab] = useState<'plans' | 'abonnements' | 'commissions'>('plans')

  const load = () => {
    setSubs(getAllSubscriptions())
    setCommissions(getAllCommissions())
  }
  useEffect(load, [])

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPlan) return
    const fd = new FormData(e.currentTarget)
    const plan = PLANS.find(p => p.id === selectedPlan)!
    const now = new Date()
    const expires = new Date(now)
    expires.setFullYear(expires.getFullYear() + (annual ? 1 : 0))
    expires.setMonth(expires.getMonth() + (annual ? 0 : 1))

    createSubscription({
      user_id: 'demo-user-1',
      user_name: fd.get('user_name') as string,
      plan: selectedPlan,
      status: 'en_attente',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      auto_renew: fd.get('auto_renew') === 'on',
      payment_method: fd.get('payment_method') as Subscription['payment_method'],
      amount: annual ? plan.priceAnnual : plan.price,
    })
    setShowCheckout(false)
    setSelectedPlan(null)
    load()
  }

  const handleActivate = (id: string) => {
    updateSubscription(id, { status: 'active' })
    load()
  }

  const handleCancel = (id: string) => {
    updateSubscription(id, { status: 'resiliee', auto_renew: false })
    load()
  }

  const handlePayCommission = (id: string) => {
    markCommissionPaid(id)
    load()
  }

  const totalCommissionsAPayer = commissions
    .filter(c => c.status === 'a_payer')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalCommissionsPayees = commissions
    .filter(c => c.status === 'payee')
    .reduce((sum, c) => sum + c.amount, 0)

  const activeSubs = subs.filter(s => s.status === 'active')
  const mrr = activeSubs.reduce((sum, s) => {
    const plan = PLANS.find(p => p.id === s.plan)
    return sum + (plan?.price || 0)
  }, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Star size={24} /> Adhésion & Rémunération</h1>
          <p className="page-subtitle">Plans, abonnements et commissions KopéAgri</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="adhesion-tabs">
        <button className={`adhesion-tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>
          📋 Plans & Tarifs
        </button>
        <button className={`adhesion-tab ${tab === 'abonnements' ? 'active' : ''}`} onClick={() => setTab('abonnements')}>
          👥 Abonnements ({subs.length})
        </button>
        <button className={`adhesion-tab ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>
          💰 Commissions ({commissions.length})
        </button>
      </div>

      {/* ===== PLANS ===== */}
      {tab === 'plans' && (
        <>
          {/* Toggle annuel */}
          <div className="pricing-toggle-row">
            <span className={!annual ? 'active-toggle' : ''}>Mensuel</span>
            <label className="pricing-switch">
              <input type="checkbox" checked={annual} onChange={e => setAnnual(e.target.checked)} />
              <span className="pricing-slider" />
            </label>
            <span className={annual ? 'active-toggle' : ''}>Annuel</span>
            {annual && <span className="pricing-badge-save">-17%</span>}
          </div>

          {/* Cards */}
          <div className="pricing-grid">
            {PLANS.map(plan => {
              const price = annual ? plan.priceAnnual : plan.price
              const perMonth = annual ? Math.round(plan.priceAnnual / 12) : plan.price
              return (
                <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <div className="pricing-popular-badge">⭐ Le plus populaire</div>}
                  <div className="pricing-card-header">
                    <span className="pricing-emoji">{plan.emoji}</span>
                    <h3>{plan.name}</h3>
                    <p className="pricing-desc">{plan.description}</p>
                  </div>
                  <div className="pricing-price">
                    <span className="pricing-amount">{price === 0 ? 'Gratuit' : `${price}€`}</span>
                    {price > 0 && <span className="pricing-period">/{annual ? 'an' : 'mois'}</span>}
                    {annual && price > 0 && <div className="pricing-monthly">soit {perMonth}€/mois</div>}
                  </div>
                  <ul className="pricing-features">
                    {plan.features.map((f, i) => (
                      <li key={i}><CheckCircle size={14} className="feature-check" /> {f}</li>
                    ))}
                  </ul>
                  <div className="pricing-commission">
                    Commission : <strong>{plan.commission}%</strong> par transaction
                  </div>
                  <button
                    className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setSelectedPlan(plan.id); setShowCheckout(true) }}
                  >
                    {price === 0 ? 'Commencer gratuitement' : `S'abonner — ${price}€/${annual ? 'an' : 'mois'}`}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Récap modèles revenus */}
          <div className="revenue-model">
            <h3>📊 Modèle de revenus KopéAgri</h3>
            <div className="revenue-grid">
              <div className="revenue-item">
                <div className="revenue-icon">💳</div>
                <div className="revenue-text">
                  <strong>Abonnements</strong>
                  <p>Revenus récurrents mensuels/annuels par plan</p>
                </div>
              </div>
              <div className="revenue-item">
                <div className="revenue-icon">💰</div>
                <div className="revenue-text">
                  <strong>Commissions sur transactions</strong>
                  <p>2-8% par appel d'offre abouti (adaptable par plan)</p>
                </div>
              </div>
              <div className="revenue-item">
                <div className="revenue-icon">🏷️</div>
                <div className="revenue-text">
                  <strong>Services premium</strong>
                  <p>Formation, API, rapports personnalisés (Plan Plantasyon)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== CHECKOUT MODAL ===== */}
      {showCheckout && selectedPlan && (
        <div className="checkout-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <div className="checkout-header">
              <h3>📋 Adhésion {PLANS.find(p => p.id === selectedPlan)?.emoji} {PLANS.find(p => p.id === selectedPlan)?.name}</h3>
              <button className="btn-icon" onClick={() => setShowCheckout(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubscribe}>
              <div className="form-group">
                <label className="form-label">Nom complet *</label>
                <input name="user_name" className="form-input" placeholder="Jean Dupont" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Phone size={14} /> Téléphone WhatsApp *</label>
                <input name="phone" className="form-input" placeholder="0696 XX XX XX" required />
              </div>
              <div className="form-group">
                <label className="form-label">Mode de règlement *</label>
                <select name="payment_method" className="form-input" required>
                  <option value="virement">🏦 Virement bancaire</option>
                  <option value="cheque">📝 Chèque</option>
                  <option value="especes">💵 Espèces</option>
                  <option value="mobile_money">📱 Mobile Money</option>
                </select>
              </div>
              <div className="form-group">
                <label className="toggle-label">
                  <input type="checkbox" name="auto_renew" defaultChecked /> Renouvellement automatique
                </label>
              </div>
              <div className="checkout-summary">
                <div className="checkout-row">
                  <span>Plan</span>
                  <strong>{PLANS.find(p => p.id === selectedPlan)?.emoji} {PLANS.find(p => p.id === selectedPlan)?.name}</strong>
                </div>
                <div className="checkout-row">
                  <span>Montant</span>
                  <strong className="checkout-amount">
                    {annual ? PLANS.find(p => p.id === selectedPlan)?.priceAnnual : PLANS.find(p => p.id === selectedPlan)?.price}€
                    /{annual ? 'an' : 'mois'}
                  </strong>
                </div>
                <div className="checkout-row">
                  <span>Commission sur transactions</span>
                  <strong>{PLANS.find(p => p.id === selectedPlan)?.commission}%</strong>
                </div>
                <div className="checkout-info">
                  📧 Confirmation envoyée par email après validation du paiement.
                  <br/>💬 Un conseiller vous contactera via WhatsApp pour finaliser.
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCheckout(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><CreditCard size={16} /> Confirmer l'adhésion</button>
              </div>
            </form>
            <a
              href={`https://wa.me/596696000000?text=${encodeURIComponent(
                `Bonjour KopéAgri, je souhaite adhérer au plan ${PLANS.find(p => p.id === selectedPlan)?.name}. Pouvez-vous m'aider ?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="checkout-whatsapp"
            >
              <MessageCircle size={16} /> Besoin d'aide ? WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ===== ABONNEMENTS ===== */}
      {tab === 'abonnements' && (
        <>
          <div className="subs-stats-row">
            <div className="subs-stat">
              <span className="subs-stat-num">{activeSubs.length}</span>
              <span className="subs-stat-label">Abonnements actifs</span>
            </div>
            <div className="subs-stat">
              <span className="subs-stat-num">{mrr}€</span>
              <span className="subs-stat-label">MRR estimé</span>
            </div>
            <div className="subs-stat">
              <span className="subs-stat-num">{subs.filter(s => s.status === 'en_attente').length}</span>
              <span className="subs-stat-label">En attente</span>
            </div>
          </div>
          <div className="subs-list">
            {subs.map(sub => {
              const plan = PLANS.find(p => p.id === sub.plan)
              const isExpanded = expandedSub === sub.id
              const statusCfg = SUB_STATUS[sub.status]
              return (
                <div key={sub.id} className="subs-card">
                  <div className="subs-card-header" onClick={() => setExpandedSub(isExpanded ? null : sub.id)}>
                    <div className="subs-card-left">
                      <span className="subs-plan-badge">{plan?.emoji} {plan?.name}</span>
                      <strong>{sub.user_name}</strong>
                      <span className="subs-ref">Réf: {sub.reference}</span>
                    </div>
                    <div className="subs-card-right">
                      <span className="subs-status-badge" style={{ background: statusCfg.color + '20', color: statusCfg.color }}>
                        {statusCfg.label}
                      </span>
                      <span className="subs-amount">{sub.amount}€</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="subs-card-body">
                      <div className="subs-detail-row"><span>Début :</span><strong>{new Date(sub.started_at).toLocaleDateString('fr-FR')}</strong></div>
                      <div className="subs-detail-row"><span>Expiration :</span><strong>{new Date(sub.expires_at).toLocaleDateString('fr-FR')}</strong></div>
                      <div className="subs-detail-row"><span>Règlement :</span><strong>{PAYMENT_LABELS[sub.payment_method]}</strong></div>
                      <div className="subs-detail-row"><span>Renouvellement auto :</span><strong>{sub.auto_renew ? 'Oui' : 'Non'}</strong></div>
                      <div className="subs-detail-row"><span>Commission :</span><strong>{plan?.commission}% par transaction</strong></div>
                      <div className="subs-card-actions">
                        {sub.status === 'en_attente' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleActivate(sub.id)}>
                            <CheckCircle size={14} /> Activer
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(sub.id)}>
                            Résilier
                          </button>
                        )}
                        <a
                          href={`https://wa.me/596696000000?text=${encodeURIComponent(
                            `Bonjour, question sur mon abonnement ${plan?.name} (réf ${sub.reference}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-whatsapp"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {subs.length === 0 && <div className="empty-state"><p>Aucun abonnement pour le moment</p></div>}
          </div>
        </>
      )}

      {/* ===== COMMISSIONS ===== */}
      {tab === 'commissions' && (
        <>
          <div className="commissions-stats-row">
            <div className="commissions-stat" style={{ borderColor: '#F44336' }}>
              <span className="commissions-stat-num">{totalCommissionsAPayer}€</span>
              <span className="commissions-stat-label">À payer</span>
            </div>
            <div className="commissions-stat" style={{ borderColor: '#4CAF50' }}>
              <span className="commissions-stat-num">{totalCommissionsPayees}€</span>
              <span className="commissions-stat-label">Payées</span>
            </div>
            <div className="commissions-stat" style={{ borderColor: '#FF9800' }}>
              <span className="commissions-stat-num">{commissions.filter(c => c.status === 'en_attente').length}</span>
              <span className="commissions-stat-label">En attente</span>
            </div>
          </div>
          <div className="commissions-list">
            {commissions.map(comm => {
              const statusCfg = COMMISSION_STATUS[comm.status]
              const sub = subs.find(s => s.id === comm.subscription_id)
              return (
                <div key={comm.id} className="commission-card">
                  <div className="commission-left">
                    <strong>{comm.amount}€</strong>
                    <span className="commission-rate">Taux: {comm.commission_rate}%</span>
                    <span className="commission-sub">{sub?.user_name || 'N/A'}</span>
                  </div>
                  <div className="commission-right">
                    <span className="commission-status" style={{ background: statusCfg.color + '20', color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                    <span className="commission-date">
                      {comm.paid_at
                        ? `Payé le ${new Date(comm.paid_at).toLocaleDateString('fr-FR')}`
                        : `Créé le ${new Date(comm.created_at).toLocaleDateString('fr-FR')}`}
                    </span>
                    {comm.status === 'a_payer' && (
                      <button className="btn btn-sm btn-success" onClick={() => handlePayCommission(comm.id)}>
                        <CheckCircle size={14} /> Marquer payée
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {commissions.length === 0 && <div className="empty-state"><p>Aucune commission</p></div>}
          </div>
        </>
      )}
    </div>
  )
}

export default AdhesionPage

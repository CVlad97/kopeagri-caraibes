import React, { useState } from 'react'
import {
  Check, X, Star, Crown, Zap, Truck, ShoppingCart, Building2,
  MessageCircle, Download, HelpCircle, ChevronDown, ChevronUp,
  Shield, Mail, Phone, ArrowRight, Sparkles, CreditCard
} from 'lucide-react'
import { redirectToCheckout } from '../services/stripeService'
import { useAuth } from '../contexts/AuthContext'

/* ===== Pricing Tiers ===== */
interface PricingTier {
  id: string
  name: string
  plan: string
  emoji: string
  priceMonth: number
  priceYear: number
  target: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const TIERS: PricingTier[] = [
  {
    id: 'konbit', name: 'Konbit', plan: 'Plan Konbit', emoji: '🌱',
    priceMonth: 9, priceYear: 99, target: 'Producteur individuel',
    description: 'Idéal pour les producteurs indépendants qui souhaitent accéder au marché local et valoriser leur production.',
    features: [
      'Fiche producteur complète',
      'Jusqu\'à 5 lots/mois',
      'QR traçabilité',
      'Export CSV',
      'Notifications email',
    ],
    icon: <Zap size={24} />,
  },
  {
    id: 'lakou', name: 'Lakou', plan: 'Plan Lakou', emoji: '🏡',
    priceMonth: 29, priceYear: 290, target: 'Petit producteur <5ha',
    description: 'Pour les petites exploitations qui veulent optimiser leur production et leurs ventes avec des outils avancés.',
    features: [
      'Tout le plan Konbit +',
      'Lots illimités',
      'Calendrier saisonnier',
      'Carte parcelles',
      'Photos illimitées',
      'Support WhatsApp',
    ],
    popular: true,
    icon: <Star size={24} />,
  },
  {
    id: 'plantasyon', name: 'Plantasyon', plan: 'Plan Plantasyon', emoji: '🌴',
    priceMonth: 59, priceYear: 590, target: 'Exploitation >5ha',
    description: 'Pour les exploitations structurées avec des besoins avancés de gestion, de facturation et d\'export.',
    features: [
      'Tout le plan Lakou +',
      'ERP/CRM intégré',
      'Facturation électronique DGFIP',
      'Multi-utilisateurs (5)',
      'API & intégrations',
      'Rapports PDF',
    ],
    icon: <Crown size={24} />,
  },
  {
    id: 'plantasyon-pro', name: 'Plantasyon Pro', plan: 'Plan Plantasyon Pro', emoji: '🏗️',
    priceMonth: 149, priceYear: 1490, target: 'GIE / Organisation',
    description: 'Pour les GIE et organisations qui gèrent plusieurs producteurs et flux logistiques complexes.',
    features: [
      'Tout le plan Plantasyon +',
      'Multi-utilisateurs (25)',
      'White-label',
      'Gestion groupée export',
      'Comptabilité intégrée',
      'Support dédié',
    ],
    icon: <Building2 size={24} />,
  },
  {
    id: 'transport', name: 'Transport', plan: 'Plan Transport', emoji: '🚛',
    priceMonth: 39, priceYear: 390, target: 'Transporteur',
    description: 'Pour les transporteurs qui souhaitent optimiser leurs tournées et gérer leur activité logistique.',
    features: [
      'Gestion tournées',
      'Optimisation routes',
      'Facturation transport',
      'GPS tracking',
    ],
    icon: <Truck size={24} />,
  },
  {
    id: 'acheteur', name: 'Acheteur B2B', plan: 'Plan Acheteur B2B', emoji: '🛒',
    priceMonth: 49, priceYear: 490, target: 'Acheteur professionnel',
    description: 'Pour les acheteurs professionnels qui veulent accéder à l\'offre agricole martiniquaise en gros.',
    features: [
      'Catalogue producteurs',
      'Commandes groupées',
      'Négociation prix',
      'Livraison suivie',
    ],
    icon: <ShoppingCart size={24} />,
  },
]

const INSTITUTION_TIER = {
  id: 'institution', name: 'Institution', plan: 'Sur devis', emoji: '🏛️',
  target: 'Institution / Collectivité',
  description: 'Solutions sur mesure pour les collectivités, institutions publiques et organisations territoriales.',
}

/* ===== Commission Info ===== */
const COMMISSIONS = [
  { label: 'Commission marketplace', value: '5%', detail: 'Sur ventes réalisées via la plateforme', badge: '' },
  { label: 'Volumes >10T/an', value: '3%', detail: 'Commission négociée pour gros volumes', badge: 'Négociable' },
  { label: 'Export groupé', value: '2,5%', detail: 'Commission sur lots export consolidés', badge: '' },
  { label: 'TooGoodToGo surplus', value: '0%', detail: 'Anti-gaspillage — aucune commission', badge: 'Anti-gaspillage' },
]

/* ===== FAQ (6 questions) ===== */
const FAQ_ITEMS = [
  { q: 'Quel est l\'engagement ?', a: 'L\'abonnement annuel est sans engagement de durée. Vous pouvez résilier à tout moment avec un préavis de 30 jours. L\'abonnement mensuel est renouvelé chaque mois sans engagement.' },
  { q: 'Puis-je changer de plan en cours d\'année ?', a: 'Oui, vous pouvez upgrader à tout moment. Le prorata sera calculé automatiquement. Le downgrade est possible à la date anniversaire de votre abonnement.' },
  { q: 'Y a-t-il un droit de rétractation ?', a: 'Oui, vous bénéficiez d\'un droit de rétractation de 14 jours après souscription. Au-delà, nous proposons un remboursement au prorata sur les mois restants pour les abonnements annuels.' },
  { q: 'La commission marketplace est-elle incluse dans l\'abonnement ?', a: 'Non, la commission de 5% est appliquée uniquement sur les ventes réalisées via la marketplace. L\'abonnement donne accès à la plateforme, la commission est prélevée sur les transactions.' },
  { q: 'Comment fonctionne le paiement ?', a: 'Par carte bancaire, virement SEPA ou prélèvement automatique. Facture mensuelle ou annuelle selon votre choix. Paiement par mandat administratif possible pour les institutions.' },
  { q: 'Quelle est la garantie satisfait ou remboursé ?', a: 'Nous offrons une garantie satisfait ou remboursé de 30 jours sur tous les plans. Si la plateforme ne répond pas à vos besoins, nous vous remboursons intégralement sans condition.' },
]

/* ===== Feature Comparison ===== */
const FEATURE_ROWS = [
  { feature: 'Fiche producteur / QR traçabilité', konbit: true, lakou: true, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Lots simultanés', konbit: '5/mois', lakou: '∞', plantasyon: '∞', pro: '∞', transport: '—', acheteur: '—' },
  { feature: 'Export CSV', konbit: true, lakou: true, plantasyon: true, pro: true, transport: true, acheteur: true },
  { feature: 'Notifications email', konbit: true, lakou: true, plantasyon: true, pro: true, transport: true, acheteur: true },
  { feature: 'Calendrier saisonnier', konbit: false, lakou: true, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Carte parcelles / Photos', konbit: false, lakou: true, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Support WhatsApp', konbit: false, lakou: true, plantasyon: true, pro: true, transport: true, acheteur: false },
  { feature: 'ERP/CRM', konbit: false, lakou: false, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Facturation électronique DGFIP', konbit: false, lakou: false, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Multi-utilisateurs', konbit: '1', lakou: '1', plantasyon: '5', pro: '25', transport: '1', acheteur: '3' },
  { feature: 'API & intégrations', konbit: false, lakou: false, plantasyon: true, pro: true, transport: false, acheteur: false },
  { feature: 'Rapports PDF', konbit: false, lakou: false, plantasyon: true, pro: true, transport: true, acheteur: true },
  { feature: 'White-label', konbit: false, lakou: false, plantasyon: false, pro: true, transport: false, acheteur: false },
  { feature: 'Gestion groupée export', konbit: false, lakou: false, plantasyon: false, pro: true, transport: false, acheteur: true },
  { feature: 'Comptabilité intégrée', konbit: false, lakou: false, plantasyon: false, pro: true, transport: false, acheteur: false },
  { feature: 'Gestion tournées / GPS', konbit: false, lakou: false, plantasyon: false, pro: false, transport: true, acheteur: false },
  { feature: 'Facturation transport', konbit: false, lakou: false, plantasyon: false, pro: false, transport: true, acheteur: false },
  { feature: 'Catalogue producteurs', konbit: false, lakou: false, plantasyon: false, pro: false, transport: false, acheteur: true },
  { feature: 'Commandes groupées / Négociation', konbit: false, lakou: false, plantasyon: false, pro: false, transport: false, acheteur: true },
  { feature: 'Livraison suivie', konbit: false, lakou: false, plantasyon: false, pro: false, transport: false, acheteur: true },
  { feature: 'Support dédié', konbit: false, lakou: false, plantasyon: false, pro: true, transport: false, acheteur: true },
]

/* ===== CSV ===== */
function exportCSV(): void {
  const headers = ['Plan', 'Prix mensuel (€)', 'Prix annuel (€)', 'Cible']
  const rows = TIERS.map(t => [`"${t.plan}"`, t.priceMonth, t.priceYear, `"${t.target}"`].join(','))
  rows.push([`"${INSTITUTION_TIER.plan}"`, 'Sur devis', 'Sur devis', `"${INSTITUTION_TIER.target}"`].join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'grille_tarifaire_kopeagri.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ===== Component ===== */
const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(true)
  const [showCompare, setShowCompare] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const { user, profile } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const handleChoose = async (tier: PricingTier | typeof INSTITUTION_TIER) => {
    // Institution → contact form
    if (!('priceMonth' in tier)) {
      setSelectedPlan(tier.plan)
      setShowContact(true)
      return
    }
    // Stripe Checkout or WhatsApp fallback
    setCheckoutLoading(tier.id)
    try {
      const { url, error } = await redirectToCheckout({
        planId: tier.id,
        email: user?.email || '',
        fullName: profile?.full_name || '',
        isAnnual: annual,
      })
      if (error) {
        setSelectedPlan(tier.plan)
        setShowContact(true)
      } else if (url) {
        window.open(url, '_blank')
      }
    } catch {
      setSelectedPlan(tier.plan)
      setShowContact(true)
    }
    setCheckoutLoading(null)
  }

  return (
    <div className="page">
      {/* ===== Hero ===== */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-900) 0%, #003d33 40%, #002244 100%)',
        color: 'white',
        padding: '48px 24px 56px',
        borderRadius: 'var(--radius)',
        marginBottom: 40,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12 }}>
            KopéAgri Caraïbes
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Matrice Tarifaire KopéAgri
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            Des tarifs adaptés à chaque acteur de la filière agricole en Martinique.
            Prix annuels négociés, sans surprise.
          </p>

          {/* Money-back guarantee badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            padding: '10px 22px', borderRadius: 30, fontSize: 14, fontWeight: 600,
          }}>
            <Shield size={18} />
            Garantie satisfait ou remboursé 30 jours
          </div>
        </div>
      </div>

      {/* ===== Toggle Mensuel / Annuel ===== */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
        <button
          className={`filter-btn ${!annual ? 'active' : ''}`}
          onClick={() => setAnnual(false)}
          style={{ minHeight: 48, padding: '12px 24px' }}
        >
          Mensuel
        </button>
        <button
          className={`filter-btn ${annual ? 'active' : ''}`}
          onClick={() => setAnnual(true)}
          style={{ minHeight: 48, padding: '12px 24px' }}
        >
          Annuel <span style={{ color: 'var(--green-700)', fontWeight: 700, marginLeft: 6 }}>-15%</span>
        </button>
      </div>

      {/* ===== Pricing Cards ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        {TIERS.map(tier => {
          const isPopular = tier.popular === true
          return (
            <div
              key={tier.id}
              className="section-block"
              style={{
                padding: 28,
                position: 'relative',
                border: isPopular ? '2px solid var(--green-700)' : undefined,
                boxShadow: isPopular ? 'var(--shadow-lg)' : undefined,
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--green-700)', color: 'white', padding: '4px 18px',
                  borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Sparkles size={12} /> Populaire
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: 'var(--green-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-700)',
                }}>
                  {tier.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{tier.emoji} {tier.name}</h3>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{tier.target}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--green-900)' }}>
                  {annual ? tier.priceYear : tier.priceMonth}€
                </span>
                <span style={{ fontSize: 15, color: 'var(--gray-500)' }}>
                  /{annual ? 'an' : 'mois'}
                </span>
                {annual && (
                  <div style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 600, marginTop: 4 }}>
                    Soit {Math.round(tier.priceYear / 12)}€/mois
                  </div>
                )}
              </div>

              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 20 }}>
                {tier.description}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, marginBottom: 8 }}>
                    <Check size={16} style={{ color: 'var(--green-700)', marginTop: 2, flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={isPopular ? 'btn btn-primary btn-full' : 'btn btn-outline btn-full'}
                onClick={() => handleChoose(tier)}
                disabled={checkoutLoading === tier.id}
              >
                {checkoutLoading === tier.id ? (
                  <><span className="spinner" /> Chargement...</>
                ) : (
                  <>Choisir <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )
        })}

        {/* Institution card */}
        <div className="section-block" style={{
          padding: 28, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{INSTITUTION_TIER.emoji}</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{INSTITUTION_TIER.name}</h3>
          <span style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
            {INSTITUTION_TIER.target}
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-900)', marginBottom: 12 }}>
            Sur devis
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 24 }}>
            {INSTITUTION_TIER.description}
          </p>
          <button className="btn btn-outline btn-full" onClick={() => handleChoose(INSTITUTION_TIER)}>
            Demander un devis <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ===== Commissions & Frais ===== */}
      <div className="section-block" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>💰 Commissions & frais</h2>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {COMMISSIONS.map((c, i) => (
            <div key={i} style={{
              padding: 20,
              background: c.value === '0%' ? 'var(--green-100)' : 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: c.value === '0%' ? '1px solid var(--green-700)' : '1px solid var(--gray-200)',
              position: 'relative',
            }}>
              {c.badge && (
                <span className={c.badge === 'Anti-gaspillage' ? 'badge badge-green' : 'badge badge-gold'} style={{
                  position: 'absolute', top: 10, right: 10, fontSize: 11,
                }}>
                  {c.badge}
                </span>
              )}
              <div style={{
                fontSize: 28, fontWeight: 800,
                color: c.value === '0%' ? 'var(--green-700)' : 'var(--green-700)',
              }}>
                {c.value}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{c.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Comparison Table ===== */}
      <div className="section-block" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>📊 Comparaison des fonctionnalités</h2>
          <button className="btn btn-outline btn-sm" onClick={() => setShowCompare(!showCompare)}>
            {showCompare ? 'Masquer' : 'Voir le tableau'} {showCompare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {showCompare && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={{ textAlign: 'left', padding: 12, fontWeight: 600, position: 'sticky', left: 0, background: 'var(--white)', zIndex: 1 }}>Fonctionnalité</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80 }}>🌱 Konbit</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80, background: 'var(--green-50)' }}>🏡 Lakou</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80 }}>🌴 Plantasyon</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80 }}>🏗️ Pro</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80 }}>🚛 Transport</th>
                  <th style={{ padding: 12, fontWeight: 600, minWidth: 80 }}>🛒 Acheteur</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: 10, fontWeight: 500, position: 'sticky', left: 0, background: 'var(--white)', zIndex: 1 }}>
                      {row.feature}
                    </td>
                    {[row.konbit, row.lakou, row.plantasyon, row.pro, row.transport, row.acheteur].map((val, j) => (
                      <td key={j} style={{
                        padding: 10,
                        textAlign: 'center',
                        background: j === 1 ? 'var(--green-50)' : 'transparent',
                      }}>
                        {val === true ? <Check size={16} style={{ color: 'var(--green-700)', margin: '0 auto' }} /> :
                         val === false ? <X size={16} style={{ color: 'var(--gray-300)', margin: '0 auto' }} /> :
                         <span style={{ fontSize: 12, fontWeight: 500 }}>{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== FAQ ===== */}
      <div className="section-block" style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>❓ Questions fréquentes</h2>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--gray-200)' }}>
            <button
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '16px 0', background: 'none', border: 'none',
                fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', cursor: 'pointer',
                minHeight: 48, textAlign: 'left',
              }}
              aria-expanded={faqOpen === i}
            >
              {item.q}
              {faqOpen === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {faqOpen === i && (
              <p style={{ padding: '0 0 16px 0', fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ===== Money-back CTA ===== */}
      <div className="section-block" style={{
        textAlign: 'center', padding: '40px 24px',
        background: 'linear-gradient(135deg, var(--green-100) 0%, var(--green-50) 100%)',
        border: '1px solid var(--green-700)',
      }}>
        <Shield size={40} style={{ color: 'var(--green-700)', marginBottom: 16 }} />
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Garantie satisfait ou remboursé
        </h3>
        <p style={{ fontSize: 15, color: 'var(--gray-600)', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.6 }}>
          Essayez KopéAgri sans risque. Si la plateforme ne répond pas à vos attentes dans les 30 premiers jours,
          nous vous remboursons intégralement, sans condition.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => { setSelectedPlan(''); setShowContact(true) }}>
          <MessageCircle size={18} /> Nous contacter
        </button>
      </div>

      {/* ===== Contact Modal ===== */}
      {showContact && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowContact(false) }}
        >
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--radius)', padding: 32,
            maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>📩 Nous contacter</h2>
            {selectedPlan && (
              <div className="badge badge-green" style={{ marginBottom: 16 }}>
                Plan sélectionné : {selectedPlan}
              </div>
            )}
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 24, lineHeight: 1.6 }}>
              Remplissez le formulaire ci-dessous ou contactez-nous directement par email ou WhatsApp.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault()
                const form = e.currentTarget
                const data = new FormData(form)
                const nom = data.get('nom') as string
                const email = data.get('email') as string
                const tel = data.get('tel') as string
                const msg = data.get('message') as string

                // Build email template
                const subject = encodeURIComponent(`Demande d'abonnement KopéAgri — ${selectedPlan || 'Information'}`)
                const body = encodeURIComponent(
                  `Bonjour l'équipe KopéAgri,\n\n` +
                  `Je souhaite souscrire au ${selectedPlan || 'plan de votre choix'}.\n\n` +
                  `Nom : ${nom}\n` +
                  `Email : ${email}\n` +
                  `Téléphone : ${tel || 'Non renseigné'}\n\n` +
                  `Message :\n${msg || 'Aucun message supplémentaire'}\n\n` +
                  `Cordialement,\n${nom}`
                )
                window.open(`mailto:contact@kopeagri-martinique.fr?subject=${subject}&body=${body}`, '_blank')
                setShowContact(false)
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div className="form-group">
                <label>Nom complet *</label>
                <input className="form-input" name="nom" required placeholder="Votre nom" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="form-input" name="email" type="email" required placeholder="votre@email.fr" />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input className="form-input" name="tel" type="tel" placeholder="0596 XX XX XX" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  className="form-input" name="message" rows={3}
                  placeholder={selectedPlan && selectedPlan !== 'Sur devis'
                    ? `Je suis intéressé(e) par le ${selectedPlan}. Pourriez-vous me contacter pour finaliser mon inscription ?`
                    : 'Décrivez votre besoin...'}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9Agri%2C%20je%20souhaite%20des%20informations%20sur%20vos%20offres"
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline" style={{ color: '#25D366', borderColor: '#25D366' }}
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                <a
                  href={`mailto:contact@kopeagri-martinique.fr?subject=${encodeURIComponent(`Demande d'abonnement KopéAgri — ${selectedPlan}`)}`}
                  className="btn btn-outline" style={{ color: 'var(--green-700)', borderColor: 'var(--green-700)' }}
                >
                  <Mail size={18} /> Email
                </a>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, minWidth: 120 }}>
                  Envoyer <ArrowRight size={16} />
                </button>
              </div>
              <button type="button" className="btn btn-outline btn-full" onClick={() => setShowContact(false)}>
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingPage

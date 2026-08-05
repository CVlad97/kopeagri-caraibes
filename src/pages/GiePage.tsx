import React, { useState } from 'react'
import {
  Building2, Users, FileText, TrendingUp, Shield, Scale, 
  CheckCircle, ArrowRight, ChevronDown, ChevronUp, Download,
  Mail, Phone, MapPin, Calculator, Landmark, Leaf
} from 'lucide-react'

/* ===== GIE Legal Structure Page ===== */

interface GIEAdvantage {
  icon: React.ReactNode
  title: string
  description: string
  details: string[]
}

const ADVANTAGES: GIEAdvantage[] = [
  {
    icon: <Users size={24} />,
    title: 'Membres hétérogènes',
    description: 'Contrairement à une coopérative, le GIE accepte tous les types de membres : producteurs, acheteurs, transporteurs, institutions.',
    details: [
      'Producteurs individuels ou groupés',
      'Transporteurs et logisticiens',
      'Acheteurs B2B (hôtels, restaurants, supermarchés)',
      'Institutions (DAAF, Chambre d\'Agriculture, CTM)',
      'Propriétaires fonciers',
      'Transformateurs agroalimentaires',
    ],
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Fiscalité transparente',
    description: 'Le GIE n\'est pas soumis à l\'IS. Les résultats sont imposés directement entre les mains des membres (IR ou IS selon leur statut).',
    details: [
      'Pas d\'impôt sur les sociétés au niveau du GIE',
      'Chaque membre déclare sa quote-part',
      'Producteurs : exonération possible (régime agricole)',
      'TVA : option pour le régime simplifié agricole',
      'Pas de minimum de capital requis',
      'Réduction CFE possible en zone FRUP',
    ],
  },
  {
    icon: <Scale size={24} />,
    title: 'Création simple',
    description: '2 membres minimum, pas de capital minimum, statuts sur mesure. Création en 1 semaine au Tribunal mixte de commerce.',
    details: [
      '2 membres minimum (vs 7 pour une coopérative)',
      'Pas de capital minimum (vs 15 000€ SCC)',
      'Statuts libres (pacte sur mesure)',
      'Immatriculation au RCS en 5 jours',
      'Publication au BODACC en 1 semaine',
      'Coût création ≈ 200-400€ (hors avocat)',
    ],
  },
  {
    icon: <Shield size={24} />,
    title: 'Gouvernance flexible',
    description: 'Les statuts du GIE définissent librement les règles de décision, de répartition des résultats et d\'adhésion.',
    details: [
      'Répartition des voix librement définie',
      'Possibilité de conseil d\'administration restreint',
      'Vote pondéré par l\'apport (possible)',
      'Procédures d\'admission et d\'exclusion sur mesure',
      'Possibilité de membres associés non exploitants',
      'Clauses d\'exclusivité et de non-concurrence possibles',
    ],
  },
  {
    icon: <Landmark size={24} />,
    title: 'Éligible aux aides publiques',
    description: 'Le GIE agricole est reconnu par la DAAF, FranceAgriMer et le FEADER pour les subventions et programmes d\'accompagnement.',
    details: [
      'Éligible FEADER (Fonds européen agricole)',
      'Éligible au Programme de développement rural Martinique',
      'Aide DAAF à l\'investissement collectif',
      'Subvention BPI France (prêt participatif)',
      'Crédit d\'impôt compétitivité (CICE)',
      'Exonération charges patronales en ZRR',
    ],
  },
  {
    icon: <FileText size={24} />,
    title: 'Facturation électronique DGFIP',
    description: 'Le GIE peut émettre des factures électroniques conformes à la loi 2024 et centraliser la facturation pour tous ses membres.',
    details: [
      'Émission de factures au nom du GIE ou des membres',
      'Portail Chorus Pro intégré',
      'Dématérialisation fiscale obligatoire 2026',
      'Télé-déclaration TVA et résultat',
      'Export FEC pour contrôle fiscal',
      'Archivage légal 10 ans',
    ],
  },
]

const GIE_CREATION_STEPS = [
  { step: 1, title: 'Rédiger les statuts', desc: 'Pacte constitutif définissant l\'objet, les membres, la gouvernance, la répartition des résultats', time: '2-3 jours' },
  { step: 2, title: 'Signer l\'acte constitutif', desc: 'Les 2+ membres fondateurs signent les statuts et nomment le(s) gérant(s)', time: '1 jour' },
  { step: 3, title: 'Publier une annonce légale', desc: 'Insertion dans un journal d\'annonces légales habilité en Martinique', time: '1-2 jours, ~150€' },
  { step: 4, title: 'Immatriculer au RCS', desc: 'Dépôt au Tribunal mixte de commerce de Fort-de-France via infogreffe', time: '3-5 jours, ~70€' },
  { step: 5, title: 'Obtenir le SIRET/SIREN', desc: 'INSEE délivre le numéro SIREN dans les 8 jours suivant l\'immatriculation', time: '8 jours' },
  { step: 6, title: 'Ouvrir le compte bancaire', desc: 'Compte professionnel au nom du GIE, mandat de gestion pour le gérant', time: '1-2 semaines' },
]

const COOP_VS_GIE = [
  { criteria: 'Nombre de membres min.', coop: '7', gie: '2' },
  { criteria: 'Capital minimum', coop: '15 000€ (SCC)', gie: 'Aucun' },
  { criteria: 'Types de membres', coop: 'Producteurs uniquement', gie: 'Tous (producteurs, acheteurs, transporteurs, institutions)' },
  { criteria: 'Fiscalité', coop: 'IS (15-25%)', gie: 'Transparent (IR membres)' },
  { criteria: 'Gouvernance', coop: '1 membre = 1 vote', gie: 'Libre (statuts)' },
  { criteria: 'Création', coop: 'Tribunal mixte + SCC', gie: 'Tribunal mixte, simple' },
  { criteria: 'Résultats', coop: 'Ristournes proportionnelles', gie: 'Répartition libre' },
  { criteria: 'Aides publiques', coop: '✅ Oui', gie: '✅ Oui' },
  { criteria: 'Facturation électronique', coop: '✅ Oui', gie: '✅ Oui' },
  { criteria: 'Adapté à KopéAgri', coop: '❌ Non (membres hétérogènes exclus)', gie: '✅ Oui (tous acteurs acceptés)' },
]

export default function GiePage() {
  const [expandedAdv, setExpandedAdv] = useState<number | null>(null)
  const [showComparison, setShowComparison] = useState(true)

  return (
    <div className="page">
      {/* ===== Hero ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #004D40 100%)',
        color: 'white', padding: '48px 24px 56px', borderRadius: 'var(--radius)', marginBottom: 40,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12 }}>
            Structure juridique recommandée
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            GIE — Groupement d'Intérêt Économique
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 28px' }}>
            La structure juridique optimale pour KopéAgri Caraïbes. Un GIE permet à tous les acteurs de la filière agricole
            martiniquaise de se regrouper sans contrainte coopérative.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 22px', borderRadius: 30, fontSize: 14, fontWeight: 600 }}>
              <Scale size={18} /> 2 membres minimum
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 22px', borderRadius: 30, fontSize: 14, fontWeight: 600 }}>
              <TrendingUp size={18} /> Fiscalité transparente
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 22px', borderRadius: 30, fontSize: 14, fontWeight: 600 }}>
              <Users size={18} /> Tous types de membres
            </div>
          </div>
        </div>
      </div>

      {/* ===== Why GIE not Coopérative ===== */}
      <div className="section-block" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>GIE vs Coopérative — Comparaison</h2>
          <button className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setShowComparison(!showComparison)}>
            {showComparison ? <><ChevronUp size={16} /> Réduire</> : <><ChevronDown size={16} /> Détails</>}
          </button>
        </div>
        {showComparison && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--green-200)', color: 'var(--gray-600)', fontWeight: 600 }}>Critère</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '2px solid var(--green-200)', color: 'var(--red-600)', fontWeight: 600 }}>❌ Coopérative</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '2px solid var(--green-700)', color: 'var(--green-900)', fontWeight: 700 }}>✅ GIE</th>
                </tr>
              </thead>
              <tbody>
                {COOP_VS_GIE.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--green-50)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 500, borderBottom: '1px solid var(--gray-100)' }}>{row.criteria}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)', color: 'var(--gray-500)' }}>{row.coop}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)', fontWeight: 600, color: 'var(--green-900)' }}>{row.gie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== 6 Advantages ===== */}
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>6 Avantages du GIE pour KopéAgri</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 40 }}>
        {ADVANTAGES.map((adv, i) => (
          <div key={i} className="section-block" style={{ padding: 24, cursor: 'pointer' }} onClick={() => setExpandedAdv(expandedAdv === i ? null : i)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-700)' }}>
                {adv.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{adv.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>{adv.description.slice(0, 80)}...</p>
              </div>
              {expandedAdv === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedAdv === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, color: 'var(--gray-700)' }}>{adv.description}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {adv.details.map((d, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, marginBottom: 8 }}>
                      <CheckCircle size={16} style={{ color: 'var(--green-600)', marginTop: 2, flexShrink: 0 }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Creation Steps ===== */}
      <div className="section-block" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Création du GIE — 6 étapes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {GIE_CREATION_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: 20, background: 'var(--green-50)', borderRadius: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                {s.step}
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                <span style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 600, marginTop: 6, display: 'inline-block' }}>⏱ {s.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Statut Type ===== */}
      <div className="section-block" style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Modèle de statuts GIE KopéAgri</h2>
          <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => {
            const text = `STATUTS DU GIE KOPÉAGRI CARAÏBES\n\nARTICLE 1 — FORME\nIl est formé entre les soussignés un Groupement d'Intérêt Économique régi par les articles L. 251-1 et suivants du Code de commerce et par les présents statuts.\n\nARTICLE 2 — OBJET\nL'objet du GIE est de faciliter ou de développer l'activité économique de ses membres, d'améliorer ou d'accroître les résultats de cette activité, par la mise en commun de moyens :\n- Plateforme digitale de mise en relation producteurs/acheteurs/transporteurs\n- Mutualisation de la logistique et du transport agricole\n- Centralisation des achats et ventes de produits agricoles\n- Gestion de la facturation électronique conforme DGFIP\n- Organisation de l'export en groupage vers les Caraïbes\n- Accompagnement technique et formation des membres\n\nARTICLE 3 — DÉNOMINATION\nLa dénomination sociale est : GIE KOPÉAGRI CARAÏBES\n\nARTICLE 4 — SIÈGE SOCIAL\nLe siège social est fixé à : Martinique (adresse exacte à compléter)\n\nARTICLE 5 — DURÉE\nLa durée du GIE est de 99 ans à compter de son immatriculation au RCS.\n\nARTICLE 6 — MEMBRES\nLe GIE est composé de membres de toute nature : producteurs, acheteurs, transporteurs, propriétaires fonciers, institutions, transformateurs.\n\nARTICLE 7 — CAPITAL\nIl n'est pas fixé de capital minimum. Les apports sont définis dans l'annexe financière.\n\nARTICLE 8 — GÉRANCE\nLe GIE est administré par un ou plusieurs gérants, personnes physiques ou morales, nommés par l'assemblée générale.\n\nARTICLE 9 — RÉPARTITION DES RÉSULTATS\nLes résultats sont répartis entre les membres conformément aux statuts, selon les clés définies en assemblée générale.\n\nARTICLE 10 — ADHÉSION\nToute personne physique ou morale peut être admise comme membre sur décision du gérant et après accord de l'assemblée.\n\nARTICLE 11 — RETRAIT ET EXCLUSION\nTout membre peut se retirer du GIE à la fin de l'exercice social, moyennant un préavis de 6 mois. L'exclusion est prononcée par l'assemblée générale.\n\nARTICLE 12 — ASSEMBLÉE GÉNÉRALE\nL'assemblée générale ordinaire se réunit au moins une fois par an dans les six mois de la clôture de l'exercice.\n\nARTICLE 13 — EXERCICE SOCIAL\nL'exercice social commence le 1er janvier et se termine le 31 décembre de chaque année.\n\nARTICLE 14 — DISSOLUTION\nLa dissolution du GIE est prononcée par l'assemblée générale extraordinaire. La liquidation est effectuée conformément à la loi.\n\nFait à _______________, le _______________\n\nSignatures des membres fondateurs :`
            const blob = new Blob([text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'Statuts_GIE_KopeAgri_Caraibes.txt'
            a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download size={16} /> Télécharger les statuts
          </button>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: 24, fontSize: 14, lineHeight: 1.8, color: 'var(--gray-700)', maxHeight: 300, overflowY: 'auto' }}>
          <p><strong>ARTICLE 1 — FORME</strong> — Il est formé entre les soussignés un Groupement d'Intérêt Économique régi par les articles L. 251-1 et suivants du Code de commerce.</p>
          <p><strong>ARTICLE 2 — OBJET</strong> — Faciliter l'activité économique des membres par la mise en commun de moyens : plateforme digitale, mutualisation logistique, centralisation achats/ventes, facturation électronique DGFIP, export en groupage.</p>
          <p><strong>ARTICLE 6 — MEMBRES</strong> — Le GIE est composé de membres de toute nature : producteurs, acheteurs, transporteurs, propriétaires fonciers, institutions, transformateurs.</p>
          <p><strong>ARTICLE 7 — CAPITAL</strong> — Il n'est pas fixé de capital minimum.</p>
          <p style={{ color: 'var(--green-700)', fontWeight: 600 }}>→ Téléchargez le document complet pour les 14 articles</p>
        </div>
      </div>

      {/* ===== Fiscal simulator ===== */}
      <FiscalSimulator />

      {/* ===== CTA ===== */}
      <div className="section-block" style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Prêt à créer le GIE KopéAgri ?</h2>
        <p style={{ fontSize: 15, color: 'var(--gray-600)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
          Coût estimé : ~300€ | Délai : 2-3 semaines | 2 membres minimum
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/596696653589?text=Bonjour%2C%20je%20souhaite%20cr%C3%A9er%20le%20GIE%20Kop%C3%A9Agri%20Cara%C3%AFbes.%20Pouvez-vous%20m%27accompagner%20%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Phone size={16} /> Lancer la création via WhatsApp
          </a>
          <a
            href="mailto:vladimir.claveau@gmail.com?subject=Cr%C3%A9ation%20GIE%20Kop%C3%A9Agri%20Cara%C3%AFbes&body=Bonjour%2C%20je%20souhaite%20discuter%20de%20la%20cr%C3%A9ation%20du%20GIE%20Kop%C3%A9Agri%20Cara%C3%AFbes."
            className="btn btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <Mail size={16} /> Contacter par email
          </a>
        </div>
      </div>
    </div>
  )
}

/* ===== Fiscal Simulator Component ===== */
function FiscalSimulator() {
  const [members, setMembers] = useState(10)
  const [revenue, setRevenue] = useState(50000)
  const [expenses, setExpenses] = useState(20000)

  const result = revenue - expenses
  const gieTaxPerMember = result > 0 ? Math.round((result / members) * 0.11) : 0 // Approx IR 11% moyen
  const coopTax = Math.round(result * 0.15) // IS 15% coopérative
  const saving = coopTax - (gieTaxPerMember * members)

  return (
    <div className="section-block" style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Calculator size={24} style={{ color: 'var(--green-700)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Simulateur fiscal GIE vs Coopérative</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Nombre de membres</label>
          <input type="range" min={2} max={50} value={members} onChange={e => setMembers(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-700)' }}>{members}</div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Chiffre d'affaires annuel (€)</label>
          <input type="range" min={10000} max={500000} step={5000} value={revenue} onChange={e => setRevenue(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-700)' }}>{revenue.toLocaleString('fr-FR')}€</div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Charges annuelles (€)</label>
          <input type="range" min={0} max={300000} step={5000} value={expenses} onChange={e => setExpenses(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-700)' }}>{expenses.toLocaleString('fr-FR')}€</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#FFF3E0', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-600)', marginBottom: 8 }}>❌ Coopérative (IS 15%)</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--red-600)' }}>{coopTax.toLocaleString('fr-FR')}€</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>d'impôt sur les sociétés</div>
        </div>
        <div style={{ background: 'var(--green-50)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-700)', marginBottom: 8 }}>✅ GIE (IR transparent)</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--green-700)' }}>{(gieTaxPerMember * members).toLocaleString('fr-FR')}€</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>d'IR total ({gieTaxPerMember}€/membre)</div>
        </div>
      </div>

      {saving > 0 && (
        <div style={{ marginTop: 16, padding: 16, background: 'var(--green-100)', borderRadius: 12, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green-900)' }}>
          💰 Économie GIE vs Coopérative : <span style={{ fontSize: 22 }}>{saving.toLocaleString('fr-FR')}€/an</span>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Fish,
  Tractor,
  ShoppingCart,
  Truck,
  Building2,
  QrCode,
  BookOpen,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'

interface Step {
  title: string
  action: string
}

const GUIDES: { id: string; label: string; icon: React.ReactNode; color: string; intro: string; steps: Step[] }[] = [
  {
    id: 'producteur',
    label: 'Producteur',
    icon: <Tractor size={18} />,
    color: '#2E7D32',
    intro: 'Tu récoltes, tu publies ton lot en 5 minutes, tu vends.',
    steps: [
      { title: '1. Je crée mon compte', action: 'Page « Créer mon compte » → choisis « Producteur », ta commune, ton téléphone. 2 minutes.' },
      { title: '2. Je publie mon lot', action: 'Bouton « Publier mon lot » → produit, quantité, prix, commune, qualité. Tu choisis le canal: circuit court local ou export international.' },
      { title: '3. Je partage mon lot', action: 'Après publication, un lien WhatsApp est prêt automatiquement. Envoie-le à tes acheteurs en 1 clic.' },
      { title: '4. Je reçois une commande', action: "L'acheteur commande depuis la marketplace. Tu vois la commande dans « Mes commandes »." },
      { title: '5. Je livre ou je fais collecter', action: 'Livraison directe ou mission transporteur depuis « Logistique ». Suivi en temps réel.' },
      { title: '6. Je prouve mon origine', action: 'Chaque lot a un QR de traçabilité (niveau D0 à D3). L’acheteur scanne et voit la provenance.' },
      { title: '7. Je suis payé', action: 'Paiement enregistré dans « Facturation ». Historique complet, exportable.' },
    ],
  },
  {
    id: 'pecheur',
    label: 'Pêcheur',
    icon: <Fish size={18} />,
    color: '#0277BD',
    intro: 'Ta pêche du jour, publiée dès le retour au port.',
    steps: [
      { title: '1. Je crée mon compte', action: 'Choisis « Pêcheur », indique ton port et ton téléphone.' },
      { title: '2. Je publie ma pêche du jour', action: '« Publier mon lot » → espèces (thazard, dorade…), quantité en kg, prix, fraîcheur.' },
      { title: '3. Je partage aux acheteurs', action: 'Le lien WhatsApp part en 1 clic aux restaurants, mareyeurs et particuliers.' },
      { title: '4. Je suis contacté en direct', action: 'Les acheteurs voient ton lot sur la marketplace et commandent. La session expire automatiquement à la date que tu fixes.' },
      { title: '5. Je prouve la traçabilité', action: 'QR sur chaque lot: espèce, zone de pêche déclarée, date de capture.' },
    ],
  },
  {
    id: 'acheteur',
    label: 'Acheteur B2B',
    icon: <ShoppingCart size={18} />,
    color: '#C62828',
    intro: 'Hôtels, restaurants, collectivités, grossistes: achète direct au producteur.',
    steps: [
      { title: '1. Je crée mon compte', action: 'Choisis « Acheteur B2B » avec le nom de ta société.' },
      { title: '2. Je consulte la marketplace', action: 'Filtre par canal (circuit court local / export international), statut, commune, produit.' },
      { title: '3. Je pose une demande d’achat', action: 'Pas le bon produit ? Publie une demande d’achat avec budget et date limite. Les producteurs la voient.' },
      { title: '4. Je commande', action: 'Quantité, prix, livraison. Le producteur est notifié immédiatement.' },
      { title: '5. Je vérifie l’origine', action: 'Scanne le QR du lot: provenance, producteur, niveau de traçabilité D0–D3.' },
    ],
  },
  {
    id: 'transporteur',
    label: 'Transporteur',
    icon: <Truck size={18} />,
    color: '#E65100',
    intro: 'Missions de collecte et livraison, frigorifique ou standard.',
    steps: [
      { title: '1. Je crée mon compte', action: 'Choisis « Transporteur », précise tes services (frigorifique, groupage, transit portuaire…).' },
      { title: '2. Je consulte les missions', action: 'Page « Logistique »: demandes de collecte et livraison près de toi.' },
      { title: '3. Je propose mes services', action: 'Les appels d’offres transport sont publiés. Réponds avec ton prix et ton délai.' },
      { title: '4. Je livre', action: 'Statut mis à jour en temps réel, l’acheteur et le producteur suivent la livraison.' },
    ],
  },
  {
    id: 'institution',
    label: 'Institution',
    icon: <Building2 size={18} />,
    color: '#4527A0',
    intro: 'Mairies, DEAL, chambres d’agriculture: pilote les flux de la filière.',
    steps: [
      { title: '1. Je crée mon compte', action: 'Choisis « Institution » avec ton organisation.' },
      { title: '2. Je suis le dashboard', action: 'Indicateurs: lots publiés, flux local/export, anti-gaspillage, demandes d’achat.' },
      { title: '3. J’exporte les données', action: 'Export CSV de la marketplace (canal, produit, commune, prix) pour tes rapports.' },
    ],
  },
]

const FAQ = [
  {
    q: 'Ça coûte combien ?',
    a: 'Le pilote Martinique est gratuit pour les premiers inscrits. Les offres payantes arrivent avec les fonctionnalités GIE (facturation, consolidation). Voir la page Tarifs.',
  },
  {
    q: 'Ça marche sans réseau ?',
    a: 'Oui. Le site fonctionne en mode faible connexion: tes données restent sur ton téléphone et se synchronisent quand le réseau revient.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Tes données sensibles (SIRET, RIB, téléphone) ne sont jamais affichées publiquement. Détails complets sur la page Mentions légales & RGPD.',
  },
  {
    q: 'Comment fonctionne la traçabilité ?',
    a: 'Chaque lot reçoit un QR avec un niveau de D0 (déclaré) à D3 (validé par un tiers). Aucune certification automatique: la confiance se prouve, elle ne se promet pas.',
  },
  {
    q: 'Je vends en export, comment ça marche ?',
    a: 'Dans la marketplace, choisis le canal « Export international »: groupage, documentation et transit sont gérés comme un flux long dédié.',
  },
]

const GuidePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="guide-hero">
        <span className="guide-badge"><BookOpen size={14} /> Mode d’emploi</span>
        <h1>Comment utiliser KopéAgri</h1>
        <p>Le guide complet, profil par profil. Chaque étape est une action concrète sur le site.</p>
        <div className="guide-hero-cta">
          <Link to="/sell-now" className="btn btn-primary">Publier mon lot <ArrowRight size={15} /></Link>
          <Link to="/demo" className="btn btn-outline">Essayer la démo</Link>
        </div>
      </div>

      {GUIDES.map(g => (
        <section key={g.id} className="guide-profile" style={{ borderLeft: `4px solid ${g.color}` }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: g.color }}>{g.icon}</span> Je suis {g.label.toLowerCase()}
          </h2>
          <p className="guide-intro">{g.intro}</p>
          <ol className="guide-steps">
            {g.steps.map((s, i) => (
              <li key={i}>
                <strong>{s.title}</strong>
                <span>{s.action}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="guide-profile" style={{ borderLeft: '4px solid #00897B' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <QrCode size={18} style={{ color: '#00897B' }} /> La traçabilité QR, en 30 secondes
        </h2>
        <ol className="guide-steps">
          <li><strong>Tu publies un lot</strong><span>Un QR unique est généré automatiquement.</span></li>
          <li><strong>Tu l’affiches</strong><span>Imprime-le ou partage le lien public du lot par WhatsApp.</span></li>
          <li><strong>L’acheteur scanne</strong><span>Il voit: produit, producteur, commune, date, niveau de traçabilité D0–D3.</span></li>
        </ol>
      </section>

      <section className="guide-faq">
        <h2>Questions fréquentes</h2>
        {FAQ.map((f, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {f.q}
              <ChevronDown size={16} style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openFaq === i && <p className="faq-a">{f.a}</p>}
          </div>
        ))}
      </section>

      <div className="guide-footer">
        <p>Une question, une aide pour t’inscrire ?</p>
        <a
          href="https://wa.me/596696653589?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide%20pour%20Kop%C3%A9Agri"
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} /> Aide par WhatsApp
        </a>
        <Link to="/" className="btn btn-outline">Retour à l’accueil</Link>
      </div>
    </div>
  )
}

export default GuidePage

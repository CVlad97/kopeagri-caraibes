import React from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  CheckCircle2,
  FileText,
  QrCode,
  Truck,
  ShieldCheck,
  ClipboardList,
  MessageCircle,
  CalendarCheck,
  Boxes,
} from 'lucide-react'

const REQUIREMENTS = [
  {
    icon: <FileText size={16} />,
    need: 'Extrait Kbis / attestation SIRET',
    answer: 'Le pilote prévoit de vérifier l’identité professionnelle et les justificatifs utiles avant de qualifier un producteur pour un flux export.',
  },
  {
    icon: <ShieldCheck size={16} />,
    need: 'MSA + assurance RC pro à jour',
    answer: 'Une checklist export peut centraliser MSA, RC pro et attestations utiles ; aucun statut conforme ne doit être affiché sans justificatif vérifié.',
  },
  {
    icon: <CheckCircle2 size={16} />,
    need: 'Certification Bio / HVE / autre',
    answer: 'Les certifications peuvent être associées au lot uniquement après contrôle d’une pièce justificative ; aucun badge ne vaut certification autonome de KopéAgri.',
  },
  {
    icon: <QrCode size={16} />,
    need: 'Registre de traçabilité des lots',
    answer: 'Le démonstrateur associe un identifiant/QR au lot et peut conserver les informations de traçabilité utiles ; le niveau de preuve dépend des justificatifs réellement collectés.',
  },
  {
    icon: <ClipboardList size={16} />,
    need: 'Fiche produit (variété, méthode culturale, traitements)',
    answer: 'Le formulaire de publication du lot comprend: variété, qualité (Extra/Classe I…), certifications et description libre pour la méthode culturale.',
  },
  {
    icon: <Boxes size={16} />,
    need: 'Conditionnement + calibres dominants',
    answer: 'Le canal « Export international » de la marketplace intègre unité, calibre et conditionnement dès la publication du lot.',
  },
  {
    icon: <Truck size={16} />,
    need: 'Coordonnées du transitaire',
    answer: 'La plateforme peut référencer et comparer des transporteurs/transitaires pour la collecte, le groupage et le transit ; chaque prestataire reste à contractualiser pour le flux concerné.',
  },
  {
    icon: <CalendarCheck size={16} />,
    need: 'Volumes réguliers, récolte proche de l’expédition',
    answer: 'Le calendrier de production par culture et les dates de disponibilité par lot permettent de planifier les volumes à la commande confirmée.',
  },
]

const ExportProPage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 920, margin: '0 auto' }}>
      <div className="guide-hero">
        <span className="guide-badge"><Globe size={14} /> Distributeurs métropole & international</span>
        <h1>Préparez un approvisionnement martiniquais traçable, du lot au débouché</h1>
        <p>
          Vous êtes primeur indépendant, restaurant, grossiste ou transitaire en métropole ?
          KopéAgri propose un cadre pilote pour identifier les producteurs, documenter les lots, préparer les pièces de conformité et organiser la traçabilité avant tout engagement export.
        </p>
        <div className="guide-hero-cta">
          <a
            href="https://wa.me/596696653589?text=Bonjour%2C%20nous%20sommes%20distributeur%20en%20m%C3%A9tropole%20et%20souhaitons%20la%20fili%C3%A8re%20export%20Kop%C3%A9Agri"
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} /> Ouvrir le dialogue
          </a>
          <Link to="/demo" className="btn btn-outline">Explorer le parcours en démo</Link>
        </div>
      </div>

      <section className="guide-profile">
        <div className="guide-note"><strong>Pilote :</strong> aucune offre export n’est considérée disponible, conforme ou contractualisée tant que producteur, volume, documents, transport, assurance, prix et destinataire n’ont pas été validés.</div>
        <h2>Votre exigence de conformité, ce que le pilote doit documenter</h2>
        <p className="guide-intro">
          Les distributeurs professionnels exigent des documents et de la traçabilité. Le démonstrateur organise ces informations, mais chaque pièce et chaque statut doivent être vérifiés avant un flux commercial réel.
        </p>
        <ol className="guide-steps">
          {REQUIREMENTS.map((r, i) => (
            <li key={i}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {r.icon} {r.need}
              </strong>
              <span>{r.answer}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="guide-profile" style={{ borderLeft: '4px solid #1565C0' }}>
        <h2>Comment se passe un partenariat export</h2>
        <ol className="guide-steps">
          <li><strong>1. Nous échangeons</strong><span>Vos besoins: produits, volumes, périodes, logistique. Nous identifions les exploitations conformes.</span></li>
          <li><strong>2. Dossier producteur</strong><span>Vous recevez le dossier export de chaque exploitation: SIRET, attestations, certifications, calendrier de production.</span></li>
          <li><strong>3. Commande confirmée</strong><span>Pas de spéculation: chaque expédition part sur commande ferme. Les volumes sont sécurisés sans pression sur la production.</span></li>
          <li><strong>4. Suivi complet</strong><span>Lot tracé par QR (D0→D3), conditionnement documenté, transitaire coordonné, livraison suivie jusqu’à réception.</span></li>
        </ol>
      </section>

      <section className="trust-strip">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <ShieldCheck size={20} /> Réciprocité de conformité
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, marginTop: 0 }}>
          Nous appliquons à nos partenaires distributeurs la même exigence qu’aux producteurs:
          extrait Kbis ou attestation SIRET, attestation de conformité et références.
          Les données personnelles des producteurs (téléphone, RIB) ne sont transmises
          qu’après validation mutuelle des dossiers.
        </p>
      </section>

      <div className="guide-footer">
        <p>Producteur martiniquais prêt pour l’export ?</p>
        <Link to="/sell-now" className="btn btn-primary">Publier un lot export</Link>
        <Link to="/guide" className="btn btn-outline">Mode d’emploi</Link>
      </div>
    </div>
  )
}

export default ExportProPage

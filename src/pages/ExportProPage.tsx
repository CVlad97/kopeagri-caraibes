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
    answer: 'Chaque producteur membre complète son profil: SIRET vérifiable, statut d’exploitation. Les documents officiels sont archivés dans le dossier export du producteur, jamais affichés publiquement.',
  },
  {
    icon: <ShieldCheck size={16} />,
    need: 'MSA + assurance RC pro à jour',
    answer: 'La checklist export du producteur affiche son état de conformité (MSA, RC pro, attestations sanitaires) avant tout échange commercial.',
  },
  {
    icon: <CheckCircle2 size={16} />,
    need: 'Certification Bio / HVE / autre',
    answer: 'Les certifications sont attachées au lot (badge visible sur la marketplace) avec pièce justificative au niveau de traçabilité D2.',
  },
  {
    icon: <QrCode size={16} />,
    need: 'Registre de traçabilité des lots',
    answer: 'Chaque lot publié génère un QR unique: producteur, commune, date, variété, niveau de preuve D0→D3. Historique exportable (CSV).',
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
    answer: 'Le réseau transporteurs/transitaires de la plateforme (collecte, groupage, transit portuaire, documentation export) couvre ce besoin.',
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
        <h1>Achetez des produits authentiques de Martinique, en direct des exploitations</h1>
        <p>
          Vous êtes primeur indépendant, restaurant, grossiste ou transitaire en métropole ?
          KopéAgri structure la filière export martiniquaise: producteurs identifiés,
          conformité documentée, traçabilité QR de la parcelle au colis.
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
          <Link to="/marketplace" className="btn btn-outline">Voir les lots export</Link>
        </div>
      </div>

      <section className="guide-profile">
        <h2>Votre exigence de conformité, notre organisation</h2>
        <p className="guide-intro">
          Les distributeurs professionnels exigent des documents et de la traçabilité.
          La plateforme est construite pour y répondre point par point:
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

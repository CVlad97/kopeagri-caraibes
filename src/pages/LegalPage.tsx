import React from 'react'
import { Shield, FileText, Lock, Phone, MapPin, AlertTriangle, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const pStyle: React.CSSProperties = { fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }
const h3Style: React.CSSProperties = { fontSize: 17, fontWeight: 700, marginTop: 18, marginBottom: 8 }

const LegalPage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="page-header">
        <h1><FileText size={24} /> Mentions légales, conditions d’usage et RGPD</h1>
        <p className="page-subtitle">Version pilote Martinique — à valider avant lancement commercial</p>
      </div>

      <div className="section-block" style={{ border: '1px solid #fde68a', background: '#fffbeb' }}>
        <h2><AlertTriangle size={18} /> Avertissement important</h2>
        <p style={pStyle}>
          Cette plateforme est actuellement une démonstration fonctionnelle. Les services commerciaux,
          paiements, adhésions, agréments, assurances, conditions contractuelles, obligations sanitaires
          et obligations fiscales devront être validés avant lancement officiel.
        </p>
      </div>

      <div className="section-block">
        <h2><Shield size={18} /> 1) Mentions légales</h2>

        <h3 style={h3Style}>Éditeur</h3>
        <p style={pStyle}>
          <strong>KopéAgri Caraïbes</strong><br />
          Projet en structuration : GIE / société coopérative agricole / autre forme à valider juridiquement<br />
          SIRET : en cours de validation<br />
          N° TVA intracommunautaire : en cours de validation<br />
          Agrément coopératif : non déclaré comme obtenu à ce stade<br />
          Territoire pilote : Martinique<br />
          Contact : <a href="https://wa.me/596696653589" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>WhatsApp +596 696 65 35 89</a><br />
          Référent publication : Vladimir Claveau
        </p>

        <h3 style={h3Style}>Hébergement et services techniques</h3>
        <p style={pStyle}>
          Frontend : GitHub Pages (GitHub Inc.)<br />
          Backend / base de données : Supabase prévu ou en cours de configuration selon environnement<br />
          Paiement : Stripe ou autre prestataire prévu uniquement après validation KYC, CGV, assurance et conformité<br />
          Certaines fonctions utilisent le stockage local navigateur pour la démo et les brouillons terrain.
        </p>
      </div>

      <div className="section-block">
        <h2><FileText size={18} /> 2) Conditions d’usage pilote</h2>

        <h3 style={h3Style}>Objet</h3>
        <p style={pStyle}>
          KopéAgri Caraïbes fournit une démonstration d’outil de publication de lots, mutualisation de parcelles,
          partage de ressources, mise en relation, coordination logistique, traçabilité QR code et préparation
          de ventes locales, caribéennes ou export.
        </p>

        <h3 style={h3Style}>Commissions et paiements</h3>
        <p style={pStyle}>
          Les commissions, abonnements, frais de service, reversements et modes de règlement affichés dans
          l’application sont des hypothèses de travail. Ils doivent être validés juridiquement, fiscalement,
          contractuellement et techniquement avant encaissement réel.
        </p>

        <h3 style={h3Style}>Traçabilité et niveaux de preuve</h3>
        <p style={pStyle}>
          D0 : déclaré par l’opérateur<br />
          D1 : recoupé avec source publique ou donnée métier<br />
          D2 : document justificatif ajouté<br />
          D3 : validation tierce identifiée
        </p>

        <h3 style={h3Style}>Responsabilité</h3>
        <p style={pStyle}>
          Chaque opérateur reste responsable de ses déclarations, prix, disponibilités, conformité sanitaire,
          documents, factures, obligations sociales, fiscales, agricoles, de transport et d’export. La plateforme
          facilite les échanges sans se substituer aux autorités de contrôle ni aux contrats entre parties.
        </p>
      </div>

      <div className="section-block">
        <h2><Shield size={18} /> 3) Cadre juridique et agrément à sécuriser</h2>

        <h3 style={h3Style}>GIE</h3>
        <p style={pStyle}>
          Un groupement d’intérêt économique peut permettre à plusieurs membres de mutualiser des moyens
          tout en conservant leur activité propre. Ce choix doit être formalisé par des statuts, une immatriculation
          et une analyse des responsabilités entre membres.<br />
          Source utile : <a href="https://entreprendre.service-public.fr/vosdroits/F37404" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>Service-Public / Entreprendre — Groupement d’intérêt économique</a>.
        </p>

        <h3 style={h3Style}>Société coopérative agricole</h3>
        <p style={pStyle}>
          Si le projet devient une société coopérative agricole, les règles d’adhésion, de gouvernance,
          d’agrément et de contrôle doivent être validées dans le cadre applicable à la coopération agricole.<br />
          Source utile : <a href="https://www.hcca.coop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>Haut Conseil de la Coopération Agricole</a>.
        </p>

        <h3 style={h3Style}>Export végétal et produits frais</h3>
        <p style={pStyle}>
          Les envois de végétaux frais et produits agricoles depuis la Martinique peuvent être soumis à certificats,
          restrictions, exemptions ou interdictions selon les produits et destinations. Chaque flux export doit être
          vérifié avant promesse commerciale.<br />
          Source utile : <a href="https://daaf.martinique.agriculture.gouv.fr/envoi-de-vegetaux-vers-la-france-et-l-ue-strictement-reglementee-a650.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>DAAF Martinique — envoi de végétaux vers la France et l’UE</a>.
        </p>
      </div>

      <div className="section-block">
        <h2><Lock size={18} /> 4) Données personnelles (RGPD)</h2>

        <h3 style={h3Style}>Principes</h3>
        <p style={pStyle}>
          Minimisation des données, finalités explicites, sécurité par rôle, Row Level Security côté Supabase,
          journalisation des actions sensibles et protection des données privées. Les informations privées
          comme RIB, téléphone privé, email privé, adresse exacte ou documents justificatifs ne doivent pas
          être affichées publiquement.
        </p>

        <h3 style={h3Style}>Droits</h3>
        <p style={pStyle}>
          Droit d’accès, rectification, effacement, limitation, opposition et portabilité.
          Contact RGPD : <a href="https://wa.me/596696653589?text=Demande%20RGPD%20-%20Kop%C3%A9Agri" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>WhatsApp +596 696 65 35 89</a>.
          Réclamation possible auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>www.cnil.fr</a>.
        </p>

        <h3 style={h3Style}>Stockage local / cookies</h3>
        <p style={pStyle}>
          Le navigateur peut stocker certaines données techniques, brouillons et informations de démo pour
          améliorer l’usage terrain. Aucun mécanisme publicitaire tiers n’est activé par défaut.
        </p>
      </div>

      <div className="section-block">
        <h2><Phone size={18} /> 5) Contact</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Phone size={16} /> <a href="https://wa.me/596696653589" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>WhatsApp : +596 696 65 35 89</a>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <MapPin size={16} /> Martinique — localisation administrative à compléter avant lancement commercial
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <BookOpen size={16} /> <Link to="/guide" style={{ color: 'var(--green-700)' }}>Mode d’emploi de la plateforme</Link>
          </p>
        </div>
        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--gray-400)' }}>
          Dernière mise à jour : septembre 2026 — version pilote à valider juridiquement.
        </p>
      </div>
    </div>
  )
}

export default LegalPage

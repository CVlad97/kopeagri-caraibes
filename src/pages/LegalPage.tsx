import React from 'react'
import { Shield, FileText, Lock, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react'

const pStyle: React.CSSProperties = { fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }
const h3Style: React.CSSProperties = { fontSize: 17, fontWeight: 700, marginTop: 18, marginBottom: 8 }

const LegalPage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="page-header">
        <h1><FileText size={24} /> Mentions légales, conditions d’usage et RGPD</h1>
        <p className="page-subtitle">Version pilote Martinique — fusion V1</p>
      </div>

      <div className="section-block" style={{ border: '1px solid #fde68a' }}>
        <h2><AlertTriangle size={18} /> Avertissement important (version pilote)</h2>
        <p style={pStyle}>
          Cette plateforme est une version pilote. Les informations affichées sont opérationnelles,
          mais ne remplacent pas les obligations réglementaires, déclaratives, fiscales et contractuelles
          de chaque opérateur.
        </p>
      </div>

      <div className="section-block">
        <h2><Shield size={18} /> 1) Mentions légales</h2>

        <h3 style={h3Style}>Éditeur</h3>
        <p style={pStyle}>
          <strong>Kopé Agri & Pêche</strong><br />
          Projet en structuration (GIE / coopérative à valider juridiquement)<br />
          Territoire pilote : Martinique (Fort-de-France)<br />
          Contact : <a href="mailto:contact@kopeagri.mq" style={{ color: 'var(--green-700)' }}>contact@kopeagri.mq</a><br />
          Référent publication : Vladimir Claveau
        </p>

        <h3 style={h3Style}>Hébergement et services techniques</h3>
        <p style={pStyle}>
          Frontend : GitHub Pages (GitHub Inc.)<br />
          Backend / base : Supabase (Supabase Inc.)<br />
          Certaines fonctions utilisent le stockage local navigateur (mode local/démo).
        </p>
      </div>

      <div className="section-block">
        <h2><FileText size={18} /> 2) Conditions d’usage (pilote)</h2>

        <h3 style={h3Style}>Objet</h3>
        <p style={pStyle}>
          Kopé Agri & Pêche fournit un outil de publication de lots, mise en relation,
          coordination logistique et partage d’éléments de traçabilité.
        </p>

        <h3 style={h3Style}>Commissions et paiements (paramétrage pilote)</h3>
        <p style={pStyle}>
          Les commissions et modes de règlement affichés dans l’application sont des paramètres de fonctionnement
          du pilote. Ils doivent être validés juridiquement et contractuellement avant un lancement public large.
        </p>

        <h3 style={h3Style}>Traçabilité et niveaux de preuve</h3>
        <p style={pStyle}>
          D0 : déclaré par l’opérateur<br />
          D1 : recoupé avec source publique<br />
          D2 : document justificatif ajouté<br />
          D3 : validation tierce identifiée
        </p>

        <h3 style={h3Style}>Responsabilité</h3>
        <p style={pStyle}>
          Chaque opérateur reste responsable de ses déclarations, prix, disponibilités, conformités
          et obligations légales. La plateforme facilite les échanges sans se substituer aux autorités
          de contrôle ni aux engagements contractuels entre parties.
        </p>
      </div>

      <div className="section-block">
        <h2><Lock size={18} /> 3) Données personnelles (RGPD)</h2>

        <h3 style={h3Style}>Principes</h3>
        <p style={pStyle}>
          Minimisation des données, finalités explicites, sécurité par rôle et protection des données sensibles.
          Les informations privées (RIB, téléphone privé, email privé, adresse exacte) ne sont pas affichées publiquement.
        </p>

        <h3 style={h3Style}>Droits</h3>
        <p style={pStyle}>
          Droit d’accès, rectification, effacement, limitation, opposition, portabilité.
          Contact RGPD : <a href="mailto:dpo@kopeagri.mq" style={{ color: 'var(--green-700)' }}>dpo@kopeagri.mq</a>.
          Réclamation possible auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>www.cnil.fr</a>.
        </p>

        <h3 style={h3Style}>Stockage local / cookies</h3>
        <p style={pStyle}>
          Le navigateur peut stocker certaines données techniques et brouillons en local pour améliorer l’usage terrain.
          Aucun mécanisme publicitaire tiers n’est activé par défaut.
        </p>
      </div>

      <div className="section-block">
        <h2><Mail size={18} /> 4) Contact</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Mail size={16} /> <a href="mailto:contact@kopeagri.mq" style={{ color: 'var(--green-700)' }}>contact@kopeagri.mq</a>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Phone size={16} /> Contact opérationnel : 0696 00 00 00
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <MapPin size={16} /> Fort-de-France, Martinique
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Lock size={16} /> DPO : <a href="mailto:dpo@kopeagri.mq" style={{ color: 'var(--green-700)' }}>dpo@kopeagri.mq</a>
          </p>
        </div>
        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--gray-400)' }}>
          Dernière mise à jour : août 2026 — Version fusionnée V1.
        </p>
      </div>
    </div>
  )
}

export default LegalPage

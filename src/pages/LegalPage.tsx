import React from 'react'
import { Shield, FileText, Lock, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react'

const pStyle: React.CSSProperties = { fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }
const h3Style: React.CSSProperties = { fontSize: 17, fontWeight: 700, marginTop: 18, marginBottom: 8 }

const LegalPage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="page-header">
        <h1><FileText size={24} /> Mentions légales, conditions d’usage et RGPD</h1>
        <p className="page-subtitle">Version pilote Martinique — informations non trompeuses et cadre de confiance</p>
      </div>

      <div className="section-block" style={{ border: '1px solid #fde68a' }}>
        <h2><AlertTriangle size={18} /> Avertissement important (version 1 pilote)</h2>
        <p style={pStyle}>
          Cette plateforme est une version pilote. Les éléments affichés constituent une aide opérationnelle
          pour la vente, la logistique et la traçabilité. Ils ne remplacent pas les obligations réglementaires,
          déclaratives ou fiscales de chaque opérateur.
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
          Certaines fonctions peuvent utiliser un stockage local navigateur (mode local/démo).
        </p>

        <h3 style={h3Style}>Propriété intellectuelle</h3>
        <p style={pStyle}>
          Les contenus originaux de la plateforme (textes, structure, composants, visuels propriétaires)
          sont protégés. Toute réutilisation substantielle nécessite autorisation.
        </p>
      </div>

      <div className="section-block">
        <h2><FileText size={18} /> 2) Conditions d’usage (version pilote)</h2>

        <h3 style={h3Style}>Objet</h3>
        <p style={pStyle}>
          Kopé Agri & Pêche fournit un outil numérique de mise en relation, publication de lots,
          coordination logistique et traçabilité déclarative.
        </p>

        <h3 style={h3Style}>Rôle de la plateforme</h3>
        <p style={pStyle}>
          La plateforme facilite les échanges entre producteurs, pêcheurs, acheteurs, transporteurs et structures d’appui.
          Elle ne se substitue ni aux contrôles publics, ni aux obligations contractuelles entre parties.
        </p>

        <h3 style={h3Style}>Traçabilité et niveaux de preuve</h3>
        <p style={pStyle}>
          Les informations de lot peuvent être classées par niveau D0 à D3 :<br />
          D0 : déclaré par l’opérateur<br />
          D1 : recoupé avec une source publique<br />
          D2 : document justificatif attaché<br />
          D3 : validation tierce identifiée
        </p>

        <h3 style={h3Style}>Limites et responsabilités</h3>
        <p style={pStyle}>
          Chaque opérateur reste responsable de l’exactitude de ses déclarations, de ses prix,
          de la conformité de ses produits et de ses obligations légales. En cas de litige commercial,
          les parties concernées restent responsables de leur relation contractuelle.
        </p>
      </div>

      <div className="section-block">
        <h2><Lock size={18} /> 3) Données personnelles (RGPD)</h2>

        <h3 style={h3Style}>Principes</h3>
        <p style={pStyle}>
          Les données sont traitées selon les principes de minimisation, finalité et sécurité.
          Les données sensibles ne sont pas rendues publiques par défaut.
        </p>

        <h3 style={h3Style}>Données potentiellement traitées</h3>
        <p style={pStyle}>
          Identité professionnelle, coordonnées de contact, informations de lot,
          données de transaction et journaux techniques nécessaires au fonctionnement.
        </p>

        <h3 style={h3Style}>Droits des personnes</h3>
        <p style={pStyle}>
          Droit d’accès, rectification, effacement, limitation, opposition, portabilité.
          Contact RGPD : <a href="mailto:dpo@kopeagri.mq" style={{ color: 'var(--green-700)' }}>dpo@kopeagri.mq</a>.
          Vous pouvez également saisir la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>www.cnil.fr</a>.
        </p>

        <h3 style={h3Style}>Cookies / stockage local</h3>
        <p style={pStyle}>
          La plateforme utilise principalement le stockage local navigateur pour certaines fonctionnalités
          (ex: brouillons, préférences, mode local). Pas de dispositif publicitaire tiers intégré par défaut.
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
          Dernière mise à jour : août 2026 — Version pilote 1.
        </p>
      </div>
    </div>
  )
}

export default LegalPage

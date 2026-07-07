import React from 'react'
import { Leaf, Shield, FileText, Lock, Mail, Phone, MapPin } from 'lucide-react'

const LegalPage: React.FC = () => {
  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1><FileText size={24} /> Mentions légales & CGV</h1>
        <p className="page-subtitle">Informations légales, conditions générales et politique RGPD</p>
      </div>

      {/* MENTIONS LÉGALES */}
      <div className="section-block">
        <h2><Shield size={18} /> Mentions légales</h2>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>1. Éditeur de la plateforme</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          <strong>KopéAgri Caraïbes</strong> — Coopérative agricole digitale<br />
          Forme juridique : Société Coopérative Agricole (SCA) en cours d'immatriculation<br />
          Siège social : Martinique, 97200 Fort-de-France<br />
          Email : <a href="mailto:contact@kopeagri.mq" style={{ color: 'var(--green-700)' }}>contact@kopeagri.mq</a><br />
          Téléphone : 0696 00 00 00<br />
          SIRET : En cours d'attribution<br />
          N° TVA intracommunautaire : En cours d'attribution<br />
          Directeur de la publication : Vladimir Claveau
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>2. Hébergement</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          La plateforme est hébergée par GitHub Pages (GitHub Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA).<br />
          Les données applicatives sont stockées via Supabase Inc. (2701 N 1st St, San Jose, CA 95134, USA) ou en localStorage côté client en mode démo.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>3. Propriété intellectuelle</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          L'ensemble des contenus de la plateforme (textes, images, logos, design) est la propriété de KopéAgri Caraïbes ou de ses contributeurs. Toute reproduction sans autorisation est interdite.
        </p>
      </div>

      {/* CGV */}
      <div className="section-block">
        <h2><FileText size={18} /> Conditions Générales de Vente</h2>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Article 1 — Objet</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les présentes CGV régissent les relations entre KopéAgri Caraïbes (la coopérative) et ses adhérents (producteurs, transporteurs, acheteurs B2B, institutions) pour l'utilisation de la plateforme de mise en relation et de services agricoles.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 2 — Adhésion</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          L'adhésion à la coopérative est ouverte à toute personne physique ou morale exerçant une activité agricole, logistique ou commerciale dans la zone Caraïbe. L'adhésion implique l'acceptation des présentes CGV et du règlement intérieur. Quatre plans sont proposés : Grati (gratuit), Standard, Premium, Plantasyon — chacun avec un taux de commission distinct.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 3 — Commissions</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          KopéAgri perçoit une commission sur chaque transaction réalisée via la plateforme :<br />
          • Plan Grati : 6% du montant HT<br />
          • Plan Standard : 4% du montant HT<br />
          • Plan Premium : 3% du montant HT<br />
          • Plan Plantasyon : 2% du montant HT<br /><br />
          La commission est prélevée sur le règlement de l'acheteur avant reversement au producteur. Les factures sont émises mensuellement et disponibles dans l'espace adhérent.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 4 — Paiement</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les paiements sont sécurisés via Stripe (carte bancaire, virement) ou par voie conventionnelle (chèque, espèces). Le reversement au producteur est effectué sous 5 jours ouvrés après encaissement de la commande, déduction faite de la commission.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 5 — Livraison & Logistique</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          La livraison est assurée par les transporteurs partenaires de la coopérative. Les délais varient selon la destination (Martinique : J+1, Caraïbe : J+3 à J+7, International : J+10 à J+21). Le transport frigorifique est obligatoire pour les produits périssables. KopéAgri ne saurait être tenue responsable des retards imputables aux transporteurs.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 6 — Qualité & Conformité</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les producteurs s'engagent à fournir des produits conformes aux normes sanitaires en vigueur (DGAL, ARS Martinique) et aux critères de qualité déclarés. La traçabilité est assurée via QR code pour chaque lot. En cas de non-conformité avérée, l'acheteur peut demander le remboursement dans les 48h suivant la livraison.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 7 — Responsabilité</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          KopéAgri est une plateforme de mise en relation. La coopérative ne garantit ni la disponibilité permanente des produits, ni l'exactitude des informations fournies par les adhérents. KopéAgri ne saurait être tenue responsable des litiges entre adhérents, qui relèvent du droit commercial ordinaire.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 8 — Résiliation</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Tout adhérent peut résilier son adhésion à tout moment par notification écrite. Les commissions en cours restent dues. Les données personnelles sont traitées conformément à notre politique RGPD (voir ci-dessous).
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>Article 9 — Droit applicable</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les présentes CGV sont soumises au droit français. Tout litige relève de la compétence des juridictions de Fort-de-France, Martinique.
        </p>
      </div>

      {/* RGPD */}
      <div className="section-block">
        <h2><Lock size={18} /> Politique de Protection des Données (RGPD)</h2>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>1. Responsable du traitement</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          KopéAgri Caraïbes, en sa qualité de responsable de traitement, traite les données personnelles des adhérents et utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD – UE 2016/679) et à la loi Informatique et Libertés.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>2. Données collectées</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Nous collectons les données strictement nécessaires :<br />
          • <strong>Identité</strong> : nom, prénom, numéro de téléphone, email<br />
          • <strong>Localisation</strong> : commune, coordonnées GPS (si consentement)<br />
          • <strong>Activité</strong> : type de production, cultures, certifications, volumes<br />
          • <strong>Financier</strong> : données de facturation, historique des transactions<br />
          • <strong>Technique</strong> : logs de connexion, navigateur, appareil
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>3. Finalités du traitement</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les données sont utilisées pour :<br />
          • Gérer les adhésions et comptes adhérents<br />
          • Faciliter la mise en relation entre producteurs et acheteurs<br />
          • Traiter les commandes et les paiements<br />
          • Émettre les factures et gérer les commissions<br />
          • Améliorer la plateforme et les services<br />
          • Répondre aux obligations légales et fiscales
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>4. Durée de conservation</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les données sont conservées pendant la durée de l'adhésion puis 5 ans après la fin de la relation contractuelle (obligation comptable et fiscale). Les données de prospection sont conservées 3 ans après le dernier contact.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>5. Vos droits</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Conformément au RGPD, vous disposez des droits suivants :<br />
          • <strong>Droit d'accès</strong> : obtenir une copie de vos données<br />
          • <strong>Droit de rectification</strong> : corriger des données inexactes<br />
          • <strong>Droit à l'effacement</strong> : demander la suppression de vos données<br />
          • <strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré<br />
          • <strong>Droit d'opposition</strong> : vous opposer au traitement pour des raisons légitimes<br />
          • <strong>Droit à la limitation</strong> : limiter le traitement en cas de contestation<br /><br />
          Pour exercer vos droits : <a href="mailto:dpo@kopeagri.mq" style={{ color: 'var(--green-700)' }}>dpo@kopeagri.mq</a>
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>6. Sous-traitants</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Les données peuvent être transférées aux sous-traitants suivants :<br />
          • <strong>Supabase</strong> (hébergement base de données, USA) — conformité EU-US Data Privacy Framework<br />
          • <strong>Stripe</strong> (paiement, USA/Irlande) — conforme PCI-DSS<br />
          • <strong>GitHub Pages</strong> (hébergement site, USA)<br />
          • <strong>Twillio</strong> (notifications WhatsApp/SMS, USA/Irlande)<br />
          • <strong>Resend</strong> (notifications email, USA)<br /><br />
          Chaque sous-traitant est lié par un accord de traitement des données conforme à l'art. 28 RGPD.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>7. Sécurité</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          KopéAgri met en œuvre des mesures techniques et organisationnelles appropriées : chiffrement TLS, Row Level Security (RLS), authentification sécurisée, accès restreint par rôle, audit logs. En cas de violation de données, les autorités (CNIL) et les personnes concernées seront notifiées dans les 72h conformément à l'art. 33 RGPD.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>8. Cookies</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          La plateforme utilise le localStorage du navigateur pour les données de démo et les préférences de session. Aucun cookie de pistage publicitaire n'est utilisé. Les données de localStorage sont accessibles uniquement sur votre appareil et ne sont pas transmises à des tiers.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>9. Réclamations</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.8 }}>
          Vous pouvez introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-700)' }}>www.cnil.fr</a>
        </p>
      </div>

      {/* Contact */}
      <div className="section-block">
        <h2><Mail size={18} /> Contact</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Mail size={16} /> <a href="mailto:contact@kopeagri.mq" style={{ color: 'var(--green-700)' }}>contact@kopeagri.mq</a>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Phone size={16} /> 0696 00 00 00
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <MapPin size={16} /> Fort-de-France, Martinique 97200
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
            <Lock size={16} /> DPO : <a href="mailto:dpo@kopeagri.mq" style={{ color: 'var(--green-700)' }}>dpo@kopeagri.mq</a>
          </p>
        </div>
        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--gray-400)' }}>
          Dernière mise à jour : Juillet 2026 — Version 1.0
        </p>
      </div>
    </div>
  )
}

export default LegalPage

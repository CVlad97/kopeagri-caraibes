import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileCheck2, Handshake, Package, ShieldCheck, Truck, Users } from 'lucide-react'
import '../styles/landing-premium.css'

const PilotPartnershipPage = () => (
  <div className="page landing-premium">
    <header className="public-nav">
      <Link to="/" className="public-brand public-brand-logo"><img src={`${import.meta.env.BASE_URL}icon-192.svg`} alt="Logo KopéAgri" /><span>KopéAgri <em>& Pêche Caraïbes</em></span></Link>
      <nav className="public-nav-links" aria-label="Navigation partenariat">
        <Link to="/">Accueil</Link><Link to="/guide">Mode d’emploi</Link><Link to="/export-pro">Export pro</Link><Link to="/demo">Démo</Link>
      </nav>
      <Link to="/demo" className="btn btn-primary btn-sm">Voir la démo</Link>
    </header>

    <section className="premium-hero">
      <div className="premium-grid">
        <div>
          <span className="premium-badge">🤝 Proposition de collaboration — pilote à contractualiser</span>
          <h1 className="premium-title">Prouver une chaîne locale,<br />avant de l’élargir.</h1>
          <p className="premium-sub">KopéAgri propose un pilote simple pour relier production, insertion ou accompagnement, regroupement de lots, traçabilité, logistique et débouchés. Les rôles, engagements, prix et responsabilités restent à formaliser par convention.</p>
          <div className="premium-cta"><Link to="/demo" className="btn btn-primary">Explorer le parcours <ArrowRight size={16} /></Link><Link to="/logistics" className="btn btn-outline">Voir la logistique</Link></div>
        </div>
        <div className="premium-glass presentation-card">
          <span className="mini-kicker">Pilote 30 jours</span>
          <h3>Petit périmètre, preuves mesurables</h3>
          <div className="mini-flow"><span>🌱 3 produits max.</span><b>→</b><span>📦 Lots</span><b>→</b><span>🚚 Flux</span><b>→</b><span>🤝 Débouché</span></div>
          <p>Aucun volume, financement, label, débouché export ou quota d’insertion n’est considéré acquis sans validation documentée.</p>
        </div>
      </div>
    </section>

    <section className="lp-section">
      <span className="section-eyebrow">Rôles à répartir ensemble</span>
      <h2 className="lp-h2">Une responsabilité claire par maillon</h2>
      <div className="premium-cards">
        <div className="premium-card"><Users size={24}/><h4>Réseau terrain</h4><p>Identifier producteurs, pêcheurs, structures d’accompagnement/insertion et disponibilités réelles.</p></div>
        <div className="premium-card"><Package size={24}/><h4>KopéAgri</h4><p>Structurer lots, disponibilités, consolidation, données et traçabilité du pilote.</p></div>
        <div className="premium-card"><Truck size={24}/><h4>Logistique</h4><p>Définir collecte, froid, conditionnement et transport. Meridian est une option identifiée, à contractualiser et comparer.</p></div>
        <div className="premium-card"><Handshake size={24}/><h4>Débouchés</h4><p>Tester un débouché local/B2B et préparer l’export uniquement après validation réglementaire et économique.</p></div>
      </div>
    </section>

    <section className="lp-section">
      <span className="section-eyebrow">Critères de sortie</span>
      <h2 className="lp-h2">Ce que nous devons pouvoir prouver</h2>
      <div className="lp-steps">
        <div className="lp-step"><span className="lp-step-num">1</span><h4>Offre</h4><p>Produit, quantité, origine, disponibilité et responsable identifiés.</p></div>
        <div className="lp-step"><span className="lp-step-num">2</span><h4>Traçabilité</h4><p>Lot et informations utiles consultables sans inventer de certification.</p></div>
        <div className="lp-step"><span className="lp-step-num">3</span><h4>Logistique</h4><p>Coût, délai, collecte et responsabilités documentés sur un flux test.</p></div>
        <div className="lp-step"><span className="lp-step-num">4</span><h4>Débouché</h4><p>Une demande ou commande pilote mesurable, sans promesse de volume futur.</p></div>
      </div>
    </section>

    <section className="trust-strip">
      <h2><ShieldCheck size={20}/> Cadre de confiance</h2>
      <p>Cette page décrit une proposition de pilote. Elle ne vaut ni contrat, ni exclusivité, ni validation sanitaire, ni engagement financier. La convention de partenariat, la facturation, les assurances, les règles de données et les responsabilités doivent être validées avant exploitation commerciale.</p>
    </section>

    <section className="lp-section">
      <div className="premium-cards">
        <div className="premium-card"><FileCheck2 size={24}/><h4>Documents à finaliser</h4><p>Convention pilote, matrice des rôles, données/traçabilité, conditions économiques et critères de décision à J+30.</p></div>
        <div className="premium-card"><CheckCircle2 size={24}/><h4>Décision après pilote</h4><p>Continuer, ajuster ou arrêter sur la base des volumes, coûts, délais, qualité et retours des acteurs.</p></div>
      </div>
    </section>
  </div>
)

export default PilotPartnershipPage

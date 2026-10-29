import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const WA = 'https://wa.me/596696653589?text=Bonjour%2C%20je%20souhaite%20rejoindre%20Kop%C3%A9Agri'

const styles = `
  .hub { min-height: 100vh; background: #f7faf7; color: #173b2d; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .hub * { box-sizing: border-box; }
  .hub a { color: inherit; text-decoration: none; }
  .hub-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
  .hub-nav { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:18px 0; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:900; letter-spacing:-.03em; font-size:1.05rem; }
  .brand-mark { display:grid; place-items:center; width:40px; height:40px; border-radius:14px; background:#1d6b46; color:white; font-size:1.3rem; box-shadow:0 8px 20px #1d6b4630; }
  .nav-links { display:flex; align-items:center; gap:20px; font-size:.9rem; color:#547062; }
  .nav-links a:hover { color:#1d6b46; }
  .button { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:0; border-radius:12px; padding:12px 17px; font-weight:800; cursor:pointer; transition:transform .2s, box-shadow .2s; }
  .button:hover { transform:translateY(-2px); box-shadow:0 10px 24px #173b2d20; }
  .button-primary { color:white; background:#1d6b46; }
  .button-gold { color:#173b2d; background:#f4c95d; }
  .button-light { background:white; color:#1d6b46; border:1px solid #dce9df; }
  .hero { display:grid; grid-template-columns:1.1fr .9fr; gap:42px; align-items:center; padding:58px 0 42px; }
  .eyebrow { color:#b87516; text-transform:uppercase; font-size:.75rem; letter-spacing:.13em; font-weight:900; }
  .hero h1 { max-width:700px; margin:14px 0 18px; font-size:clamp(2.6rem, 6vw, 5rem); line-height:.98; letter-spacing:-.065em; color:#123a2a; }
  .hero h1 span { color:#1d6b46; }
  .hero-copy { max-width:620px; font-size:1.12rem; line-height:1.65; color:#587365; }
  .hero-actions { display:flex; flex-wrap:wrap; gap:12px; margin:26px 0 18px; }
  .micro-proof { display:flex; flex-wrap:wrap; gap:14px; color:#6f8579; font-size:.84rem; }
  .micro-proof strong { color:#1d6b46; }
  .hero-card { position:relative; overflow:hidden; padding:22px; border-radius:28px; color:white; background:linear-gradient(145deg,#175e40,#123d2c); box-shadow:0 24px 60px #174d3630; }
  .hero-card:before { content:''; position:absolute; width:230px; height:230px; border-radius:50%; right:-80px; top:-80px; background:#f4c95d30; }
  .live { position:relative; display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; font-size:.8rem; }
  .live-dot { display:inline-block; width:8px; height:8px; margin-right:7px; border-radius:50%; background:#75e29c; box-shadow:0 0 0 5px #75e29c25; }
  .snapshot { position:relative; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .snapshot-item { padding:15px; border:1px solid #ffffff22; border-radius:16px; background:#ffffff0e; }
  .snapshot-item b { display:block; font-size:1.55rem; color:#f9d875; }
  .snapshot-item small { color:#d4e7da; }
  .alert { position:relative; margin-top:12px; padding:13px 15px; border-radius:14px; background:#ffffff12; font-size:.85rem; line-height:1.45; }
  .section { padding:54px 0; }
  .section-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin-bottom:22px; }
  .section-heading h2 { margin:0; font-size:clamp(1.6rem, 3vw, 2.3rem); letter-spacing:-.045em; color:#123a2a; }
  .section-heading p { max-width:480px; margin:0; color:#688073; line-height:1.55; }
  .role-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .role { text-align:left; padding:20px; border:1px solid #dce9df; border-radius:18px; background:white; cursor:pointer; transition:all .2s; }
  .role:hover, .role.active { border-color:#1d6b46; box-shadow:0 12px 28px #1d6b4618; transform:translateY(-3px); }
  .role-icon { font-size:1.55rem; }
  .role h3 { margin:12px 0 5px; font-size:1rem; }
  .role p { margin:0; color:#71877a; font-size:.86rem; line-height:1.45; }
  .role-link { display:block; margin-top:15px; color:#1d6b46; font-weight:800; font-size:.82rem; }
  .workflow { display:grid; grid-template-columns:repeat(4,1fr); gap:0; overflow:hidden; border:1px solid #dce9df; border-radius:22px; background:white; }
  .step { position:relative; padding:24px 20px; border-right:1px solid #e4eee7; }
  .step:last-child { border-right:0; }
  .step-number { display:grid; place-items:center; width:30px; height:30px; border-radius:50%; color:white; background:#1d6b46; font-weight:900; }
  .step h3 { margin:15px 0 7px; font-size:1rem; }
  .step p { margin:0; color:#71877a; font-size:.88rem; line-height:1.5; }
  .market { display:grid; grid-template-columns:1.1fr .9fr; gap:16px; }
  .market-card { padding:24px; border-radius:22px; background:white; border:1px solid #dce9df; }
  .market-card.dark { color:white; background:#1d6b46; border:0; }
  .market-card h3 { margin:0 0 8px; font-size:1.25rem; }
  .market-card p { color:#71877a; line-height:1.55; }
  .dark p { color:#d1e6d8; }
  .listing { display:flex; justify-content:space-between; gap:15px; align-items:center; padding:15px 0; border-top:1px solid #ffffff26; }
  .listing b { display:block; }
  .listing small { color:#c4dfcd; }
  .price { color:#f9d875; font-weight:900; white-space:nowrap; }
  .cta { display:flex; align-items:center; justify-content:space-between; gap:22px; padding:30px; border-radius:24px; background:linear-gradient(100deg,#f4c95d,#f8dfa0); }
  .cta h2 { margin:0 0 7px; color:#173b2d; letter-spacing:-.04em; }
  .cta p { margin:0; color:#566d5e; }
  .hub-footer { display:flex; justify-content:space-between; gap:20px; padding:28px 0 42px; color:#71877a; font-size:.85rem; }
  .hub-footer div { display:flex; gap:16px; flex-wrap:wrap; }
  @media (max-width: 800px) { .hero,.market { grid-template-columns:1fr; } .hero { padding-top:30px; } .role-grid { grid-template-columns:1fr 1fr; } .workflow { grid-template-columns:1fr 1fr; } .step:nth-child(2) { border-right:0; } .step:nth-child(-n+2) { border-bottom:1px solid #e4eee7; } .nav-links { display:none; } .section-heading,.cta,.hub-footer { align-items:flex-start; flex-direction:column; } }
  @media (max-width: 480px) { .hub-shell { width:min(100% - 24px, 1180px); } .role-grid,.workflow { grid-template-columns:1fr; } .step { border-right:0; border-bottom:1px solid #e4eee7; } .step:last-child { border-bottom:0; } .hero h1 { font-size:2.75rem; } .hero-actions .button { width:100%; } }
`

type Role = { icon: string; title: string; description: string; href: string; action: string }

const roles: Role[] = [
  { icon: '🌱', title: 'Je produis', description: 'Je déclare un lot, une parcelle ou une disponibilité.', href: '/inscription', action: 'Déclarer ma production' },
  { icon: '🛒', title: "J'achète", description: 'Je trouve des volumes locaux, tracés et disponibles.', href: '/marketplace', action: 'Voir les disponibilités' },
  { icon: '🚚', title: 'Je transporte', description: 'Je propose une tournée, du froid ou du stockage.', href: '/inscription', action: 'Proposer mes capacités' },
  { icon: '🤝', title: "Je m'engage", description: 'Je rejoins le pilote comme partenaire du territoire.', href: '/partenariat-pilote', action: 'Devenir partenaire' },
]

export default function LandingOfficiellePage() {
  const [activeRole, setActiveRole] = useState(0)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const role = useMemo(() => roles[activeRole], [activeRole])

  return (
    <main className="hub">
      <style>{styles}</style>
      <div className="hub-shell">
        <header className="hub-nav">
          <Link className="brand" to="/"><span className="brand-mark">🌿</span><span>KopéAgri<br /><small>& Pêche Caraïbes</small></span></Link>
          <nav className="nav-links" aria-label="Navigation principale"><a href="#marche">Marché du jour</a><a href="#fonctionnement">Comment ça marche</a><Link to="/guide">Guide</Link></nav>
          <a className="button button-primary" href={WA}>WhatsApp ↗</a>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div>
            <div className="eyebrow">Pilote Martinique · ouvert aux partenaires</div>
            <h1 id="hero-title">La production locale,<br /><span>enfin coordonnée.</span></h1>
            <p className="hero-copy">KopéAgri transforme les disponibilités dispersées en débouchés concrets : volumes regroupés, logistique organisée et origine suivie.</p>
            <div className="hero-actions"><Link className="button button-primary" to={role.href}>{role.action} →</Link><Link className="button button-light" to="/demo">Voir la démo en 2 min</Link></div>
            <div className="micro-proof"><span>✓ Sans engagement</span><span>✓ Pensé pour le terrain</span><span><strong>●</strong> Données du pilote</span></div>
          </div>
          <aside className="hero-card" aria-label="Aperçu du marché local">
            <div className="live"><span><i className="live-dot" />ACTIVITÉ DU PILOTE</span><span>Martinique</span></div>
            <div className="snapshot"><div className="snapshot-item"><b>27</b><small>productions référencées</small></div><div className="snapshot-item"><b>34</b><small>communes couvertes</small></div><div className="snapshot-item"><b>8</b><small>services logistiques</small></div><div className="snapshot-item"><b>24h</b><small>pour déclarer un besoin</small></div></div>
            <div className="alert">💡 <strong>À ne pas rater :</strong> les acheteurs cherchent des volumes regroupés et réguliers. Déclarez votre disponibilité aujourd'hui.</div>
          </aside>
        </section>

        <section className="section" id="marche" aria-labelledby="market-title">
          <div className="section-heading"><div><div className="eyebrow">Le réflexe du matin</div><h2 id="market-title">Ce qui bouge sur le territoire</h2></div><p>Un aperçu simple des offres, besoins et capacités. La plateforme devient utile avant même la première commande.</p></div>
          <div className="market"><div className="market-card dark"><h3>Demandes actives cette semaine</h3><p>Des débouchés identifiés à rapprocher des productions disponibles.</p><div className="listing"><span><b>Fruits tropicaux</b><small>Fort-de-France · 250 kg</small></span><span className="price">Urgent</span></div><div className="listing"><span><b>Poisson frais</b><small>Le Marin · restauration</small></span><span className="price">Nouveau</span></div><div className="listing"><span><b>Légumes pays</b><small>Lamentin · collectivité</small></span><span className="price">Cette semaine</span></div></div><div className="market-card"><h3>Déclarer en moins d'une minute</h3><p>Produit, quantité, commune et date : c'est tout ce qu'il faut pour rendre votre offre visible.</p><Link className="button button-gold" to="/collecte">Déclarer une disponibilité →</Link><p style={{ fontSize: '.8rem', marginTop: 18 }}>Vous n'avez pas encore de compte ? L'inscription peut commencer avec un simple numéro de téléphone.</p></div></div>
        </section>

        <section className="section" id="fonctionnement" aria-labelledby="role-title">
          <div className="section-heading"><div><div className="eyebrow">Un point d'entrée pour chacun</div><h2 id="role-title">Quelle est votre priorité aujourd'hui ?</h2></div><p>Choisissez votre parcours. KopéAgri vous emmène directement vers l'action la plus utile.</p></div>
          <div className="role-grid">{roles.map((item, index) => <button type="button" className={`role ${activeRole === index ? 'active' : ''}`} key={item.title} onClick={() => setActiveRole(index)}><span className="role-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.description}</p><span className="role-link">Choisir ce parcours →</span></button>)}</div>
          <div style={{ marginTop: 18, textAlign: 'center' }}><Link className="button button-primary" to={role.href}>{role.action} →</Link></div>
        </section>

        <section className="section" aria-labelledby="steps-title"><div className="section-heading"><div><div className="eyebrow">Du terrain au débouché</div><h2 id="steps-title">Simple à comprendre, utile à répéter</h2></div></div><div className="workflow"><div className="step"><span className="step-number">1</span><h3>Déclarer</h3><p>Une production, un besoin ou une capacité logistique.</p></div><div className="step"><span className="step-number">2</span><h3>Rapprocher</h3><p>Les offres et les demandes compatibles sont réunies.</p></div><div className="step"><span className="step-number">3</span><h3>Organiser</h3><p>Collecte, froid, transport et stockage sont planifiés.</p></div><div className="step"><span className="step-number">4</span><h3>Vendre & suivre</h3><p>Le lot reste traçable jusqu'au débouché final.</p></div></div></section>

        <section className="section"><div className="cta"><div><h2>Recevez les opportunités du pilote</h2><p>Un email utile, pas une newsletter de plus : demandes, appels à partenaires et nouvelles disponibilités.</p></div>{subscribed ? <strong>✓ Vous êtes inscrit — à bientôt !</strong> : <form onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSubscribed(true) }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><input aria-label="Votre email" type="email" required placeholder="votre@email.fr" value={email} onChange={(event) => setEmail(event.target.value)} style={{ minWidth: 210, padding: '12px 14px', border: '1px solid #d7c27a', borderRadius: 12, font: 'inherit' }} /><button className="button button-primary" type="submit">Je m'inscris</button></form>}</div></section>

        <footer className="hub-footer"><span>© KopéAgri & Pêche Caraïbes · Martinique</span><div><Link to="/legal">Mentions légales</Link><Link to="/partenariat-pilote">Partenariat pilote</Link><a href="https://delikreol.com">DELIKREOL ↗</a></div></footer>
      </div>
    </main>
  )
}

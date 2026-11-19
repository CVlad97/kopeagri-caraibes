import { Link } from 'react-router-dom'
const products = [
  { name: 'Langouste vivante / fraîche', detail: 'Vivier, calibre, arrivage et disponibilité à confirmer' },
  { name: 'Poissons frais de pêche', detail: 'Espèce, origine, poids et prix selon arrivage' },
  { name: 'Poissons pour restauration', detail: 'Préparation et volume de gros sur devis' },
]
export default function MareyagePage() {
  return <main style={{fontFamily:'system-ui,sans-serif',background:'#f4f8f6',color:'#14392d',minHeight:'100vh',padding:'28px 5vw'}}>
    <div style={{maxWidth:1100,margin:'auto'}}>
      <Link to="/" style={{color:'#16644f'}}>← KopéAgri & Pêche</Link>
      <p style={{letterSpacing:2,textTransform:'uppercase',color:'#317b75',fontWeight:700}}>Pôle mareyage · pilote Martinique</p>
      <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',lineHeight:1.1}}>De la pêche au marché : qualité, transparence et circuit court</h1>
      <p>Langouste House / Vivier Caraïbe — partenaire pilote. Les offres et tarifs ci-dessous sont soumis à confirmation du fournisseur.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:18,margin:'32px 0'}}>
        <img src="https://delikreol.com/vendors/langouste-house/langouste-entiere-bbq.jpg" alt="Langouste préparée Langouste House (photo culinaire, non photo du vivier)" style={{width:'100%',height:260,objectFit:'cover',borderRadius:18}}/>
        <div style={{background:'white',padding:24,borderRadius:18}}>
          <h2>Vivier et photos des arrivages</h2>
          <p>Photos réelles du vivier et des poissons : en attente de validation et fourniture par Charles. Aucune photo générique n'est présentée comme son stock.</p>
          <Link to="/partenaire/langouste-house">Voir la fiche partenaire</Link>
        </div>
      </div>
      <h2>Catalogue de demandes B2B / B2C</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16}}>
        {products.map(p=><article key={p.name} style={{background:'white',padding:24,borderRadius:18,border:'1px solid #d7e6df'}}>
          <h3>{p.name}</h3><p>{p.detail}</p>
          <p><strong>Prix particulier : sur devis</strong></p><p><strong>Prix professionnel / gros : sur devis</strong></p>
          <Link to="/devis-approvisionnement">Demander quantité et prix →</Link>
        </article>)}
      </div>
      <section style={{background:'#164a46',color:'white',padding:26,borderRadius:18,marginTop:24}}>
        <h2>Mutualisation du transport</h2>
        <p>Indiquez quantité, conditionnement, température requise, adresses et créneau dans la demande de devis. La faisabilité d'une tournée mutualisée via les services DELIKREOL sera vérifiée avant toute confirmation.</p>
        <a href="https://delikreol.com/" target="_blank" rel="noopener noreferrer" style={{color:'#f3d782'}}>Découvrir DELIKREOL</a>
        {' · '}<Link style={{color:'#f3d782'}} to="/devis-approvisionnement">Organiser une demande de livraison</Link>
      </section>
      <section style={{marginTop:24}}><h2>Réseau pilote</h2><p>LAKOU SANKOFA : filière fruits et légumes vers la France (modalités à confirmer). SAKIYO : équipe partenaire à intégrer et valider. Langouste House / Vivier Caraïbe : filière mareyage.</p><Link to="/inscription">Inscrire mon équipe / partenaire</Link></section>
    </div>
  </main>
}

import { Link } from 'react-router-dom'

const src = import.meta.env.BASE_URL + 'visuals/langouste-house/langouste-entiere-bbq.jpg'
const contact = 'https://wa.me/596696653589?text=' + encodeURIComponent('Bonjour, je souhaite un devis pour l’approvisionnement Langouste House / Vivier Caraïbe : produit, quantité, lieu, date et transport à préciser.')

export default function LangoustePilotPage() {
  return <main style={{minHeight:'100vh',background:'#100e0c',color:'#fff9ee',fontFamily:'system-ui,sans-serif',padding:'28px 18px 65px'}}>
    <div style={{maxWidth:1040,margin:'0 auto'}}>
      <Link to="/" style={{color:'#ff5a0a',fontWeight:700}}>← KOPÉAGRI — accueil</Link>
      <section style={{marginTop:22,overflow:'hidden',borderRadius:22,background:'#211914',boxShadow:'0 15px 36px #fff9ee18'}}>
        <img src={src} alt="Langouste grillée, visuel Langouste House" style={{width:'100%',height:'min(54vw,340px)',minHeight:210,objectFit:'cover'}}/>
        <div style={{padding:'clamp(20px,4vw,38px)'}}>
          <p style={{color:'#ff8c3b',fontWeight:800,textTransform:'uppercase',letterSpacing:1,fontSize:13}}>Partenaire pilote prioritaire · approvisionnement sur devis</p>
          <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',lineHeight:1.1,margin:'12px 0'}}>Langouste House / Vivier Caraïbe</h1>
          <p style={{fontSize:13,color:"#eec6a5"}}>Photo de présentation Langouste House, sans garantie de disponibilité.</p><p>À Fond-Lahaye, Schœlcher (Martinique). Interlocuteur pour le mareyage et les produits de la mer : Charles Suvelor, Vivier Caraïbe SARL.</p>
          <p>Selon les informations de Charles, La Marée SARL intervient dans l'exploitation restauration, avec des cuisiniers indépendants ; la terrasse et la cuisine ont des responsabilités séparées. Le vendeur contractuel de chaque prestation doit être confirmé avant paiement.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:13,margin:'26px 0'}}>
            {[
              ['B2B · Restauration','Langoustes crues ou préparées, produits de la mer et volumes à confirmer'],
              ['B2C · Particuliers','Demandes de langoustes et produits de la mer selon arrivages et disponibilités'],
              ['Export / inter-îles','Étude de faisabilité après validation des documents sanitaires, douaniers et logistiques'],
            ].map(([title,desc])=><div key={title} style={{background:'#35251c',padding:17,borderRadius:14}}><strong>{title}</strong><p style={{fontSize:14,lineHeight:1.5}}>{desc}</p></div>)}
          </div>
          <p style={{fontSize:14,color:'#eec6a5'}}>Aucune quantité, date de livraison, prix ni autorisation d’export n’est garantie à ce stade. Les demandes sont étudiées avant confirmation.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:25}}><Link to="/partenaires/langouste-house" style={{color:"#ff8c3b",padding:"13px 18px",fontWeight:800}}>Découvrir la fiche Langouste House</Link>
            <Link to="/devis-approvisionnement" style={{background:'#ff5a0a',padding:'13px 18px',borderRadius:12,color:'#100e0c',fontWeight:800,textDecoration:'none'}}>Demander un devis d’approvisionnement</Link>
            <a href={contact} target="_blank" rel="noopener noreferrer" style={{background:'#f4c95d',padding:'13px 18px',borderRadius:12,color:'#100e0c',fontWeight:800,textDecoration:'none'}}>Échanger sur WhatsApp</a>
            <a href="https://delikreol.com/traiteur/langouste-house" target="_blank" rel="noopener noreferrer" style={{padding:'13px 18px',borderRadius:12,color:'#ff5a0a',border:'1px solid #ff5a0a',fontWeight:700,textDecoration:'none'}}>Voir l’offre traiteur DELIKREOL</a>
          </div>
        </div>
      </section>
    </div>
  </main>
}

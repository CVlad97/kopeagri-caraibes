import { Link } from 'react-router-dom'

const offers = [
  { title: 'Accès découverte', price: 'Gratuit — modalités à valider', items: ['Consulter les offres publiques', 'Présenter son activité et demander un devis', 'Accès aux fonctions avancées selon validation du pilote'] },
  { title: 'Producteur individuel', price: '9 €/mois ou 99 €/an — proposition', items: ['Jusqu’à 5 lots par mois envisagés', 'Traçabilité QR et suivi des disponibilités à tester', 'Conditions définitives et paiement non activés'] },
  { title: 'Producteur / organisation', price: '29 à 50 €/mois — hypothèse de réunion', items: ['Volumes et services à définir', 'Consolidation et accompagnement logistique sur devis', 'Changement de formule à développer et tester'] },
]
export default function OffresPilotePage() {
 return <main style={{maxWidth:1080,margin:'auto',padding:'28px 18px 70px',fontFamily:'Inter,system-ui,sans-serif',color:'#173b2d',lineHeight:1.6}}>
  <Link to="/">← Retour à KopéAgri</Link>
  <header style={{margin:'38px 0'}}><p style={{color:'#a06d17',fontWeight:800}}>Suite à la réunion partenaires du 20 novembre 2026</p><h1 style={{fontSize:'clamp(2rem,5vw,3rem)',lineHeight:1.1}}>Offres du pilote et services complémentaires</h1><p>Cette grille est une <strong>proposition de travail</strong>, non une offre commerciale définitive. Aucun abonnement ni paiement n’est confirmé par cette page.</p></header>
  <section aria-label="Formules envisagées" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:18}}>{offers.map(o=><article key={o.title} style={{border:'1px solid #d6e5da',borderRadius:18,padding:22,background:'#f7faf7'}}><h2>{o.title}</h2><p style={{fontWeight:800,fontSize:19}}>{o.price}</p><ul>{o.items.map(i=><li key={i}>{i}</li>)}</ul><Link to="/inscription">Exprimer mon intérêt →</Link></article>)}</section>
  <section style={{marginTop:38,padding:25,borderRadius:16,background:'#f4f0e7'}}><h2>Options séparées de l’abonnement</h2><p>Transport local, chaîne du froid, stockage, location d’équipements, consolidation de lots et export : tarifs et disponibilités uniquement sur devis, sous réserve d’accord des prestataires.</p><Link to="/devis-approvisionnement">Demander un devis →</Link></section>
  <section style={{marginTop:38}}><h2>Parcours du pilote à valider</h2><ol><li>Déclarer un lot avec quantité, photo et prix proposé.</li><li>Tester le QR code et la traçabilité du lot.</li><li>Envoyer une demande et confirmer la commande par WhatsApp ou e-mail.</li><li>Organiser collecte, livraison, documents commerciaux et suivi.</li></ol><p>La facturation électronique, les changements d’abonnement en autonomie et les automatisations WhatsApp complètes nécessitent encore une validation fonctionnelle. Les mécanismes d’investissement crypto/NFT restent hors du périmètre de lancement et soumis à cadrage juridique.</p><Link to="/guide">Consulter le guide →</Link></section>
 </main>
}

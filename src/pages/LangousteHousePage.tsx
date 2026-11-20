import { Link } from 'react-router-dom'
import './langouste-house.css'

const products = [
  { title: 'Langoustes fraîchement congelées', note: 'Congélation en Martinique', price: '40,84 € TTC / kg', image: import.meta.env.BASE_URL+'visuals/langouste-authentique-1.jpg' },
  { title: 'Langoustes vivantes', note: 'Disponibilité à confirmer au prochain arrivage', price: '40,84 € TTC / kg', image: import.meta.env.BASE_URL+'visuals/langouste-authentique-2.jpg' },
]

export default function LangousteHousePage() {
  return <main className="lh-page">
    <header className="lh-banner">
      <img className="lh-banner-photo" src={import.meta.env.BASE_URL+'visuals/langouste-authentique-1.jpg'} alt="Photographie réelle illustrative de langouste caribéenne, non fournie par Langouste House" />
      <div className="lh-brand">Langouste House <span>LABEL FRAÎCHEUR</span></div>
    </header>
    <p className="lh-location">FOND LAHAYE · SCHŒLCHER · MARTINIQUE</p>
    <nav className="lh-tabs" aria-label="Langouste House">
      <a href="#terrasse">Terrasse sur la plage</a>
      <a href="#traiteur">Traiteur</a>
      <a href="#mareyage" aria-current="page">Mareyage</a>
      <a href="#contact">Contact</a>
    </nav>
    <section id="mareyage" className="lh-catalog">
      <h1>Du vivier</h1>
      <p className="lh-note">Photos temporaires de langoustes caribéennes : Wikimedia Commons (CC BY-SA 2.0 et CC BY 2.0), non fournies par Langouste House et ne représentant pas ses stocks. Présentation partenaire pilote. Tarifs repris du visuel fourni, à confirmer auprès de Langouste House avant toute commande.</p>
      {products.map(p => <article className="lh-product" key={p.title}>
        <img className="lh-product-image" src={p.image} alt="Photographie réelle illustrative de langouste caribéenne, non représentative du stock Langouste House" loading="lazy" decoding="async" />
        <div className="lh-product-copy"><h2>{p.title}</h2><p>{p.note}</p></div>
        <strong>{p.price}</strong>
      </article>)}
    </section>
    <section id="terrasse" className="lh-extra"><h2>Terrasse sur la plage</h2><p>Informations et carte à confirmer avec Langouste House.</p></section>
    <section id="traiteur" className="lh-extra"><h2>Traiteur</h2><p>Prestations et disponibilités à confirmer avec le partenaire.</p></section>
    <section id="contact" className="lh-extra"><h2>Contact</h2><p>Pour une demande de disponibilité, passez par la coordination KopéAgri.</p><Link to="/inscription">Contacter la coordination / devenir partenaire</Link></section>
    <footer className="lh-footer"><Link to="/">← Retour à KopéAgri</Link> · Fiche de présentation, sans commande ni paiement en ligne</footer>
  </main>
}

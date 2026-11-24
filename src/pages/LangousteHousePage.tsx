import { Link } from 'react-router-dom'
import './langouste-house.css'

const base = import.meta.env.BASE_URL
const photos = base + 'visuals/langouste-house/'
const contactMessage = encodeURIComponent('Bonjour Langouste House, pouvez-vous confirmer la disponibilité et le tarif des langoustes cuites au kilo, ainsi que les conditions de retrait ou livraison ?')
const whatsapp = 'https://wa.me/596696178000?text=' + contactMessage

const cookedProducts = [
  {
    title: 'Langouste entière cuite',
    subtitle: 'Grillée au barbecue ou pochée · préparation selon disponibilité',
    image: photos + 'langouste-grillee-recadree.webp',
    alt: 'Langouste grillée, photo de présentation Langouste House recadrée',
    pricePer100: 8.68,
    detail: 'Prix transmis pour une langouste entière cuite ; poids exact et préparation à confirmer.',
  },
  {
    title: 'Queue de langouste cuite',
    subtitle: 'Barbecue ou préparation à confirmer',
    image: photos + 'queue-bbq-recadree.webp',
    alt: 'Queue de langouste cuisinée, photo de présentation Langouste House recadrée',
    pricePer100: 15,
    detail: 'Prix transmis pour une queue cuite ; poids exact et préparation à confirmer.',
  },
] as const

const euro = (value: number) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function LangousteHousePage() {
  return (
    <main className="lh-page" id="haut">
      <header className="lh-header">
        <div className="lh-shell">
          <div className="lh-topline">
            <Link to="/" className="lh-back">← KOPÉAGRI</Link>
            <span>Fond-Lahaye · Schœlcher · Martinique</span>
          </div>
          <img className="lh-banner-photo" src={photos + 'bandeau-original.jpg'} alt="Logo et bandeau d'origine Langouste House, Label Fraîcheur" width="1051" height="348" fetchPriority="high" />
        </div>
      </header>

      <nav className="lh-tabs" aria-label="Rubriques Langouste House">
        <a href="#terrasse">Terrasse sur la plage</a>
        <a href="#traiteur">Traiteur</a>
        <a href="#mareyage">Mareyage</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="lh-shell">
        <section className="lh-intro" aria-labelledby="lh-heading">
          <div className="lh-intro-copy">
            <span className="lh-kicker">Langouste House · Vivier Caraïbe</span>
            <h1 id="lh-heading">La mer, <em>à votre table.</em></h1>
            <p>Langoustes vivantes, préparations culinaires et approvisionnements professionnels. Découvrez les spécialités et demandez un prix confirmé avant de commander.</p>
            <div className="lh-actions">
              <a className="lh-button lh-button-primary" href="#mareyage">Voir les langoustes</a>
              <a className="lh-button lh-button-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">Demander sur WhatsApp</a>
            </div>
            <p className="lh-intro-disclaimer">Présentation de partenaire pilote. Les stocks, tarifs et délais ne sont pas confirmés en temps réel.</p>
          </div>
          <img className="lh-intro-image" src={photos + 'terrasse.jpg'} alt="Photo de la terrasse Langouste House à proximité de la plage" width="1280" height="960" fetchPriority="high" />
        </section>

        <section className="lh-section" id="mareyage" aria-labelledby="lh-mareyage-title">
          <div className="lh-heading-row">
            <div><span className="lh-kicker">Mareyage & cuisine</span><h2 id="lh-mareyage-title">Les langoustes <em>à la carte</em></h2></div>
            <p>Prix de la carte reçue le 22 octobre 2026. <strong>À reconfirmer auprès de Charles avant toute commande.</strong></p>
          </div>
          <div className="lh-products">
            {cookedProducts.map((product) => (
              <article className="lh-product-card" key={product.title}>
                <img src={product.image} alt={product.alt} width="900" height="600" loading="lazy" decoding="async" />
                <div className="lh-product-body">
                  <h3>{product.title}</h3>
                  <p>{product.subtitle}</p>
                  <div className="lh-price">{euro(product.pricePer100 * 10)} <small>/ kg</small></div>
                  <p className="lh-price-detail">Soit {euro(product.pricePer100)} / 100 g · tarif communiqué le 22/10/2026</p>
                  <p className="lh-product-qualifier">{product.detail}</p>
                  <a className="lh-card-link" href={whatsapp} target="_blank" rel="noopener noreferrer">Confirmer le prix et la disponibilité →</a>
                </div>
              </article>
            ))}
          </div>
          <div className="lh-raw-note">
            <div><strong>Langoustes vivantes ou congelées</strong><p>Tarif, poids, origine, arrivage et conditionnement : sur devis. Les prix des préparations cuites ci-dessus ne s'appliquent pas à la vente de langoustes crues ou vivantes.</p></div>
            <Link className="lh-button lh-button-ghost" to="/devis-approvisionnement">Demander un devis B2B / B2C</Link>
          </div>
        </section>

        <section className="lh-section lh-vivier-section" aria-labelledby="lh-vivier-title">
          <div>
            <span className="lh-kicker">Approvisionnement · Vivier Caraïbe</span>
            <h2 id="lh-vivier-title">Du vivier <em>à l'assiette.</em></h2>
            <p>Charles décrit une activité de vivier à Schœlcher. Les photographies de la terrasse et des préparations sont disponibles ; <strong>aucune photo du bassin du vivier n'est actuellement authentifiée</strong>. Nous ne remplaçons pas cette preuve par une image fictive.</p>
            <Link className="lh-card-link" to="/partenaire/langouste-house">Approvisionnement professionnel →</Link>
          </div>
          <img src={photos + 'preparation-01.jpg'} alt="Préparation culinaire photographiée chez Langouste House, non présentée comme une photo du vivier" width="1280" height="960" loading="lazy" decoding="async" />
        </section>

        <section className="lh-section lh-secondary" id="terrasse" aria-labelledby="lh-terrasse-title">
          <img src={photos + 'terrasse.jpg'} alt="Terrasse couverte de Langouste House à Fond-Lahaye" loading="lazy" decoding="async" width="1280" height="960" />
          <div><span className="lh-kicker">Bord de mer</span><h2 id="lh-terrasse-title">Terrasse sur la plage</h2><p>Une terrasse à Fond-Lahaye, Schœlcher. Horaires, carte et accueil à confirmer directement avec l'établissement.</p><a className="lh-card-link" href={whatsapp} target="_blank" rel="noopener noreferrer">Renseignements et réservations →</a></div>
        </section>

        <section className="lh-section lh-secondary" id="traiteur" aria-labelledby="lh-traiteur-title">
          <img src={photos + 'bisque-maison.jpg'} alt="Bisque présentée sur la terrasse Langouste House" loading="lazy" decoding="async" width="1280" height="960" />
          <div><span className="lh-kicker">Cuisine & événements</span><h2 id="lh-traiteur-title">Traiteur à emporter</h2><p>Retrouvez les préparations et demandez une disponibilité. Le vendeur, la carte applicable et les conditions de livraison doivent être confirmés pour chaque prestation.</p><a className="lh-card-link" href="https://delikreol.com/traiteur/langouste-house" target="_blank" rel="noopener noreferrer">Découvrir l'offre traiteur sur DELIKREOL →</a></div>
        </section>

        <section className="lh-contact" id="contact" aria-labelledby="lh-contact-title">
          <div><span className="lh-kicker">Nous contacter</span><h2 id="lh-contact-title">Une envie de langouste ?</h2><p>Demandez le prix confirmé au kilo, le poids, la disponibilité et les modalités de retrait ou de livraison.</p></div>
          <div className="lh-contact-actions">
            <a className="lh-button lh-button-primary" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Charles Suvelor</a>
            <Link className="lh-button lh-button-ghost" to="/devis-approvisionnement">Devis d'approvisionnement</Link>
          </div>
        </section>
        <footer className="lh-footer"><Link to="/">← Retour à KOPÉAGRI</Link><span>Vitrine informative sans encaissement en ligne · Langouste House / Vivier Caraïbe SARL</span></footer>
      </div>
    </main>
  )
}

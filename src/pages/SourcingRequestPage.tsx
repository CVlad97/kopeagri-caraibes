import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Package, Truck } from 'lucide-react'
import '../styles/landing-premium.css'

const DESTINATION = '596696653589'
type Request = {
  nom: string
  telephone: string
  structure: string
  produits: string
  quantites: string
  commune: string
  date: string
  logistique: string
}
const initial: Request = { nom: '', telephone: '', structure: '', produits: '', quantites: '', commune: '', date: '', logistique: '' }

function sourcingWhatsAppLink(data: Request): string {
  const rows = [
    '🌱 *KopéAgri — demande de devis approvisionnement*',
    `Contact : ${data.nom.trim()}`,
    `Téléphone : ${data.telephone.trim()}`,
    data.structure.trim() ? `Structure : ${data.structure.trim()}` : '',
    `Produits recherchés : ${data.produits.trim()}`,
    `Quantités / unités : ${data.quantites.trim()}`,
    `Commune : ${data.commune.trim()}`,
    data.date ? `Date souhaitée : ${data.date}` : '',
    data.logistique.trim() ? `Livraison / contraintes : ${data.logistique.trim()}` : '',
    'Merci de confirmer la disponibilité, le tarif, le transport et les conditions avant engagement.'
  ]
  return `https://wa.me/${DESTINATION}?text=${encodeURIComponent(rows.filter(Boolean).join('\n'))}`
}

export default function SourcingRequestPage() {
  const [data, setData] = useState<Request>(initial)
  const [ready, setReady] = useState(false)
  const set = (key: keyof Request, value: string) => setData(previous => ({ ...previous, [key]: value }))
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReady(true)
    window.open(sourcingWhatsAppLink(data), '_blank', 'noopener,noreferrer')
  }
  return (
    <main className="page landing-premium" style={{ minHeight: '100vh', padding: '24px 18px 64px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/" className="btn btn-outline"><ArrowLeft size={17}/> Retour à KopéAgri</Link>
        <div className="premium-glass presentation-card" style={{ marginTop: 24, padding: 26 }}>
          <span className="premium-badge">Demande sans paiement · Martinique</span>
          <h1 className="premium-title" style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)' }}>Votre approvisionnement, sur devis</h1>
          <p>Décrivez vos besoins en produits agricoles, pêche ou logistique. Nous vérifierons les disponibilités et les conditions avant tout engagement.</p>
          <p><strong>Important :</strong> ceci est une demande de renseignements, pas une commande confirmée. Aucun paiement n'est encaissé ici.</p>
          {ready ? (
            <section role="status" aria-live="polite" className="premium-card" style={{ marginTop: 18 }}>
              <h2>Votre message est prêt</h2>
              <p>Ouvrez WhatsApp et appuyez sur « Envoyer » : le message n'est pas transmis automatiquement.</p>
              <a className="btn btn-primary" href={sourcingWhatsAppLink(data)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/> Ouvrir WhatsApp pour envoyer</a>
            </section>
          ) : (
            <form onSubmit={prepare} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
              {([
                ['nom','Votre nom','text',true],
                ['telephone','Téléphone WhatsApp','tel',true],
                ['structure','Entreprise ou exploitation (facultatif)','text',false],
                ['produits','Produits recherchés','text',true],
                ['quantites','Quantités et unités (kg, cartons, etc.)','text',true],
                ['commune','Commune de retrait ou livraison','text',true],
                ['date','Date souhaitée (facultatif)','date',false],
                ['logistique','Contraintes de transport ou stockage (facultatif)','text',false],
              ] as [keyof Request,string,string,boolean][]).map(([key,label,type,required]) => (
                <label key={key} style={{ display:'grid', gap:6, fontWeight:600 }}>
                  {label}
                  <input value={data[key]} onChange={e=>set(key,e.target.value)} type={type} required={required} maxLength={key==='produits'||key==='logistique'?600:180} className="input" style={{ padding: 12, borderRadius: 10, border:'1px solid #bbb', width:'100%', color:'#1a2b27',background:'#fff' }} />
                </label>
              ))}
              <button className="btn btn-primary" type="submit"><Package size={17}/> Préparer ma demande sur WhatsApp</button>
              <p style={{ fontSize: 13 }}>Vos coordonnées sont utilisées uniquement pour composer le message WhatsApp. Ce formulaire n'enregistre pas de commande sur le site.</p>
            </form>
          )}
          <p style={{ marginTop: 20 }}><Truck size={17} style={{ display:'inline' }}/> Retrait, collecte et livraison : uniquement après vérification avec un partenaire.</p>
        </div>
      </div>
    </main>
  )
}

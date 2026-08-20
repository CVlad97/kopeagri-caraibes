import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { add, MARTINIQUE_COMMUNES, type Lot } from '../services/dataService'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, QrCode, CheckCircle2, Coins } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5 | 6

type LotType = 'agriculture' | 'pêche'

const AGRI_PRODUCTS = [
  'Banane', 'Mangue', 'Avocat', 'Ananas', 'Patate douce', 'Giraumon', 'Tomate', 'Concombre', 'Coco', 'Cacao'
]

const FISH_PRODUCTS = [
  'Thazard', 'Dorade coryphène', 'Bonite', 'Lambi', 'Oursin', 'Langouste', 'Vivaneau', 'Crevette'
]

const PRICE_HINTS: Record<string, { min: number; max: number; unit: string }> = {
  Banane: { min: 1.8, max: 3.0, unit: 'kg' },
  Mangue: { min: 3.0, max: 6.0, unit: 'kg' },
  Avocat: { min: 2.8, max: 5.5, unit: 'kg' },
  Ananas: { min: 2.2, max: 4.0, unit: 'pièce' },
  Thazard: { min: 9.0, max: 14.0, unit: 'kg' },
  'Dorade coryphène': { min: 10.0, max: 16.0, unit: 'kg' },
  Lambi: { min: 18.0, max: 30.0, unit: 'kg' },
  Langouste: { min: 25.0, max: 45.0, unit: 'kg' },
}

const SellNowPage: React.FC = () => {
  const { profile } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [lotType, setLotType] = useState<LotType>('agriculture')
  const [product, setProduct] = useState('')
  const [qty, setQty] = useState<number>(100)
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState<number>(3)
  const [available, setAvailable] = useState(new Date().toISOString().slice(0, 10))
  const [commune, setCommune] = useState(profile?.commune || 'Fort-de-France')
  const [photoNote, setPhotoNote] = useState('')
  const [publishedLot, setPublishedLot] = useState<Lot | null>(null)

  const products = lotType === 'agriculture' ? AGRI_PRODUCTS : FISH_PRODUCTS

  const priceHint = useMemo(() => {
    if (!product || !PRICE_HINTS[product]) return null
    return PRICE_HINTS[product]
  }, [product])

  const publicLotUrl = useMemo(() => {
    if (!publishedLot) return ''
    return `${window.location.origin}${import.meta.env.BASE_URL}lot/${publishedLot.id}`
  }, [publishedLot])

  const whatsappUrl = useMemo(() => {
    if (!publishedLot) return ''
    const lotCode = `KPA-${publishedLot.id.toUpperCase()}`
    const txt = encodeURIComponent(
      `Bonjour, lot disponible: ${lotCode}\n` +
      `${publishedLot.product} - ${publishedLot.qty} ${publishedLot.unit}\n` +
      `${publishedLot.price}€/ ${publishedLot.unit}\n` +
      `Disponible: ${publishedLot.available}\n` +
      `Traçabilité: ${publicLotUrl}`
    )
    return `https://wa.me/596696000000?text=${txt}`
  }, [publishedLot, publicLotUrl])

  const suggestPrice = () => {
    if (!priceHint) return
    const mid = Number(((priceHint.min + priceHint.max) / 2).toFixed(2))
    setPrice(mid)
    setUnit(priceHint.unit)
  }

  const publishLot = () => {
    if (!profile) return
    const emoji = lotType === 'pêche' ? '🐟' : '🌱'
    const lot = add('lots', {
      product,
      producer: profile.full_name,
      commune,
      qty,
      unit,
      price,
      quality: 'Terrain',
      available,
      status: 'approved',
      certs: [],
      image: photoNote ? photoNote.slice(0, 25) : emoji,
      active: true,
    }) as Lot
    setPublishedLot(lot)
    setStep(6)
  }

  if (step === 6 && publishedLot) {
    return (
      <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1><CheckCircle2 size={22} /> Lot publié</h1>
        <p>Votre lot est en ligne. Vous pouvez partager immédiatement par WhatsApp et QR.</p>

        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <p><strong>Produit:</strong> {publishedLot.product}</p>
          <p><strong>Quantité:</strong> {publishedLot.qty} {publishedLot.unit}</p>
          <p><strong>Prix:</strong> {publishedLot.price} € / {publishedLot.unit}</p>
          <p><strong>Disponibilité:</strong> {publishedLot.available}</p>
          <p><strong>Lien public:</strong> <a href={publicLotUrl} target="_blank" rel="noopener noreferrer">{publicLotUrl}</a></p>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <h3><QrCode size={18} /> QR lot</h3>
          <QRCodeSVG value={publicLotUrl} size={220} includeMargin />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <MessageCircle size={18} /> Partager sur WhatsApp
          </a>
          <a href={publicLotUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Voir page lot</a>
          <Link to="/orders" className="btn btn-outline">Mes commandes</Link>
          <button className="btn btn-outline" onClick={() => { setPublishedLot(null); setStep(1) }}>Publier un autre lot</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1>Je vends aujourd’hui</h1>
      <p>Parcours assisté terrain — objectif: lot publié en moins de 5 minutes.</p>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p><strong>Étape {step}/6</strong></p>

        {step === 1 && (
          <>
            <label>Type</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className={`btn ${lotType === 'agriculture' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLotType('agriculture')}>Agriculture</button>
              <button className={`btn ${lotType === 'pêche' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLotType('pêche')}>Pêche</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label>Produit / Espèce</label>
            <select className="form-input" value={product} onChange={e => setProduct(e.target.value)}>
              <option value="">Sélectionner</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <label>Quantité</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" type="number" value={qty} min={1} onChange={e => setQty(Number(e.target.value))} />
              <select className="form-input" value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="pièce">pièce</option>
                <option value="bac">bac</option>
              </select>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <label>Prix</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="form-input" type="number" value={price} min={0.1} step={0.1} onChange={e => setPrice(Number(e.target.value))} />
              <span>€ / {unit}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-outline" onClick={suggestPrice}><Coins size={16} /> Aide-moi à fixer le prix</button>
              {priceHint && (
                <p style={{ marginTop: 8, opacity: 0.8 }}>
                  Indication terrain: {priceHint.min}€ – {priceHint.max}€ / {priceHint.unit}
                </p>
              )}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <label>Disponibilité + origine</label>
            <input className="form-input" type="date" value={available} onChange={e => setAvailable(e.target.value)} />
            <select className="form-input" value={commune} onChange={e => setCommune(e.target.value)} style={{ marginTop: 8 }}>
              {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              className="form-input"
              placeholder="Photo (optionnel): note rapide ou nom fichier"
              value={photoNote}
              onChange={e => setPhotoNote(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-outline" disabled={step === 1} onClick={() => setStep(step === 1 ? 1 : (step - 1) as Step)}>Retour</button>
          {step < 5 && (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step === 5 ? 5 : (step + 1) as Step)}
              disabled={(step === 2 && !product)}
            >
              Suivant
            </button>
          )}
          {step === 5 && (
            <button className="btn btn-primary" onClick={publishLot} disabled={!product || qty <= 0 || price <= 0}>Publier le lot</button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3>Après publication</h3>
        <ul>
          <li>1) lien WhatsApp prêt à envoyer</li>
          <li>2) QR public du lot</li>
          <li>3) page publique de traçabilité minimale</li>
          <li>4) accès direct à Mes commandes</li>
        </ul>
      </div>
    </div>
  )
}

export default SellNowPage

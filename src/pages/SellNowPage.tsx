import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { add, MARTINIQUE_COMMUNES, type Lot } from '../services/dataService'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, QrCode, CheckCircle2, Coins, WifiOff, Save } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5 | 6
type LotType = 'agriculture' | 'pêche'

type SellNowDraft = {
  step: Step
  lotType: LotType
  product: string
  qty: number
  unit: string
  price: number
  available: string
  commune: string
  photoNote: string
}

const DRAFT_KEY = 'kopeagri_sell_now_draft_v1'
const WA_QUEUE_KEY = 'kopeagri_sell_now_wa_queue_v1'

const AGRI_PRODUCTS = ['Banane', 'Mangue', 'Avocat', 'Ananas', 'Patate douce', 'Giraumon', 'Tomate', 'Concombre', 'Coco', 'Cacao']
const FISH_PRODUCTS = ['Thazard', 'Dorade coryphène', 'Bonite', 'Lambi', 'Oursin', 'Langouste', 'Vivaneau', 'Crevette']

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

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [draftRecovered, setDraftRecovered] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string>('')

  const products = lotType === 'agriculture' ? AGRI_PRODUCTS : FISH_PRODUCTS

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw) as SellNowDraft
      setStep(d.step)
      setLotType(d.lotType)
      setProduct(d.product)
      setQty(d.qty)
      setUnit(d.unit)
      setPrice(d.price)
      setAvailable(d.available)
      setCommune(d.commune)
      setPhotoNote(d.photoNote)
      setDraftRecovered(true)
    } catch {
      // ignore corrupted draft
    }
  }, [])

  useEffect(() => {
    if (publishedLot) return
    const draft: SellNowDraft = {
      step,
      lotType,
      product,
      qty,
      unit,
      price,
      available,
      commune,
      photoNote,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setLastSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    } catch {
      // localStorage may fail in private mode
    }
  }, [step, lotType, product, qty, unit, price, available, commune, photoNote, publishedLot])

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

  const inviteNeighborsUrl = useMemo(() => {
    if (!publishedLot) return ''
    const txt = encodeURIComponent(
      `Bonjour, je viens de publier un lot ${publishedLot.product} (${publishedLot.qty} ${publishedLot.unit}).\n` +
      `On peut grouper nos volumes pour mieux vendre ensemble.\n` +
      `Voir le lot: ${publicLotUrl}`
    )
    return `https://wa.me/?text=${txt}`
  }, [publishedLot, publicLotUrl])

  const inviteBuyerUrl = useMemo(() => {
    if (!publishedLot) return ''
    const txt = encodeURIComponent(
      `Bonjour, lot disponible pour achat B2B:\n` +
      `${publishedLot.product} - ${publishedLot.qty} ${publishedLot.unit} à ${publishedLot.price}€/${publishedLot.unit}.\n` +
      `Origine déclarée: ${publishedLot.commune}.\n` +
      `Traçabilité: ${publicLotUrl}`
    )
    return `https://wa.me/?text=${txt}`
  }, [publishedLot, publicLotUrl])

  const inviteTransporterUrl = useMemo(() => {
    if (!publishedLot) return ''
    const txt = encodeURIComponent(
      `Bonjour, besoin de collecte/livraison pour un lot:\n` +
      `${publishedLot.product} - ${publishedLot.qty} ${publishedLot.unit}, dispo ${publishedLot.available}.\n` +
      `Point départ: ${publishedLot.commune}.\n` +
      `Détails lot: ${publicLotUrl}`
    )
    return `https://wa.me/?text=${txt}`
  }, [publishedLot, publicLotUrl])

  const suggestPrice = () => {
    if (!priceHint) return
    const mid = Number(((priceHint.min + priceHint.max) / 2).toFixed(2))
    setPrice(mid)
    setUnit(priceHint.unit)
  }

  const queueWhatsAppShare = (url: string) => {
    try {
      const raw = localStorage.getItem(WA_QUEUE_KEY)
      const queue = raw ? (JSON.parse(raw) as string[]) : []
      queue.push(url)
      localStorage.setItem(WA_QUEUE_KEY, JSON.stringify(queue))
    } catch {
      // queue best effort
    }
  }

  const flushQueuedShare = () => {
    if (!isOnline) return
    try {
      const raw = localStorage.getItem(WA_QUEUE_KEY)
      const queue = raw ? (JSON.parse(raw) as string[]) : []
      if (queue.length === 0) return
      const [first, ...rest] = queue
      localStorage.setItem(WA_QUEUE_KEY, JSON.stringify(rest))
      window.open(first, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore queue flush errors
    }
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
    localStorage.removeItem(DRAFT_KEY)
  }

  if (step === 6 && publishedLot) {
    return (
      <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1><CheckCircle2 size={22} /> Lot publié</h1>
        <p>Votre lot est en ligne. Vous pouvez partager immédiatement par WhatsApp et QR.</p>

        {!isOnline && (
          <div className="card" style={{ padding: 12, marginBottom: 12, border: '1px solid #f59e0b' }}>
            <p style={{ margin: 0 }}><WifiOff size={16} /> Hors ligne: le lot est enregistré, partage WhatsApp en attente de réseau.</p>
          </div>
        )}

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
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            onClick={(e) => {
              if (!isOnline) {
                e.preventDefault()
                queueWhatsAppShare(whatsappUrl)
              }
            }}
          >
            <MessageCircle size={18} /> Partager sur WhatsApp
          </a>
          <button className="btn btn-outline" onClick={flushQueuedShare} disabled={!isOnline}>Envoyer partages en attente</button>
          <a href={publicLotUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Voir page lot</a>
          <Link to="/orders" className="btn btn-outline">Mes commandes</Link>
          <button className="btn btn-outline" onClick={() => { setPublishedLot(null); setStep(1) }}>Publier un autre lot</button>
        </div>

        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <h3>🚀 Boucle virale (1 clic)</h3>
          <p style={{ marginTop: 6, opacity: 0.85 }}>Invitez vos voisins, un acheteur et un transporteur à partir du lot publié.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <a
              href={inviteNeighborsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              onClick={(e) => {
                if (!isOnline) {
                  e.preventDefault()
                  queueWhatsAppShare(inviteNeighborsUrl)
                }
              }}
            >
              Inviter 2 producteurs voisins
            </a>
            <a
              href={inviteBuyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              onClick={(e) => {
                if (!isOnline) {
                  e.preventDefault()
                  queueWhatsAppShare(inviteBuyerUrl)
                }
              }}
            >
              Inviter un acheteur B2B
            </a>
            <a
              href={inviteTransporterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              onClick={(e) => {
                if (!isOnline) {
                  e.preventDefault()
                  queueWhatsAppShare(inviteTransporterUrl)
                }
              }}
            >
              Inviter un transporteur
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1>Je vends aujourd’hui</h1>
      <p>Parcours assisté terrain — objectif: lot publié en moins de 5 minutes.</p>

      {!isOnline && (
        <div className="card" style={{ padding: 12, marginBottom: 12, border: '1px solid #f59e0b' }}>
          <p style={{ margin: 0 }}><WifiOff size={16} /> Connexion faible/hors ligne: le brouillon est sauvegardé automatiquement.</p>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p><strong>Étape {step}/6</strong></p>
        <p style={{ fontSize: 13, opacity: 0.8 }}><Save size={14} /> Brouillon auto {lastSavedAt ? `(${lastSavedAt})` : ''} {draftRecovered ? '• reprise automatique activée' : ''}</p>

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
              {priceHint && <p style={{ marginTop: 8, opacity: 0.8 }}>Indication terrain: {priceHint.min}€ – {priceHint.max}€ / {priceHint.unit}</p>}
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
            <input className="form-input" placeholder="Photo (optionnel): note rapide ou nom fichier" value={photoNote} onChange={e => setPhotoNote(e.target.value)} style={{ marginTop: 8 }} />
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-outline" disabled={step === 1} onClick={() => setStep(step === 1 ? 1 : (step - 1) as Step)}>Retour</button>
          {step < 5 && (
            <button className="btn btn-primary" onClick={() => setStep(step === 5 ? 5 : (step + 1) as Step)} disabled={(step === 2 && !product)}>
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

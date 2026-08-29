import React, { useEffect, useMemo } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { getAll } from '../services/dataService'
import type { Lot } from '../services/dataService'
import { normalizeTrafficSource, trackLotPageView } from '../services/growthMetrics'

const LotPublicPage: React.FC = () => {
  const { lotId } = useParams()
  const location = useLocation()
  const lots = getAll('lots') as Lot[]

  const lot = useMemo(() => lots.find(l => l.id === lotId), [lots, lotId])
  const trafficSource = useMemo(() => {
    const qs = new URLSearchParams(location.search)
    return normalizeTrafficSource(qs.get('src'))
  }, [location.search])

  useEffect(() => {
    if (!lot) return
    trackLotPageView(trafficSource)
  }, [lot, trafficSource])

  if (!lot) {
    return (
      <div className="page" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
        <h1>Lot introuvable</h1>
        <p>Ce lot n'est pas disponible publiquement.</p>
        <Link to="/" className="btn btn-primary">Retour accueil</Link>
      </div>
    )
  }

  const lotCode = `KPA-${lot.id.toUpperCase()}`
  const traceLevel = 'D0 — Déclaré par opérateur'
  const whatsappText = encodeURIComponent(`Bonjour, je souhaite commander le lot ${lotCode} (${lot.product})`)
  const appOrderUrl = `/lots?lotId=${lot.id}&src=${trafficSource}`

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <h1>Traçabilité lot {lotCode}</h1>
      <p style={{ opacity: 0.8 }}>Démonstration fonctionnelle — données non contractuelles</p>

      <div className="card" style={{ padding: 16, marginTop: 12 }}>
        <h2>{lot.product}</h2>
        <p><strong>Origine déclarée :</strong> {lot.commune}</p>
        <p><strong>Date récolte/capture :</strong> {lot.available}</p>
        <p><strong>Quantité initiale :</strong> {lot.qty} {lot.unit}</p>
        <p><strong>Niveau de preuve :</strong> {traceLevel}</p>
        <p><strong>Historique simplifié :</strong> lot créé, publié, disponible à la commande.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <a className="btn btn-primary" href={`https://wa.me/596696653589?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">Contacter / commander</a>
        <a className="btn btn-outline" href={appOrderUrl}>Créer une commande dans l'app</a>
        <a className="btn btn-outline" href="/marketplace">Voir prochaines disponibilités</a>
      </div>
    </div>
  )
}

export default LotPublicPage

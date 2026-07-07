import React, { useState, useEffect, useMemo } from 'react'
import {
  Layers, Package, Users, Globe, Truck, MessageCircle, Plus, X, Scale, CheckCircle, AlertTriangle, Info
} from 'lucide-react'
import { getAll, add, seedLotsIfEmpty } from '../services/dataService'
import type { Lot } from '../services/dataService'

interface ConsolidationGroup {
  product: string
  lots: Lot[]
  producers: string[]
  totalQty: number
  unit: string
  bestContainer: string
  threshold: 'green' | 'orange' | 'red'
}

const EXPORT_MINIMUMS = [
  { type: "Conteneur 20'", min: 10000, unit: 'kg', icon: '🚢' },
  { type: "Conteneur 40'", min: 25000, unit: 'kg', icon: '🚢🚢' },
  { type: 'Groupage aérien', min: 500, unit: 'kg', icon: '✈️' },
  { type: 'Palette', min: 800, unit: 'kg', icon: '📦' },
]

const DESTINATIONS = [
  'Fort-de-France (local)',
  'Guadeloupe',
  'Guyane française',
  'Métropole (France)',
  'Europe (UE)',
  'Canada',
  'USA (Floride)',
  'Caraïbes (hors DOM)',
]

function getBestContainer(qtyKg: number): { type: string; threshold: 'green' | 'orange' | 'red' } {
  if (qtyKg >= 25000) return { type: "Conteneur 40'", threshold: 'green' }
  if (qtyKg >= 10000) return { type: "Conteneur 20'", threshold: 'green' }
  if (qtyKg >= 5000) return { type: "Conteneur 20'", threshold: 'orange' } // close to 10t
  if (qtyKg >= 800) return { type: 'Palette', threshold: 'orange' }
  if (qtyKg >= 500) return { type: 'Groupage aérien', threshold: 'orange' }
  return { type: 'Volume insuffisant', threshold: 'red' }
}

function qtyToKg(qty: number, unit: string): number {
  if (unit === 'kg') return qty
  if (unit === 't') return qty * 1000
  if (unit === 'pièce') return qty * 0.5 // rough estimate
  if (unit === 'caisse') return qty * 20
  return qty // default assume kg
}

const ConsolidationPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([])
  const [destination, setDestination] = useState(DESTINATIONS[0])
  const [containerType, setContainerType] = useState("Conteneur 20'")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    let allLots = getAll('lots')
    if (allLots.length === 0) {
      seedLotsIfEmpty()
      allLots = getAll('lots')
    }
    // Only active lots (not sold, not draft)
    setLots(allLots.filter(l => l.active && l.status !== 'sold' && l.status !== 'cancelled'))
  }, [])

  const groups = useMemo<ConsolidationGroup[]>(() => {
    const map = new Map<string, Lot[]>()
    lots.forEach(lot => {
      const key = lot.product
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(lot)
    })
    const result: ConsolidationGroup[] = []
    map.forEach((groupLots, product) => {
      const producers = [...new Set(groupLots.map(l => l.producer))]
      const firstUnit = groupLots[0]?.unit || 'kg'
      let totalKg = groupLots.reduce((sum, l) => sum + qtyToKg(l.qty, l.unit), 0)
      const best = getBestContainer(totalKg)
      result.push({
        product,
        lots: groupLots,
        producers,
        totalQty: totalKg >= 1000 ? Math.round(totalKg) : Math.round(totalKg * 10) / 10,
        unit: 'kg',
        bestContainer: best.type,
        threshold: best.threshold,
      })
    })
    return result
  }, [lots])

  const uniqueProducers = useMemo(() => new Set(lots.map(l => l.producer)).size, [lots])
  const totalVolumeKg = useMemo(() => lots.reduce((s, l) => s + qtyToKg(l.qty, l.unit), 0), [lots])
  const consolidableGroups = useMemo(() => groups.filter(g => g.threshold !== 'red').length, [groups])
  const activeDestinations = DESTINATIONS.length

  const stats = [
    { icon: Scale, label: 'Volume total disponible', value: totalVolumeKg >= 1000 ? `${(totalVolumeKg / 1000).toFixed(1)} t` : `${Math.round(totalVolumeKg)} kg` },
    { icon: Users, label: 'Producteurs intéressés', value: uniqueProducers },
    { icon: Package, label: 'Lots consolidables', value: consolidableGroups },
    { icon: Globe, label: 'Destinations actives', value: activeDestinations },
  ]

  const toggleLot = (id: string) => {
    setSelectedLotIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleCreate = () => {
    if (selectedLotIds.length < 2) return
    const selectedLots = lots.filter(l => selectedLotIds.includes(l.id))
    const totalKg = selectedLots.reduce((s, l) => s + qtyToKg(l.qty, l.unit), 0)
    const productNames = [...new Set(selectedLots.map(l => l.product))].join(' + ')
    const producerNames = [...new Set(selectedLots.map(l => l.producer))].join(', ')
    add('lots', {
      product: `Consolidation — ${productNames}`,
      producer: producerNames,
      commune: selectedLots[0]?.commune || '',
      qty: totalKg,
      unit: 'kg',
      price: 0,
      quality: 'Consolidé',
      available: date,
      status: 'pending',
      certs: [...new Set(selectedLots.flatMap(l => l.certs))],
      image: '📦',
      active: true,
    } as any)
    setShowModal(false)
    setSelectedLotIds([])
    // Reload
    setLots(getAll('lots').filter(l => l.active && l.status !== 'sold' && l.status !== 'cancelled'))
  }

  const thresholdColor = (t: 'green' | 'orange' | 'red') => {
    if (t === 'green') return 'var(--green-600)'
    if (t === 'orange') return 'var(--orange-500, #E65100)'
    return 'var(--red-500, #D32F2F)'
  }

  const thresholdLabel = (t: 'green' | 'orange' | 'red') => {
    if (t === 'green') return '✅ Suffisant'
    if (t === 'orange') return '⚠️ Presque suffisant'
    return '❌ Volume insuffisant'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Layers size={28} /> Consolidation des volumes 📦</h1>
        <p className="page-subtitle">Regroupez les productions de plusieurs exploitants pour atteindre les volumes d'export</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon"><s.icon size={22} /></div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Export minimums reference */}
      <div className="section-block" style={{ marginTop: 20 }}>
        <h3><Info size={18} /> Référence — Minimums d'export</h3>
        <div className="chip-grid" style={{ gap: 10, marginTop: 10 }}>
          {EXPORT_MINIMUMS.map(m => (
            <div key={m.type} className="chip" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
              <span>{m.icon}</span>
              <strong>{m.type}</strong>
              <span style={{ color: 'var(--gray-500)' }}>≥ {m.min >= 1000 ? `${m.min / 1000}t` : `${m.min} ${m.unit}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consolidation suggestions */}
      <div className="section-block" style={{ marginTop: 20 }}>
        <h3><Layers size={18} /> Opportunités de consolidation</h3>
        {groups.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <Package size={36} />
            <p>Aucun lot disponible pour la consolidation.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            {groups.map(g => (
              <div key={g.product} className="card" style={{
                border: `2px solid ${thresholdColor(g.threshold)}`,
                borderRadius: 10,
                padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{g.lots[0]?.image || '📦'} {g.product}</h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                      {g.producers.length} producteur{g.producers.length > 1 ? 's' : ''} · {g.totalQty >= 1000 ? `${(g.totalQty / 1000).toFixed(1)}t` : `${g.totalQty} ${g.unit}`} total
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                      → <strong>{g.bestContainer}</strong>
                    </p>
                  </div>
                  <span style={{
                    background: thresholdColor(g.threshold),
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {thresholdLabel(g.threshold)}
                  </span>
                </div>
                {/* Producer contributions */}
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {g.lots.map(l => (
                    <div key={l.id} className="chip" style={{ fontSize: '0.8rem' }}>
                      {l.image || '📦'} {l.producer} — {l.qty} {l.unit}
                      {l.certs.length > 0 && (
                        <span style={{ marginLeft: 6 }}>
                          {l.certs.map(c => (
                            <span key={c} className="badge badge-teal" style={{ fontSize: '0.65rem', marginLeft: 2 }}>{c}</span>
                          ))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Créer un lot consolidé
        </button>
        <a
          href="https://wa.me/596696000000?text=Bonjour%20Kop%C3%A9Agri%2C%20je%20souhaite%20organiser%20un%20groupage%20pour%20export"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <MessageCircle size={18} /> Coordination logistique
        </a>
      </div>

      {/* Create Consolidation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: '95%', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}><Layers size={20} /> Nouveau lot consolidé</h3>
              <button className="btn btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>Lots contributeurs (min. 2)</label>
              <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 8 }}>
                {lots.map(lot => (
                  <label key={lot.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px',
                    borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', fontSize: '0.85rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedLotIds.includes(lot.id)}
                      onChange={() => toggleLot(lot.id)}
                    />
                    <span>{lot.image || '📦'}</span>
                    <span><strong>{lot.product}</strong> — {lot.producer}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--gray-500)' }}>{lot.qty} {lot.unit}</span>
                  </label>
                ))}
              </div>
              {selectedLotIds.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--teal-600)', marginTop: 6 }}>
                  Total : {(() => {
                    const total = lots.filter(l => selectedLotIds.includes(l.id)).reduce((s, l) => s + qtyToKg(l.qty, l.unit), 0)
                    return total >= 1000 ? `${(total / 1000).toFixed(1)}t` : `${Math.round(total)} kg`
                  })()} sélectionnés
                </p>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>Destination</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>Type de conteneur</label>
              <select value={containerType} onChange={e => setContainerType(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                {EXPORT_MINIMUMS.map(m => <option key={m.type} value={m.type}>{m.icon} {m.type} (≥ {m.min >= 1000 ? `${m.min / 1000}t` : `${m.min}${m.unit}`})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: 'block' }}>Date d'expédition souhaitée</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)' }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={selectedLotIds.length < 2}
              style={{ width: '100%' }}
            >
              <CheckCircle size={18} /> Créer le lot consolidé
            </button>
            {selectedLotIds.length < 2 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--red-500, #D32F2F)', marginTop: 6, textAlign: 'center' }}>
                <AlertTriangle size={14} /> Sélectionnez au moins 2 lots pour consolider
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConsolidationPage

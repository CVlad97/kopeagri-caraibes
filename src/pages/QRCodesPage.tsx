import React, { useState, useEffect, useMemo } from 'react'
import { QrCode, Download, Copy, CheckCircle, ExternalLink, Printer, MessageCircle, Package, Award, BarChart3 } from 'lucide-react'
import { getAll, seedLotsIfEmpty } from '../services/dataService'
import type { Lot } from '../services/dataService'

const QRCodesPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let allLots = getAll('lots')
    if (allLots.length === 0) {
      seedLotsIfEmpty()
      allLots = getAll('lots')
    }
    const approved = allLots.filter(l => l.status === 'approved')
    setLots(approved)
    if (approved.length > 0 && !selectedId) {
      setSelectedId(approved[0].id)
    }
  }, [])

  const selected = useMemo(() => lots.find(l => l.id === selectedId) || null, [lots, selectedId])

  const traceUrl = selected ? `https://kopeagri.mq/trace/${selected.id}` : ''

  const traceData = useMemo(() => {
    if (!selected) return ''
    return JSON.stringify({
      ref: selected.id,
      product: selected.product,
      producer: selected.producer,
      commune: selected.commune,
      date: selected.available,
      qty: selected.qty,
      unit: selected.unit,
      quality: selected.quality,
      certs: selected.certs,
      platform: 'KopéAgri Caraïbes',
    })
  }, [selected])

  const allCerts = useMemo(() => {
    const certSet = new Set<string>()
    lots.forEach(l => l.certs.forEach(c => certSet.add(c)))
    return certSet
  }, [lots])

  const stats = useMemo(() => [
    { icon: Package, label: 'Lots approuvés', value: lots.length, color: 'badge-green' },
    { icon: QrCode, label: 'QR générés', value: lots.length, color: 'badge-teal' },
    { icon: Award, label: 'Certifications actives', value: allCerts.size, color: 'badge-gold' },
  ], [lots, allCerts])

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    if (!traceUrl) return
    navigator.clipboard.writeText(traceUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleWhatsApp = () => {
    if (!selected) return
    const text = encodeURIComponent(
      `🏷️ Traçabilité KopéAgri\n` +
      `📦 Lot : ${selected.id}\n` +
      `🥭 Produit : ${selected.product}\n` +
      `👨‍🌾 Producteur : ${selected.producer}\n` +
      `📍 Commune : ${selected.commune}\n` +
      `🔗 Lien : ${traceUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (lots.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1><QrCode size={28} /> QR Codes — Traçabilité</h1>
          <p className="page-subtitle">Générez et gérez les QR codes par lot pour une traçabilité complète</p>
        </div>
        <div className="empty-state">
          <Package size={48} />
          <h3>Aucun lot approuvé</h3>
          <p>Seuls les lots approuvés peuvent recevoir un QR code de traçabilité.</p>
          <p>Approuvez des lots depuis la page <strong>Lots & Marché</strong> pour activer la génération de QR codes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><QrCode size={28} /> QR Codes — Traçabilité</h1>
        <p className="page-subtitle">Générez et gérez les QR codes par lot pour une traçabilité complète</p>
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

      <div className="qr-layout">
        {/* QR Generator */}
        <div className="qr-generator">
          <h2>Sélectionner un lot</h2>
          <div className="qr-lot-list">
            {lots.map(lot => (
              <button key={lot.id} className={`qr-lot-btn ${selectedId === lot.id ? 'active' : ''}`} onClick={() => setSelectedId(lot.id)}>
                <span className="lot-emoji">{lot.image || '📦'}</span>
                <div>
                  <strong>{lot.product}</strong>
                  <p>{lot.id} · {lot.qty} {lot.unit}</p>
                </div>
              </button>
            ))}
          </div>

          {/* QR Code Display */}
          {selected && (
            <div className="qr-display">
              <div className="qr-box">
                <div className="qr-placeholder">
                  <QrCode size={120} />
                  <p className="qr-hint">QR code généré</p>
                  <p className="qr-url" style={{ fontSize: '0.75rem', color: 'var(--teal-600)', wordBreak: 'break-all', marginTop: 4 }}>
                    {traceUrl}
                  </p>
                </div>
                <div className="qr-info">
                  <p><strong>Lot :</strong> {selected.id}</p>
                  <p><strong>Produit :</strong> {selected.product}</p>
                  <p><strong>Producteur :</strong> {selected.producer}</p>
                  <p><strong>Commune :</strong> {selected.commune}</p>
                  <p><strong>Date dispo :</strong> {selected.available}</p>
                  <p><strong>Quantité :</strong> {selected.qty} {selected.unit}</p>
                  <p><strong>Qualité :</strong> {selected.quality}</p>
                  <div className="qr-certs">
                    {selected.certs.map(c => <span key={c} className="badge badge-teal">{c}</span>)}
                  </div>
                </div>
              </div>
              <div className="qr-actions">
                <button className="btn btn-outline" onClick={handleCopy}>
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                <button className="btn btn-outline" onClick={handlePrint}>
                  <Printer size={16} /> Imprimer étiquette
                </button>
                <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button className="btn btn-primary">
                  <ExternalLink size={16} /> Voir la fiche lot
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info block */}
        {selected && (
          <div className="qr-info-block">
            <h3>📋 Informations traçabilité</h3>
            <div className="trace-info">
              <div className="trace-item">
                <span className="trace-label">Lot</span>
                <span className="trace-value">{selected.id}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Produit</span>
                <span className="trace-value">{selected.product}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Origine</span>
                <span className="trace-value">{selected.commune}, Martinique</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Producteur</span>
                <span className="trace-value">{selected.producer}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Quantité</span>
                <span className="trace-value">{selected.qty} {selected.unit}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Qualité</span>
                <span className="trace-value">{selected.quality}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Certifications</span>
                <span className="trace-value">{selected.certs.join(', ') || 'Aucune'}</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">Plateforme</span>
                <span className="trace-value">KopéAgri Caraïbes</span>
              </div>
              <div className="trace-item">
                <span className="trace-label">URL de traçabilité</span>
                <span className="trace-value" style={{ wordBreak: 'break-all' }}>{traceUrl}</span>
              </div>
            </div>
            <div className="trace-note">
              <CheckCircle size={16} /> Données certifiées par la coopérative
            </div>
            <div style={{ marginTop: 12, padding: 12, background: 'var(--gray-50)', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--gray-500)' }}>
              <strong style={{ fontSize: '0.75rem' }}>Données encodées QR :</strong><br />
              {traceData}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRCodesPage

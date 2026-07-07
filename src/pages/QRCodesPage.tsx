import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Download, Copy, CheckCircle, ExternalLink, Printer, MessageCircle, Package, Award, BarChart3 } from 'lucide-react'
import { getAll, seedLotsIfEmpty } from '../services/dataService'
import type { Lot } from '../services/dataService'

const QRCodesPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

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
      lot: selected.id,
      product: selected.product,
      producer: selected.producer,
      commune: selected.commune,
      date: selected.available,
      qty: selected.qty,
      unit: selected.unit,
      quality: selected.quality,
      certs: selected.certs,
      platform: 'KopéAgri Caraïbes',
      url: `https://kopeagri.mq/trace/${selected.id}`,
    })
  }, [selected])

  const allCerts = useMemo(() => {
    const certSet = new Set<string>()
    lots.forEach(l => l.certs.forEach(c => certSet.add(c)))
    return certSet
  }, [lots])

  const stats = useMemo(() => [
    { icon: Package, label: 'Lots approuvés', value: lots.length, color: '#2E7D32' },
    { icon: QrCode, label: 'QR générés', value: lots.length, color: '#00838F' },
    { icon: Award, label: 'Certifications actives', value: allCerts.size, color: '#c66200' },
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

  const handleDownload = useCallback(() => {
    if (!qrRef.current || !selected) return
    setDownloading(true)

    const svgEl = qrRef.current.querySelector('svg')
    if (!svgEl) {
      setDownloading(false)
      return
    }

    // Clone the SVG and ensure it has explicit xmlns
    const clone = svgEl.cloneNode(true) as SVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Serialize to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clone)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    // Draw onto canvas then export as PNG
    const img = new Image()
    const canvas = document.createElement('canvas')
    const size = 600 // high-res PNG
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
      }
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `qr-${selected.id}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(pngUrl)
        }
        setDownloading(false)
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      // Fallback: download the SVG directly
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${selected.id}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDownloading(false)
    }

    img.src = url
  }, [selected])

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 18,
        marginBottom: 28,
      }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{s.value}</span>
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
                <div ref={qrRef} className="qr-placeholder" style={{ padding: 16, display: 'inline-block' }}>
                  <QRCodeSVG
                    value={traceData}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#1a1a16"
                  />
                  <p className="qr-hint" style={{ marginTop: 8 }}>QR code de traçabilité</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--teal)', wordBreak: 'break-all', marginTop: 4 }}>
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
                <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
                  <Download size={16} />
                  {downloading ? 'Téléchargement…' : 'Télécharger PNG'}
                </button>
                <button className="btn btn-outline" onClick={handlePrint}>
                  <Printer size={16} /> Imprimer étiquette
                </button>
                <button className="btn" onClick={handleWhatsApp} style={{
                  background: '#25D366',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  fontSize: 15,
                  minHeight: 'var(--touch-min)',
                }}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button className="btn btn-outline" onClick={() => window.open(traceUrl, '_blank')}>
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

            {/* Print-only label layout */}
            <div className="print-label" style={{ display: 'none' }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <QRCodeSVG
                  value={traceData}
                  size={300}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.product}</div>
              <div style={{ fontSize: 12 }}>Lot : {selected.id}</div>
              <div style={{ fontSize: 12 }}>Producteur : {selected.producer}</div>
              <div style={{ fontSize: 12 }}>Commune : {selected.commune}</div>
              <div style={{ fontSize: 12 }}>Qualité : {selected.quality} · {selected.qty} {selected.unit}</div>
              <div style={{ fontSize: 12 }}>Certifications : {selected.certs.join(', ') || 'Aucune'}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>KopéAgri Caraïbes — {traceUrl}</div>
            </div>
          </div>
        )}
      </div>

      {/* Print-only CSS injected via style tag */}
      <style>{`
        @media print {
          .page-header, .stats-row, .qr-layout, .qr-generator, .qr-actions,
          .topbar, .sidebar, .sidebar-overlay, .trace-note, .qr-info-block > h3,
          .trace-info, div[style*="monospace"] {
            display: none !important;
          }
          .print-label {
            display: block !important;
            text-align: center;
            padding: 20px;
            border: 2px solid #000;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .qr-info-block {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default QRCodesPage

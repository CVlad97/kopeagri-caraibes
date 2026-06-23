import React, { useState } from 'react'
import { QrCode, Download, Copy, CheckCircle, ExternalLink } from 'lucide-react'

const SAMPLE_QR_LOTS = [
  { id: 1, product: 'Banane Cavendish', lot: 'LOT-BAN-001', producer: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', date: '2026-06-15', qty: 500, unit: 'kg', quality: 'Extra', certs: ['Bio', 'Commerce équitable'] },
  { id: 2, product: 'Mangue José', lot: 'LOT-MAN-002', producer: 'EARL Larcher', commune: 'Saint-Pierre', date: '2026-06-18', qty: 200, unit: 'kg', quality: 'Premium', certs: ['Bio'] },
  { id: 3, product: 'Ananas Victoria', lot: 'LOT-ANA-003', producer: 'SCEA Galbas', commune: 'Sainte-Luce', date: '2026-06-20', qty: 150, unit: 'pièce', quality: 'Premium', certs: ['Bio'] },
]

const QRCodesPage: React.FC = () => {
  const [selected, setSelected] = useState(SAMPLE_QR_LOTS[0])

  

  return (
    <div className="page">
      <div className="page-header">
        <h1><QrCode size={28} /> QR Codes — Traçabilité</h1>
        <p className="page-subtitle">Générez et gérez les QR codes par lot pour une traçabilité complète</p>
      </div>

      <div className="qr-layout">
        {/* QR Generator */}
        <div className="qr-generator">
          <h2>Sélectionner un lot</h2>
          <div className="qr-lot-list">
            {SAMPLE_QR_LOTS.map(lot => (
              <button key={lot.id} className={`qr-lot-btn ${selected.id === lot.id ? 'active' : ''}`} onClick={() => setSelected(lot)}>
                <span className="lot-emoji">📦</span>
                <div>
                  <strong>{lot.product}</strong>
                  <p>{lot.lot} · {lot.qty} {lot.unit}</p>
                </div>
              </button>
            ))}
          </div>

          {/* QR Code Display */}
          <div className="qr-display">
            <div className="qr-box">
              <div className="qr-placeholder">
                <QrCode size={120} />
                <p className="qr-hint">QR code généré</p>
              </div>
              <div className="qr-info">
                <p><strong>Lot :</strong> {selected.lot}</p>
                <p><strong>Produit :</strong> {selected.product}</p>
                <p><strong>Producteur :</strong> {selected.producer}</p>
                <p><strong>Commune :</strong> {selected.commune}</p>
                <p><strong>Date :</strong> {selected.date}</p>
                <p><strong>Qualité :</strong> {selected.quality}</p>
                <div className="qr-certs">
                  {selected.certs.map(c => <span key={c} className="badge badge-teal">{c}</span>)}
                </div>
              </div>
            </div>
            <div className="qr-actions">
              <button className="btn btn-outline"><Download size={16} /> Télécharger</button>
              <button className="btn btn-outline"><Copy size={16} /> Copier le lien</button>
              <button className="btn btn-primary"><ExternalLink size={16} /> Voir la fiche lot</button>
            </div>
          </div>
        </div>

        {/* Info block */}
        <div className="qr-info-block">
          <h3>📋 Informations traçabilité</h3>
          <div className="trace-info">
            <div className="trace-item">
              <span className="trace-label">Lot</span>
              <span className="trace-value">{selected.lot}</span>
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
          </div>
          <div className="trace-note">
            <CheckCircle size={16} /> Données certifiées par la coopérative
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodesPage
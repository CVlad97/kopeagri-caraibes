import React, { useState, useEffect } from 'react'
import { Download, FileSpreadsheet, Users, Truck, ShoppingCart, Package, FileText, Calendar } from 'lucide-react'
import { getAll, getAllRFQ } from '../services/dataService'
import { getAllDocuments } from '../services/billingService'

function toCSV(headers: string[], rows: string[][]): string {
  const bom = '\uFEFF'
  const headerLine = headers.map(h => `"${h}"`).join(';')
  const dataLines = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  return bom + [headerLine, ...dataLines].join('\n')
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const COLLECTIONS = [
  { key: 'producers', label: 'Producteurs', icon: Users, headers: ['Nom', 'Contact', 'Téléphone', 'Commune', 'Cultures', 'Certifications', 'Actif'], getRows: () => (getAll('producers') as any[]).map(p => [p.name, p.contact || '', p.phone || '', p.commune, (p.cultures || []).join(';'), (p.certifications || []).join(';'), p.active ? 'Oui' : 'Non']) },
  { key: 'logistics', label: 'Transporteurs', icon: Truck, headers: ['Nom', 'Contact', 'Téléphone', 'Commune', 'Services', 'Flotte', 'Actif'], getRows: () => (getAll('logistics') as any[]).map(p => [p.name, p.contact || '', p.phone || '', p.commune, (p.services || []).join(';'), p.fleet || '', p.active ? 'Oui' : 'Non']) },
  { key: 'distributors', label: 'Distributeurs', icon: ShoppingCart, headers: ['Nom', 'Contact', 'Téléphone', 'Commune', 'Type', 'Actif'], getRows: () => (getAll('distributors') as any[]).map(d => [d.name, d.contact || '', d.phone || '', d.commune, d.type || '', d.active ? 'Oui' : 'Non']) },
  { key: 'lots', label: 'Lots de production', icon: Package, headers: ['Produit', 'Producteur', 'Commune', 'Quantité', 'Unité', 'Prix', 'Qualité', 'Statut', 'Certifications'], getRows: () => (getAll('lots') as any[]).map(l => [l.product, l.producer, l.commune, l.qty, l.unit, l.price + '€', l.quality, l.status, (l.certs || []).join(';')]) },
  { key: 'orders', label: 'Commandes', icon: FileText, headers: ['Réf', 'Acheteur', 'Total', 'Commission', 'Statut', 'Date', 'Livraison'], getRows: () => (getAll('orders') as any[]).map(o => [o.ref || o.id, o.buyer, o.total + '€', o.commission + '€', o.status, o.date, o.delivery || '']) },
  { key: 'bookings', label: 'Réservations', icon: Calendar, headers: ['Ressource', 'Nom', 'Téléphone', 'Dates', 'Message'], getRows: () => (getAll('bookings') as any[]).map(b => [b.item_name || '', b.name, b.phone, b.dates, b.message || '']) },
  { key: 'documents', label: 'Factures & Devis', icon: FileSpreadsheet, headers: ['Réf', 'Client', 'Type', 'Montant HT', 'TVA', 'Total TTC', 'Statut'], getRows: () => (getAllDocuments() as any[]).map(d => [d.ref, d.client, d.type, d.total_ht?.toFixed(2) + '€', d.total_tva?.toFixed(2) + '€', d.total_ttc?.toFixed(2) + '€', d.status]) },
]

const ExportDataPage: React.FC = () => {
  const [exported, setExported] = useState<string | null>(null)

  const handleExport = (col: typeof COLLECTIONS[0]) => {
    const rows = col.getRows()
    const csv = toCSV(col.headers, rows)
    const date = new Date().toISOString().slice(0, 10)
    downloadCSV(`KopeAgri_${col.label.replace(/\s+/g, '_')}_${date}.csv`, csv)
    setExported(col.key)
    setTimeout(() => setExported(null), 2000)
  }

  const handleExportAll = () => {
    COLLECTIONS.forEach(col => {
      const rows = col.getRows()
      const csv = toCSV(col.headers, rows)
      const date = new Date().toISOString().slice(0, 10)
      downloadCSV(`KopeAgri_${col.label.replace(/\s+/g, '_')}_${date}.csv`, csv)
    })
    setExported('all')
    setTimeout(() => setExported(null), 3000)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Download size={24} /> Export données</h1>
          <p className="page-subtitle">Téléchargez vos données en CSV pour compta, rapports et analyses</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportAll}>
          <Download size={18} /> Tout exporter
        </button>
      </div>

      {exported && (
        <div className="section-block" style={{ background: 'var(--green-50)', borderColor: 'var(--green-200)' }}>
          <p style={{ color: 'var(--green-700)', fontWeight: 600 }}>✅ {exported === 'all' ? 'Tous les fichiers CSV téléchargés' : 'Fichier CSV téléchargé'}</p>
        </div>
      )}

      <div className="card-grid">
        {COLLECTIONS.map(col => {
          const Icon = col.icon
          const count = col.getRows().length
          return (
            <div key={col.key} className="card">
              <div className="card-header">
                <h3><Icon size={18} /> {col.label}</h3>
                <span className="badge badge-green">{count} entrées</span>
              </div>
              <div className="card-body">
                <p className="card-commune">{col.headers.length} colonnes : {col.headers.slice(0, 4).join(', ')}…</p>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary btn-full" onClick={() => handleExport(col)} disabled={count === 0}>
                  <Download size={16} /> Exporter CSV
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExportDataPage

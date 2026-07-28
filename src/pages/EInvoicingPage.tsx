import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText, Plus, Send, CheckCircle, Clock, Download, X, Trash2,
  AlertCircle, Search, ChevronDown, ChevronUp, Printer, Mail, Shield,
  ExternalLink, BarChart3, Calendar, Filter
} from 'lucide-react'

/* ===== Types ===== */
interface EInvoice {
  id: string
  numero: string
  date: string
  emetteur_siret: string
  emetteur_nom: string
  emetteur_adresse: string
  destinataire_siret: string
  destinataire_nom: string
  destinataire_adresse: string
  lignes: InvoiceLine[]
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  taux_tva: number
  status: 'brouillon' | 'envoyée' | 'acceptée' | 'payée'
  chorus_pro: boolean
  format: 'factur-x' | 'cii'
  date_echeance: string
  conditions_paiement: string
  mentions_legales: string
  notes: string
  created_at: string
}

interface InvoiceLine {
  description: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  taux_tva: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
}

const LS_KEY = 'kopeagri_einvoices'

const STATUS_CFG: Record<EInvoice['status'], { label: string; color: string; emoji: string }> = {
  brouillon: { label: 'Brouillon', color: '#9E9E9E', emoji: '📝' },
  envoyée: { label: 'Envoyée', color: '#2196F3', emoji: '📤' },
  acceptée: { label: 'Acceptée', color: '#4CAF50', emoji: '✅' },
  payée: { label: 'Payée', color: '#1B5E20', emoji: '💰' },
}

const TVA_RATES = [0, 2.1, 5.5, 8.5, 10, 20]

const MENTIONS_LEGALES_DEFAULT = `En application de l'article L.441-9 du Code de commerce, la facture est émise en double exemplaire. 
Pénalités de retard : 3 fois le taux d'intérêt légal en vigueur. 
Indemnité forfaitaire pour frais de recouvrement : 40€ (art. L.441-6 et D.441-5 du Code de commerce).
Escompte pour paiement anticipé : néant.
Conformément à la loi 2024 sur la facturation électronique, cette facture est émise au format Factur-X (CII Cross Industry Invoice).`

/* ===== CRUD ===== */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateInvoiceNumber(existingInvoices: EInvoice[]): string {
  const now = new Date()
  const y = now.getFullYear()
  const existingThisYear = existingInvoices.filter(i => i.numero.startsWith(`FACT-${y}-`))
  const nextSeq = existingThisYear.length + 1
  return `FACT-${y}-${String(nextSeq).padStart(3, '0')}`
}

function getAll(): EInvoice[] {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}

function saveAll(items: EInvoice[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function addInvoice(item: Omit<EInvoice, 'id' | 'created_at' | 'numero'>): EInvoice {
  const all = getAll()
  const newItem: EInvoice = { ...item, id: generateId(), numero: generateInvoiceNumber(all), created_at: new Date().toISOString() }
  all.push(newItem)
  saveAll(all)
  return newItem
}

function updateStatus(id: string, status: EInvoice['status']): void {
  saveAll(getAll().map(i => i.id === id ? { ...i, status } : i))
}

function deleteInvoice(id: string): void {
  saveAll(getAll().filter(i => i.id !== id))
}

/* ===== Factur-X XML Generation ===== */
function generateFacturX(invoice: EInvoice): string {
  const lines = invoice.lignes.map((l, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${i + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${l.description}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${l.prix_unitaire_ht.toFixed(2)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${l.unite}">${l.quantite}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>${l.taux_tva}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${l.montant_ht.toFixed(2)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:en16931</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${invoice.numero}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${invoice.date.replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${invoice.emetteur_nom}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="SIRET">${invoice.emetteur_siret}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode/>
          <ram:LineOne>${invoice.emetteur_adresse}</ram:LineOne>
          <ram:CountryCode>FR</ram:CountryCode>
        </ram:PostalTradeAddress>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${invoice.destinataire_nom}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="SIRET">${invoice.destinataire_siret}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode/>
          <ram:LineOne>${invoice.destinataire_adresse}</ram:LineOne>
          <ram:CountryCode>FR</ram:CountryCode>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:TaxBasisTotalAmount>${invoice.montant_ht.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${invoice.montant_tva.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${invoice.montant_ttc.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${invoice.montant_ttc.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
    ${lines}
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`
}

/* ===== FEC Export for EInvoicing ===== */
function exportFEC(invoices: EInvoice[]): void {
  const headers = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib',
    'CompAuxNum', 'CompAuxLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
    'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'
  ]
  const rows: string[][] = []
  let ecritureNum = 1

  invoices.filter(i => i.status !== 'brouillon').forEach(inv => {
    const date = inv.date.replace(/-/g, '')
    const validDate = date
    const pieceRef = inv.numero
    const montantHT = inv.montant_ht
    const montantTVA = inv.montant_tva
    const montantTTC = inv.montant_ttc

    // Débit: Client (411000)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '411000', 'Clients',
      inv.destinataire_siret, inv.destinataire_nom, pieceRef, date, `Facture ${inv.numero} - ${inv.destinataire_nom}`,
      montantTTC.toFixed(2), '0.00', '', '', validDate, '', ''
    ])
    // Crédit: Ventes (706000)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '706000', 'Prestations de services',
      '', '', pieceRef, date, `Facture ${inv.numero} - ${inv.destinataire_nom}`,
      '0.00', montantHT.toFixed(2), '', '', validDate, '', ''
    ])
    // Crédit: TVA collectée (445710)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '445710', 'TVA collectée',
      '', '', pieceRef, date, `TVA ${inv.numero}`,
      '0.00', montantTVA.toFixed(2), '', '', validDate, '', ''
    ])
    ecritureNum++
  })

  const csv = [headers.join('|'), ...rows.map(r => r.join('|'))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `FEC_Facturation_${new Date().getFullYear()}.txt`; a.click()
  URL.revokeObjectURL(url)
}

/* ===== PDF Generation (simplified HTML→print) ===== */
function generatePDF(invoice: EInvoice): void {
  const linesHtml = invoice.lignes.map(l => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.description}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${l.quantite} ${l.unite}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${l.prix_unitaire_ht.toFixed(2)}€</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${l.taux_tva}%</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${l.montant_ht.toFixed(2)}€</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${l.montant_tva.toFixed(2)}€</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${l.montant_ttc.toFixed(2)}€</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${invoice.numero}</title>
    <style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a16}
    h1{color:#1b6b22}table{width:100%;border-collapse:collapse}th{background:#E8F5E9;text-align:left;padding:8px}
    .total-row td{font-weight:700;background:#f5f5f0}.info-grid{display:flex;gap:40px;margin:20px 0}
    .info-box{flex:1}h3{color:#1b6b22;margin-top:20px}.mentions{font-size:11px;color:#666;margin-top:30px;border-top:1px solid #ccc;padding-top:12px}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h1>🧾 Facture ${invoice.numero}</h1>
      <div style="text-align:right"><strong>KopéAgri Caraïbes</strong><br>SIRET: ${invoice.emetteur_siret}<br>${invoice.emetteur_adresse}</div>
    </div>
    <div class="info-grid">
      <div class="info-box"><h3>Émetteur</h3><p>${invoice.emetteur_nom}<br>${invoice.emetteur_adresse}<br>SIRET: ${invoice.emetteur_siret}</p></div>
      <div class="info-box"><h3>Destinataire</h3><p>${invoice.destinataire_nom}<br>${invoice.destinataire_adresse}<br>SIRET: ${invoice.destinataire_siret}</p></div>
    </div>
    <p><strong>Date :</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')} &nbsp;|&nbsp; <strong>Échéance :</strong> ${invoice.date_echeance ? new Date(invoice.date_echeance).toLocaleDateString('fr-FR') : '—'} &nbsp;|&nbsp; <strong>Statut :</strong> ${STATUS_CFG[invoice.status].label}</p>
    ${invoice.conditions_paiement ? `<p><strong>Conditions de paiement :</strong> ${invoice.conditions_paiement}</p>` : ''}
    ${invoice.chorus_pro ? '<p style="color:#0277BD">🏛️ Compatible Chorus Pro — Facturation électronique DGFIP</p>' : ''}
    <h3>Détail</h3>
    <table><thead><tr><th>Description</th><th>Qté</th><th>P.U. HT</th><th>TVA</th><th>Montant HT</th><th>TVA</th><th>Total TTC</th></tr></thead>
    <tbody>${linesHtml}</tbody>
    <tfoot>
      <tr class="total-row"><td colspan="4"></td><td style="padding:8px">Total HT</td><td style="padding:8px"></td><td style="padding:8px;text-align:right">${invoice.montant_ht.toFixed(2)}€</td></tr>
      <tr class="total-row"><td colspan="4"></td><td style="padding:8px">Total TVA</td><td style="padding:8px"></td><td style="padding:8px;text-align:right">${invoice.montant_tva.toFixed(2)}€</td></tr>
      <tr class="total-row" style="font-size:18px"><td colspan="4"></td><td style="padding:8px">Total TTC / Net à payer</td><td style="padding:8px"></td><td style="padding:8px;text-align:right">${invoice.montant_ttc.toFixed(2)}€</td></tr>
    </tfoot></table>
    ${invoice.mentions_legales ? `<div class="mentions">${invoice.mentions_legales.replace(/\n/g, '<br>')}</div>` : ''}
    ${invoice.notes ? `<h3>Notes</h3><p>${invoice.notes}</p>` : ''}
    <p style="margin-top:20px;font-size:12px;color:#888">Facture émise conformément à la loi 2024 sur la facturation électronique — Format Factur-X (CII Cross Industry Invoice)</p>
    </body></html>`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

/* ===== CSV ===== */
function exportCSV(invoices: EInvoice[]): void {
  const headers = ['N° Facture', 'Date', 'Émetteur', 'SIRET Émetteur', 'Destinataire', 'SIRET Destinataire', 'Montant HT', 'TVA', 'Montant TTC', 'Statut', 'Chorus Pro']
  const rows = invoices.map(i => [
    i.numero, i.date, i.emetteur_nom, i.emetteur_siret, i.destinataire_nom, i.destinataire_siret,
    i.montant_ht.toFixed(2), i.montant_tva.toFixed(2), i.montant_ttc.toFixed(2), i.status, i.chorus_pro ? 'Oui' : 'Non'
  ].map(v => `"${v}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'factures_electroniques_kopeagri.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ===== Month names ===== */
const MONTH_NAMES = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

/* ===== Component ===== */
const EInvoicingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<EInvoice[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Form
  const [fEmetteurNom, setFEmetteurNom] = useState('KopéAgri Caraïbes')
  const [fEmetteurSiret, setFEmetteurSiret] = useState('')
  const [fEmetteurAdresse, setFEmetteurAdresse] = useState('')
  const [fDestNom, setFDestNom] = useState('')
  const [fDestSiret, setFDestSiret] = useState('')
  const [fDestAdresse, setFDestAdresse] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10))
  const [fEcheance, setFEcheance] = useState('')
  const [fTauxTva, setFTauxTva] = useState(8.5)
  const [fChorusPro, setFChorusPro] = useState(false)
  const [fConditionsPaiement, setFConditionsPaiement] = useState('')
  const [fMentionsLegales, setFMentionsLegales] = useState(MENTIONS_LEGALES_DEFAULT)
  const [fNotes, setFNotes] = useState('')
  const [fLignes, setFLignes] = useState<Array<{ description: string; quantite: number; unite: string; prix_unitaire_ht: number; taux_tva: number }>>([
    { description: '', quantite: 1, unite: 'kg', prix_unitaire_ht: 0, taux_tva: 8.5 }
  ])

  const load = () => setInvoices(getAll())
  useEffect(load, [])

  const resetForm = () => {
    setFEmetteurNom('KopéAgri Caraïbes'); setFEmetteurSiret(''); setFEmetteurAdresse('')
    setFDestNom(''); setFDestSiret(''); setFDestAdresse('')
    setFDate(new Date().toISOString().slice(0, 10)); setFEcheance('')
    setFTauxTva(8.5); setFChorusPro(false)
    setFConditionsPaiement(''); setFMentionsLegales(MENTIONS_LEGALES_DEFAULT); setFNotes('')
    setFLignes([{ description: '', quantite: 1, unite: 'kg', prix_unitaire_ht: 0, taux_tva: 8.5 }])
    setShowCreate(false)
  }

  const handleLineChange = (idx: number, field: string, value: string | number) => {
    setFLignes(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const addLine = () => {
    setFLignes(prev => [...prev, { description: '', quantite: 1, unite: 'kg', prix_unitaire_ht: 0, taux_tva: fTauxTva }])
  }

  const removeLine = (idx: number) => {
    setFLignes(prev => prev.filter((_, i) => i !== idx))
  }

  const calcLine = (l: typeof fLignes[0]) => {
    const ht = l.prix_unitaire_ht * l.quantite
    const tva = ht * l.taux_tva / 100
    return { ht, tva, ttc: ht + tva }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lignes: InvoiceLine[] = fLignes.map(l => {
      const c = calcLine(l)
      return { ...l, montant_ht: c.ht, montant_tva: c.tva, montant_ttc: c.ttc }
    })
    const montant_ht = lignes.reduce((s, l) => s + l.montant_ht, 0)
    const montant_tva = lignes.reduce((s, l) => s + l.montant_tva, 0)
    const montant_ttc = lignes.reduce((s, l) => s + l.montant_ttc, 0)

    addInvoice({
      emetteur_nom: fEmetteurNom, emetteur_siret: fEmetteurSiret, emetteur_adresse: fEmetteurAdresse,
      destinataire_nom: fDestNom, destinataire_siret: fDestSiret, destinataire_adresse: fDestAdresse,
      date: fDate, lignes, montant_ht, montant_tva, montant_ttc, taux_tva: fTauxTva,
      status: 'brouillon', chorus_pro: fChorusPro, format: 'factur-x',
      date_echeance: fEcheance, conditions_paiement: fConditionsPaiement,
      mentions_legales: fMentionsLegales, notes: fNotes,
    })
    resetForm(); load()
  }

  const handleStatusChange = (id: string, status: EInvoice['status']) => {
    updateStatus(id, status); load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette facture ?')) { deleteInvoice(id); load() }
  }

  const handleExportXML = (invoice: EInvoice) => {
    const xml = generateFacturX(invoice)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `factur-x_${invoice.numero}.xml`; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = useMemo(() => invoices.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (dateFrom && i.date < dateFrom) return false
    if (dateTo && i.date > dateTo) return false
    if (search) {
      const q = search.toLowerCase()
      return i.numero.toLowerCase().includes(q) || i.destinataire_nom.toLowerCase().includes(q) || i.emetteur_nom.toLowerCase().includes(q)
    }
    return true
  }), [invoices, filterStatus, search, dateFrom, dateTo])

  const stats = useMemo(() => {
    const impayees = invoices.filter(i => i.status !== 'payée')
    const enRetard = impayees.filter(i => i.date_echeance && new Date(i.date_echeance) < new Date())
    return {
      total: invoices.length,
      montantTotalTTC: invoices.reduce((s, i) => s + i.montant_ttc, 0),
      payees: invoices.filter(i => i.status === 'payée').reduce((s, i) => s + i.montant_ttc, 0),
      impayees: impayees.reduce((s, i) => s + i.montant_ttc, 0),
      enRetard: enRetard.length,
      montantEnRetard: enRetard.reduce((s, i) => s + i.montant_ttc, 0),
      chorusPro: invoices.filter(i => i.chorus_pro).length,
    }
  }, [invoices])

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months: { label: string; total: number; count: number }[] = []
    for (let m = 11; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      const monthInvoices = invoices.filter(i => {
        const id = new Date(i.date)
        return id.getFullYear() === year && id.getMonth() === month
      })
      months.push({
        label: `${MONTH_NAMES[month]} ${year}`,
        total: monthInvoices.reduce((s, i) => s + i.montant_ttc, 0),
        count: monthInvoices.length,
      })
    }
    return months
  }, [invoices])

  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><FileText size={28} /> Facturation Électronique</h1>
          <p className="page-subtitle">
            <span className="badge badge-blue" style={{ fontSize: 11, marginRight: 8 }}>
              <Shield size={12} /> Conforme loi 2024
            </span>
            Facturation électronique obligatoire — Format Factur-X (CII) — Compatible Chorus Pro
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportFEC(filtered)}>
            <FileText size={16} /> Export FEC
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(filtered)}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true) }}>
            <Plus size={18} /> Nouvelle facture
          </button>
        </div>
      </div>

      {/* Conformity Banner */}
      <div className="section-block" style={{ marginBottom: 20, background: 'var(--blue-100)', borderLeft: '4px solid var(--blue-600)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Shield size={24} style={{ color: 'var(--blue-600)', flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: 14 }}>Conformité facturation électronique DGFIP (loi 2024)</strong>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: 0 }}>
            Format Factur-X (CII Cross Industry Invoice) — Champs obligatoires : SIRET émetteur/destinataire, numéro, date, montants HT/TTC, TVA, conditions de paiement, mentions légales
          </p>
        </div>
      </div>

      {/* Chorus Pro Banner */}
      <div className="section-block" style={{ marginBottom: 20, background: '#E8F5E9', borderLeft: '4px solid #1B5E20', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 28 }}>🏛️</span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14 }}>Chorus Pro — Plateforme de facturation dématérialisée de l'État</strong>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '4px 0 0 0' }}>
            Les factures adressées à l'État et aux collectivités doivent être transmises via Chorus Pro.
          </p>
        </div>
        <a href="https://chorus-pro.fr" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <ExternalLink size={14} /> Soumettre via Chorus Pro
        </a>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>🧾</div>
          <div className="stat-info">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Factures émises</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>💶</div>
          <div className="stat-info">
            <span className="stat-num">{stats.montantTotalTTC.toFixed(0)}€</span>
            <span className="stat-label">Total TTC</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: 'var(--orange)' }}>⏳</div>
          <div className="stat-info">
            <span className="stat-num">{stats.impayees.toFixed(0)}€</span>
            <span className="stat-label">Impayés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFEBEE', color: 'var(--red)' }}>⚠️</div>
          <div className="stat-info">
            <span className="stat-num">{stats.enRetard}</span>
            <span className="stat-label">En retard ({stats.montantEnRetard.toFixed(0)}€)</span>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="section-block" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>📊 Factures par mois</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, overflowX: 'auto' }}>
          {monthlyData.map((m, i) => (
            <div key={i} style={{ flex: 1, minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div title={`${m.label}: ${m.total.toFixed(0)}€ (${m.count} factures)`} style={{
                width: '100%',
                maxWidth: 40,
                height: m.total > 0 ? `${Math.max((m.total / maxMonthly) * 130, 4)}px` : '2px',
                background: m.total > 0 ? 'var(--green-600)' : 'var(--gray-200)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
              }} />
              <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {m.label.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input className="search-input" placeholder="Rechercher par n°, émetteur, destinataire..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {(['all', 'brouillon', 'envoyée', 'acceptée', 'payée'] as const).map(s => (
          <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'Tous' : `${STATUS_CFG[s].emoji} ${STATUS_CFG[s].label}`}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <Calendar size={16} style={{ color: 'var(--gray-500)' }} />
        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Période :</span>
        <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160, minHeight: 36, fontSize: 13 }} />
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>→</span>
        <input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160, minHeight: 36, fontSize: 13 }} />
        {(dateFrom || dateTo) && (
          <button className="btn btn-outline btn-sm" onClick={() => { setDateFrom(''); setDateTo('') }} style={{ minHeight: 36 }}>
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <div className="section-block" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--gray-500)' }}>Aucune facture. Créez votre première facture électronique !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inv => {
            const isOverdue = inv.status !== 'payée' && inv.date_echeance && new Date(inv.date_echeance) < new Date()
            return (
              <div key={inv.id} className="section-block" style={{ padding: 20, cursor: 'pointer', borderLeft: isOverdue ? '4px solid var(--red)' : undefined }} onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{inv.numero}</h3>
                      <span className={`badge ${inv.status === 'payée' ? 'badge-green' : inv.status === 'envoyée' ? 'badge-blue' : inv.status === 'acceptée' ? 'badge-teal' : 'badge-orange'}`}>
                        {STATUS_CFG[inv.status].emoji} {STATUS_CFG[inv.status].label}
                      </span>
                      {inv.chorus_pro && <span className="badge badge-blue">🏛️ Chorus Pro</span>}
                      {isOverdue && <span className="badge badge-orange" style={{ background: '#FFEBEE', color: 'var(--red)' }}>⚠️ En retard</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                      {inv.emetteur_nom} → {inv.destinataire_nom} • {new Date(inv.date).toLocaleDateString('fr-FR')}
                      {inv.date_echeance && <span> • Échéance: {new Date(inv.date_echeance).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-900)' }}>{inv.montant_ttc.toFixed(2)}€</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>HT: {inv.montant_ht.toFixed(2)}€ | TVA: {inv.montant_tva.toFixed(2)}€</div>
                  </div>
                </div>

                {expandedId === inv.id && (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>Émetteur</h4>
                        <p style={{ fontSize: 14 }}>{inv.emetteur_nom}</p>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>SIRET: {inv.emetteur_siret}</p>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{inv.emetteur_adresse}</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>Destinataire</h4>
                        <p style={{ fontSize: 14 }}>{inv.destinataire_nom}</p>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>SIRET: {inv.destinataire_siret}</p>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{inv.destinataire_adresse}</p>
                      </div>
                    </div>

                    {inv.conditions_paiement && (
                      <p style={{ fontSize: 13, marginBottom: 8 }}><strong>Conditions de paiement :</strong> {inv.conditions_paiement}</p>
                    )}

                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Lignes</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                            <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
                            <th style={{ padding: 8 }}>Qté</th>
                            <th style={{ padding: 8 }}>P.U. HT</th>
                            <th style={{ padding: 8 }}>TVA</th>
                            <th style={{ padding: 8 }}>Montant HT</th>
                            <th style={{ padding: 8 }}>Montant TVA</th>
                            <th style={{ padding: 8 }}>TTC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.lignes.map((l, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                              <td style={{ padding: 8 }}>{l.description}</td>
                              <td style={{ padding: 8, textAlign: 'center' }}>{l.quantite} {l.unite}</td>
                              <td style={{ padding: 8, textAlign: 'right' }}>{l.prix_unitaire_ht.toFixed(2)}€</td>
                              <td style={{ padding: 8, textAlign: 'center' }}>{l.taux_tva}%</td>
                              <td style={{ padding: 8, textAlign: 'right' }}>{l.montant_ht.toFixed(2)}€</td>
                              <td style={{ padding: 8, textAlign: 'right' }}>{l.montant_tva.toFixed(2)}€</td>
                              <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{l.montant_ttc.toFixed(2)}€</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 'var(--radius-sm)', minWidth: 220 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13 }}>Total HT</span>
                          <span style={{ fontWeight: 600 }}>{inv.montant_ht.toFixed(2)}€</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13 }}>Total TVA</span>
                          <span style={{ fontWeight: 600 }}>{inv.montant_tva.toFixed(2)}€</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: 4, marginTop: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>Net à payer (TTC)</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--green-700)' }}>{inv.montant_ttc.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>

                    {inv.mentions_legales && (
                      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gray-500)', background: 'var(--gray-50)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                        <strong>Mentions légales :</strong><br />
                        {inv.mentions_legales}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                      {/* Status progression */}
                      {(['brouillon', 'envoyée', 'acceptée', 'payée'] as const).map(s => (
                        <button key={s} className={`btn btn-sm ${inv.status === s ? 'btn-primary' : 'btn-outline'}`}
                          onClick={e => { e.stopPropagation(); handleStatusChange(inv.id, s) }}>
                          {STATUS_CFG[s].emoji} {STATUS_CFG[s].label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); handleExportXML(inv) }}>
                        <Download size={14} /> Export Factur-X XML
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); generatePDF(inv) }}>
                        <Printer size={14} /> Imprimer PDF
                      </button>
                      {inv.chorus_pro && (
                        <a href="https://chorus-pro.fr" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                          <ExternalLink size={14} /> Soumettre via Chorus Pro
                        </a>
                      )}
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={e => { e.stopPropagation(); handleDelete(inv.id) }}>
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Nouvelle facture électronique</h2>
              <button onClick={resetForm} style={{ background: 'none', color: 'var(--gray-500)', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 15, color: 'var(--green-700)' }}>Émetteur</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-input" required value={fEmetteurNom} onChange={e => setFEmetteurNom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>SIRET émetteur (972...) *</label>
                  <input className="form-input" required value={fEmetteurSiret} onChange={e => setFEmetteurSiret(e.target.value)} placeholder="972 XXX XXX XXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input className="form-input" value={fEmetteurAdresse} onChange={e => setFEmetteurAdresse(e.target.value)} placeholder="Adresse complète" />
              </div>

              <h3 style={{ fontSize: 15, color: 'var(--green-700)' }}>Destinataire</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-input" required value={fDestNom} onChange={e => setFDestNom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>SIRET destinataire *</label>
                  <input className="form-input" required value={fDestSiret} onChange={e => setFDestSiret(e.target.value)} placeholder="XXX XXX XXX XXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input className="form-input" value={fDestAdresse} onChange={e => setFDestAdresse(e.target.value)} placeholder="Adresse complète" />
              </div>

              <h3 style={{ fontSize: 15, color: 'var(--green-700)' }}>Détails</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Date d'émission *</label>
                  <input className="form-input" type="date" required value={fDate} onChange={e => setFDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date d'échéance *</label>
                  <input className="form-input" type="date" required value={fEcheance} onChange={e => setFEcheance(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Taux TVA par défaut (%)</label>
                  <select className="form-input" value={fTauxTva} onChange={e => setFTauxTva(Number(e.target.value))}>
                    {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minHeight: 48 }}>
                    <input type="checkbox" checked={fChorusPro} onChange={e => setFChorusPro(e.target.checked)} />
                    🏛️ Chorus Pro
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Conditions de paiement</label>
                <input className="form-input" value={fConditionsPaiement} onChange={e => setFConditionsPaiement(e.target.value)} placeholder="Ex: Paiement à 30 jours, virement bancaire..." />
              </div>

              <h3 style={{ fontSize: 15, color: 'var(--green-700)' }}>Lignes</h3>
              {fLignes.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label style={{ fontSize: 12 }}>Désignation</label>}
                    <input className="form-input" required value={l.description} onChange={e => handleLineChange(i, 'description', e.target.value)} placeholder="Produit ou service" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label style={{ fontSize: 12 }}>Quantité</label>}
                    <input className="form-input" type="number" min={0} step="0.01" value={l.quantite} onChange={e => handleLineChange(i, 'quantite', Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label style={{ fontSize: 12 }}>Unité</label>}
                    <select className="form-input" value={l.unite} onChange={e => handleLineChange(i, 'unite', e.target.value)}>
                      {['kg', 'tonne', 'unité', 'caisse', 'botte', 'sac', 'forfait', 'heure'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label style={{ fontSize: 12 }}>Prix unitaire HT</label>}
                    <input className="form-input" type="number" min={0} step="0.01" value={l.prix_unitaire_ht} onChange={e => handleLineChange(i, 'prix_unitaire_ht', Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    {i === 0 && <label style={{ fontSize: 12 }}>Taux TVA</label>}
                    <select className="form-input" value={l.taux_tva} onChange={e => handleLineChange(i, 'taux_tva', Number(e.target.value))}>
                      {TVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeLine(i)} disabled={fLignes.length <= 1}
                    style={{ background: 'none', color: fLignes.length <= 1 ? 'var(--gray-300)' : 'var(--red)', minHeight: 48, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addLine}><Plus size={14} /> Ajouter une ligne</button>

              <div className="form-group">
                <label>Mentions légales obligatoires</label>
                <textarea className="form-input" rows={4} value={fMentionsLegales} onChange={e => setFMentionsLegales(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={2} value={fNotes} onChange={e => setFNotes(e.target.value)} />
              </div>

              {/* Totals preview */}
              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
                {(() => {
                  const ht = fLignes.reduce((s, l) => s + l.prix_unitaire_ht * l.quantite, 0)
                  const tva = fLignes.reduce((s, l) => s + l.prix_unitaire_ht * l.quantite * l.taux_tva / 100, 0)
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                      <span>HT: <strong>{ht.toFixed(2)}€</strong></span>
                      <span>TVA: <strong>{tva.toFixed(2)}€</strong></span>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>Net à payer TTC: {(ht + tva).toFixed(2)}€</span>
                    </div>
                  )
                })()}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer la facture</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EInvoicingPage
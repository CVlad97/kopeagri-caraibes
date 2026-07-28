import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Package, Clock, MapPin, Zap, Heart, ShoppingCart,
  Download, MessageCircle, Filter, TrendingUp, Timer, Eye, Plus, X, Trash2,
  ArrowRight, Leaf, AlertTriangle, Sparkles, Map, List, ExternalLink
} from 'lucide-react'
import { COMMUNE_COORDS, PRICE_REFERENCES } from '../services/billingService'
import { getAll as getData, MARTINIQUE_COMMUNES, AGRICULTURE_CULTURES } from '../services/dataService'
import type { Lot, Order } from '../services/dataService'

/* ===== Types ===== */
interface MarketplaceLot {
  id: string
  product: string
  producer: string
  commune: string
  qty: number
  unit: string
  price: number
  originalPrice?: number
  quality: string
  category: 'lot_standard' | 'anti_gaspillage' | 'demande_achat' | 'export'
  status: 'disponible' | 'réservé' | 'expiré' | 'vendu'
  expiresAt: string
  description: string
  certs: string[]
  aiSuggested: boolean
  budget?: number
  deliveryLocation?: string
  deadline?: string
  created_at: string
}

interface PriceTrend {
  product: string
  trend: 'up' | 'down' | 'stable'
  change: number
  currentPrice: number
}

const LS_KEY = 'kopeagri_marketplace'

const CATEGORIES = [
  { value: 'lot_standard', label: 'Achats', emoji: '📦' },
  { value: 'anti_gaspillage', label: 'Anti-gaspillage', emoji: '🌱' },
  { value: 'demande_achat', label: 'Ventes', emoji: '🛒' },
  { value: 'export', label: 'Export', emoji: '🚢' },
] as const

const HERO_FILTERS = [
  { value: 'lot_standard', label: 'Achats', emoji: '📦' },
  { value: 'demande_achat', label: 'Ventes', emoji: '🛒' },
  { value: 'anti_gaspillage', label: 'Anti-gaspillage', emoji: '🌱' },
  { value: 'export', label: 'Export', emoji: '🚢' },
] as const

const STATUS_CFG: Record<MarketplaceLot['status'], { label: string; color: string; emoji: string }> = {
  disponible: { label: 'Disponible', color: '#4CAF50', emoji: '✅' },
  réservé: { label: 'Réservé', color: '#FF9800', emoji: '🔒' },
  expiré: { label: 'Expiré', color: '#9E9E9E', emoji: '⏰' },
  vendu: { label: 'Vendu', color: '#1B5E20', emoji: '💰' },
}

const QUALITY_BADGES: Record<string, { label: string; cls: string; emoji: string }> = {
  'Extra': { label: 'Extra', cls: 'badge-gold', emoji: '⭐' },
  'Premium': { label: 'Premium', cls: 'badge-green', emoji: '✦' },
  'Classe I': { label: 'Classe I', cls: 'badge-blue', emoji: 'Ⅰ' },
  'Classe II': { label: 'Classe II', cls: 'badge-teal', emoji: 'Ⅱ' },
  'Standard': { label: 'Standard', cls: 'badge-orange', emoji: '●' },
}

const CERT_BADGES: Record<string, { color: string; emoji: string }> = {
  'Bio': { color: '#4CAF50', emoji: '🌿' },
  'AOC': { color: '#1565C0', emoji: '🏅' },
  'AOP': { color: '#1565C0', emoji: '🏅' },
  'Label Rouge': { color: '#C62828', emoji: '🔴' },
  'IGP': { color: '#FF8F00', emoji: '🛡️' },
  'HVE': { color: '#2E7D32', emoji: '🌾' },
  'Commerce équitable': { color: '#6A1B9A', emoji: '🤝' },
}

/* ===== CRUD ===== */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getAll(): MarketplaceLot[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAll(items: MarketplaceLot[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function addLot(item: Omit<MarketplaceLot, 'id' | 'created_at'>): MarketplaceLot {
  const all = getAll()
  const newItem: MarketplaceLot = { ...item, id: generateId(), created_at: new Date().toISOString() }
  all.push(newItem)
  saveAll(all)
  return newItem
}

function deleteLot(id: string): void {
  saveAll(getAll().filter(l => l.id !== id))
}

function updateLotStatus(id: string, status: MarketplaceLot['status']): void {
  const all = getAll()
  const idx = all.findIndex(l => l.id === id)
  if (idx !== -1) {
    all[idx] = { ...all[idx], status }
    saveAll(all)
  }
}

/* ===== Timer helpers ===== */
function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expiré'
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hours > 24) return `${Math.floor(hours / 24)}j ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins}min`
  return `${mins}min`
}

function getTimeLeftUrgent(expiresAt: string): boolean {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 6 * 3600000 // less than 6h
}

function getTimeLeftWarning(expiresAt: string): boolean {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 24 * 3600000 // less than 24h
}

/* ===== Distance calculation (Haversine) ===== */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ===== CSV ===== */
function exportCSV(lots: MarketplaceLot[]): void {
  const headers = ['Produit', 'Producteur', 'Commune', 'Quantité', 'Unité', 'Prix', 'Prix Original', 'Catégorie', 'Statut', 'Qualité', 'Certifications', 'Expiration', 'Description']
  const rows = lots.map(l => [
    l.product, l.producer, l.commune, l.qty, l.unit, l.price,
    l.originalPrice || '', l.category, l.status, l.quality,
    l.certs.join('; '), l.expiresAt, l.description
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'marketplace_kopeagri.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ===== AI Price Trends (mock from PRICE_REFERENCES) ===== */
function generatePriceTrends(): PriceTrend[] {
  const products = Object.keys(PRICE_REFERENCES).slice(0, 8)
  return products.map(product => {
    const ref = PRICE_REFERENCES[product]
    const rand = Math.random()
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let change = 0
    if (rand > 0.6) { trend = 'up'; change = Math.round((5 + Math.random() * 20) * 10) / 10 }
    else if (rand > 0.35) { trend = 'down'; change = Math.round((3 + Math.random() * 15) * 10) / 10 }
    else { change = Math.round(Math.random() * 3 * 10) / 10 }
    return {
      product: product.charAt(0).toUpperCase() + product.slice(1),
      trend,
      change,
      currentPrice: Math.round((ref.min + (ref.max - ref.min) * Math.random()) * 100) / 100,
    }
  })
}

/* ===== Seed demo data ===== */
function seedMarketplaceIfEmpty(): void {
  if (getAll().length > 0) return
  const now = Date.now()
  const lots: MarketplaceLot[] = [
    // Standard lots
    {
      id: 'ml1', product: 'Banane Cavendish', producer: 'Habitation Clément', commune: 'Le François',
      qty: 500, unit: 'kg', price: 1.20, quality: 'Extra', category: 'lot_standard',
      status: 'disponible', expiresAt: new Date(now + 3 * 86400000).toISOString(),
      description: 'Bananes premium, récolte J-1, calibre homogène. Idéal export et grande distribution.',
      certs: ['Bio', 'Commerce équitable'], aiSuggested: false, created_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'ml2', product: 'Mangue José', producer: 'Domaine de la Montagne Pelée', commune: 'Le Morne-Rouge',
      qty: 200, unit: 'kg', price: 3.50, quality: 'Premium', category: 'lot_standard',
      status: 'disponible', expiresAt: new Date(now + 2 * 86400000).toISOString(),
      description: 'Mangues José mûres à point, parfaites pour le marché frais et la transformation.',
      certs: ['Bio', 'HVE'], aiSuggested: false, created_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'ml3', product: 'Avocat Haas', producer: 'Ferme Aublet', commune: 'Basse-Pointe',
      qty: 150, unit: 'kg', price: 4.00, quality: 'Extra', category: 'lot_standard',
      status: 'disponible', expiresAt: new Date(now + 4 * 86400000).toISOString(),
      description: 'Avocats Haas mûrs, calibre 12-14. Parfaits pour la restauration.',
      certs: ['HVE'], aiSuggested: false, created_at: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'ml4', product: 'Ananas Victoria', producer: 'Jardins du Carbet', commune: 'Le Carbet',
      qty: 80, unit: 'pièce', price: 3.20, quality: 'Premium', category: 'lot_standard',
      status: 'disponible', expiresAt: new Date(now + 5 * 86400000).toISOString(),
      description: 'Ananas Victoria sucrés et parfumés, récolte du jour.',
      certs: ['Bio'], aiSuggested: false, created_at: new Date(now - 86400000).toISOString(),
    },
    // Anti-gaspillage lots
    {
      id: 'mg1', product: 'Banane plantain', producer: 'Koulibri du Vauclin', commune: 'Le Vauclin',
      qty: 300, unit: 'kg', price: 0.90, originalPrice: 1.80, quality: 'Standard', category: 'anti_gaspillage',
      status: 'disponible', expiresAt: new Date(now + 18 * 3600000).toISOString(),
      description: 'Invendus de la semaine — bananes plantain encore consommables, légèrement mûres. Parfaites pour chips ou cuisine.',
      certs: [], aiSuggested: false, created_at: new Date(now - 12 * 3600000).toISOString(),
    },
    {
      id: 'mg2', product: 'Christophine', producer: 'EARL Rivière-Salée', commune: 'Rivière-Salée',
      qty: 120, unit: 'kg', price: 0.50, originalPrice: 1.20, quality: 'Classe II', category: 'anti_gaspillage',
      status: 'disponible', expiresAt: new Date(now + 8 * 3600000).toISOString(),
      description: 'Surplus de récolte — christophines de calibre irrégulier mais excellente qualité gustative.',
      certs: [], aiSuggested: false, created_at: new Date(now - 6 * 3600000).toISOString(),
    },
    {
      id: 'mg3', product: 'Tomate', producer: 'Jardins du Carbet', commune: 'Le Carbet',
      qty: 60, unit: 'kg', price: 1.00, originalPrice: 2.50, quality: 'Standard', category: 'anti_gaspillage',
      status: 'disponible', expiresAt: new Date(now + 24 * 3600000).toISOString(),
      description: 'Tomates très mûres — idéales pour sauces, soupes et conserves.',
      certs: [], aiSuggested: false, created_at: new Date(now - 8 * 3600000).toISOString(),
    },
    {
      id: 'mg4', product: 'Giraumon', producer: 'Koulibri du Vauclin', commune: 'Le Vauclin',
      qty: 80, unit: 'kg', price: 0.60, originalPrice: 1.50, quality: 'Classe II', category: 'anti_gaspillage',
      status: 'disponible', expiresAt: new Date(now + 36 * 3600000).toISOString(),
      description: 'Giraumons invendus du marché — quelques marques superficielles, chair parfaite.',
      certs: [], aiSuggested: false, created_at: new Date(now - 10 * 3600000).toISOString(),
    },
    // Demandes d'achat
    {
      id: 'md1', product: 'Igname', producer: 'Supermarché Score Le Lamentin', commune: 'Le Lamentin',
      qty: 500, unit: 'kg', price: 2.50, quality: 'Premium', category: 'demande_achat',
      status: 'disponible', expiresAt: new Date(now + 7 * 86400000).toISOString(),
      description: 'Recherche igname de qualité premium pour approvisionnement hebdomadaire.',
      certs: [], aiSuggested: false, budget: 1250,
      deliveryLocation: 'Centre Commercial Palmyre, Le Lamentin',
      deadline: '2026-08-01', created_at: new Date(now - 2 * 86400000).toISOString(),
    },
    {
      id: 'md2', product: 'Patate douce', producer: 'Hôtel Batelière', commune: 'Schœlcher',
      qty: 200, unit: 'kg', price: 2.00, quality: 'Extra', category: 'demande_achat',
      status: 'disponible', expiresAt: new Date(now + 5 * 86400000).toISOString(),
      description: 'Besoin urgent patates douces pour menu restaurant — livraisonhebdomadaire récurrente.',
      certs: [], aiSuggested: false, budget: 400,
      deliveryLocation: 'Hôtel Batelière, Schœlcher',
      deadline: '2026-07-30', created_at: new Date(now - 86400000).toISOString(),
    },
    // Export lots
    {
      id: 'me1', product: 'Banane Cavendish', producer: 'Habitation Clément', commune: 'Le François',
      qty: 2000, unit: 'kg', price: 0.95, quality: 'Extra', category: 'export',
      status: 'disponible', expiresAt: new Date(now + 10 * 86400000).toISOString(),
      description: 'Lot export — bananes calibre homogène, conditionnement carton 18.5kg. Prêt port FdF.',
      certs: ['Bio', 'IGP', 'Commerce équitable'], aiSuggested: false, created_at: new Date(now - 3 * 86400000).toISOString(),
    },
  ]
  saveAll(lots)
}

/* ===== Component ===== */
const MarketplacePage: React.FC = () => {
  const [lots, setLots] = useState<MarketplaceLot[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards')
  const [now, setNow] = useState(Date.now())
  const [priceTrends] = useState<PriceTrend[]>(() => generatePriceTrends())

  // Form
  const [formProduct, setFormProduct] = useState('')
  const [formProducer, setFormProducer] = useState('')
  const [formCommune, setFormCommune] = useState('')
  const [formQty, setFormQty] = useState(1)
  const [formUnit, setFormUnit] = useState('kg')
  const [formPrice, setFormPrice] = useState(0)
  const [formOrigPrice, setFormOrigPrice] = useState(0)
  const [formCategory, setFormCategory] = useState<MarketplaceLot['category']>('lot_standard')
  const [formQuality, setFormQuality] = useState('Standard')
  const [formDesc, setFormDesc] = useState('')
  const [formExpires, setFormExpires] = useState('')
  const [formCerts, setFormCerts] = useState<string[]>([])
  const [formBudget, setFormBudget] = useState(0)
  const [formDelivery, setFormDelivery] = useState('')
  const [formDeadline, setFormDeadline] = useState('')

  const load = useCallback(() => setLots(getAll()), [])
  useEffect(() => {
    seedMarketplaceIfEmpty()
    load()
  }, [load])

  // Tick timer every minute
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(iv)
  }, [])

  const resetForm = () => {
    setFormProduct(''); setFormProducer(''); setFormCommune('')
    setFormQty(1); setFormUnit('kg'); setFormPrice(0); setFormOrigPrice(0)
    setFormCategory('lot_standard'); setFormQuality('Standard')
    setFormDesc(''); setFormExpires(''); setFormCerts([])
    setFormBudget(0); setFormDelivery(''); setFormDeadline('')
    setShowCreate(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addLot({
      product: formProduct, producer: formProducer, commune: formCommune,
      qty: formQty, unit: formUnit, price: formPrice,
      originalPrice: formCategory === 'anti_gaspillage' ? formOrigPrice : undefined,
      category: formCategory, status: 'disponible', quality: formQuality,
      expiresAt: formExpires || new Date(Date.now() + 86400000 * 3).toISOString(),
      description: formDesc, certs: formCerts, aiSuggested: false,
      budget: formCategory === 'demande_achat' ? formBudget : undefined,
      deliveryLocation: formCategory === 'demande_achat' ? formDelivery : undefined,
      deadline: formCategory === 'demande_achat' ? formDeadline : undefined,
    })
    resetForm(); load()
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette offre ?')) { deleteLot(id); load() }
  }

  const handleInterest = (lot: MarketplaceLot) => {
    const msg = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre offre : ${lot.product} (${lot.qty} ${lot.unit}) à ${lot.price}€/${lot.unit}. Ref: ${lot.id}`
    )
    window.open(`https://wa.me/596696000000?text=${msg}`, '_blank')
  }

  const handleReserve = (lot: MarketplaceLot) => {
    const msg = encodeURIComponent(
      `🌱 Réservation anti-gaspillage : ${lot.product} (${lot.qty} ${lot.unit}) à ${lot.price}€/${lot.unit} — Réf: ${lot.id}`
    )
    window.open(`https://wa.me/596696000000?text=${msg}`, '_blank')
    updateLotStatus(lot.id, 'réservé')
    load()
  }

  const handleProposeLot = (lot: MarketplaceLot) => {
    const msg = encodeURIComponent(
      `Bonjour, suite à votre demande d'achat de ${lot.product} (${lot.qty} ${lot.unit}), je souhaite proposer mon lot. Réf: ${lot.id}`
    )
    window.open(`https://wa.me/596696000000?text=${msg}`, '_blank')
  }

  const toggleCert = (cert: string) => {
    setFormCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])
  }

  const filtered = useMemo(() => lots.filter(l => {
    if (filterCat !== 'all' && l.category !== filterCat) return false
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return l.product.toLowerCase().includes(q) || l.producer.toLowerCase().includes(q) || l.commune.toLowerCase().includes(q)
    }
    return true
  }), [lots, filterCat, filterStatus, search, now])

  const antiGaspillage = useMemo(() => filtered.filter(l => l.category === 'anti_gaspillage'), [filtered, now])
  const standards = useMemo(() => filtered.filter(l => l.category === 'lot_standard'), [filtered])
  const demandes = useMemo(() => filtered.filter(l => l.category === 'demande_achat'), [filtered])
  const exports_ = useMemo(() => filtered.filter(l => l.category === 'export'), [filtered])

  // AI suggestions (mock based on existing data + random matching)
  const aiSuggestions = useMemo(() => {
    const available = lots.filter(l => l.status === 'disponible' && l.category !== 'demande_achat')
    // Simulate AI picking the most relevant ones
    return available.slice(0, 4).map(l => ({ ...l, aiSuggested: true }))
  }, [lots])

  const stats = useMemo(() => ({
    total: lots.length,
    disponibles: lots.filter(l => l.status === 'disponible').length,
    antiGasp: lots.filter(l => l.category === 'anti_gaspillage').length,
    economie: lots.filter(l => l.category === 'anti_gaspillage' && l.originalPrice).reduce((s, l) => s + ((l.originalPrice! - l.price) * l.qty), 0),
    demandes: lots.filter(l => l.category === 'demande_achat').length,
    export: lots.filter(l => l.category === 'export').length,
  }), [lots])

  // Map view data
  const mapData = useMemo(() => {
    return filtered.map(lot => {
      const coords = COMMUNE_COORDS[lot.commune]
      return {
        ...lot,
        lat: coords?.lat ?? 14.6161,
        lng: coords?.lng ?? -61.0636,
        distance: coords ? haversineKm(14.6161, -61.0636, coords.lat, coords.lng) : 0,
      }
    }).sort((a, b) => a.distance - b.distance)
  }, [filtered])

  /* ===== Render Helpers ===== */
  const renderCountdownBadge = (expiresAt: string) => {
    const timeLeft = getTimeLeft(expiresAt)
    const isExpired = timeLeft === 'Expiré'
    const isUrgent = getTimeLeftUrgent(expiresAt)
    const isWarning = getTimeLeftWarning(expiresAt)

    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 600,
        color: isExpired ? '#9E9E9E' : isUrgent ? '#C62828' : isWarning ? '#E65100' : '#FF9800',
        background: isExpired ? 'rgba(158,158,158,0.1)' : isUrgent ? 'rgba(198,40,40,0.1)' : isWarning ? 'rgba(230,81,0,0.1)' : 'rgba(255,152,0,0.1)',
        padding: '3px 10px', borderRadius: 12,
        animation: isUrgent ? 'pulse 1.5s infinite' : undefined,
      }}>
        <Timer size={14} />
        {timeLeft}
      </span>
    )
  }

  const renderCerts = (certs: string[]) => {
    if (!certs.length) return null
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {certs.map(c => {
          const cfg = CERT_BADGES[c] || { color: '#666', emoji: '📋' }
          return (
            <span key={c} style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 600, color: cfg.color,
              background: cfg.color + '15', padding: '2px 8px', borderRadius: 10,
            }}>
              {cfg.emoji} {c}
            </span>
          )
        })}
      </div>
    )
  }

  const renderLotCard = (lot: MarketplaceLot) => {
    const isAntiGasp = lot.category === 'anti_gaspillage'
    const isDemande = lot.category === 'demande_achat'
    const isExport = lot.category === 'export'
    const discount = isAntiGasp && lot.originalPrice ? Math.round((1 - lot.price / lot.originalPrice) * 100) : 0

    return (
      <div key={lot.id} className="section-block" style={{
        padding: 20,
        border: isAntiGasp ? '2px solid #4CAF50' : isExport ? '2px solid #1565C0' : lot.aiSuggested ? '2px solid #2563EB' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Category badge */}
        {isAntiGasp && (
          <div style={{
            position: 'absolute', top: -1, right: 16,
            background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', color: 'white',
            padding: '5px 14px', borderRadius: '0 0 12px 12px', fontSize: 12, fontWeight: 700,
          }}>
            🌱 -{discount}%
          </div>
        )}
        {isExport && (
          <div style={{
            position: 'absolute', top: -1, right: 16,
            background: 'linear-gradient(135deg, #0D47A1, #1565C0)', color: 'white',
            padding: '5px 14px', borderRadius: '0 0 12px 12px', fontSize: 12, fontWeight: 700,
          }}>
            🚢 Export
          </div>
        )}
        {lot.aiSuggested && !isAntiGasp && !isExport && (
          <div style={{
            position: 'absolute', top: -1, right: 16,
            background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', color: 'white',
            padding: '5px 14px', borderRadius: '0 0 12px 12px', fontSize: 12, fontWeight: 700,
          }}>
            🤖 Recommandé
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lot.product}
            </h3>
            <span style={{ fontSize: 13, color: 'var(--gray-500, #666)' }}>
              {isDemande ? '🛒 Demande par ' : 'Par '}{lot.producer} • 📍 {lot.commune}
            </span>
          </div>
          <span className={`badge ${STATUS_CFG[lot.status].label === 'Disponible' ? 'badge-green' : STATUS_CFG[lot.status].label === 'Réservé' ? 'badge-gold' : 'badge-orange'}`}>
            {STATUS_CFG[lot.status].emoji} {STATUS_CFG[lot.status].label}
          </span>
        </div>

        {/* Description */}
        {lot.description && (
          <p style={{ fontSize: 13, color: 'var(--gray-600, #555)', lineHeight: 1.6, marginBottom: 12 }}>
            {lot.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className={`badge ${QUALITY_BADGES[lot.quality]?.cls || 'badge-orange'}`}>
            {QUALITY_BADGES[lot.quality]?.emoji || '●'} {lot.quality}
          </span>
          <span className="badge badge-teal">📦 {lot.qty} {lot.unit}</span>
          {isAntiGasp && lot.originalPrice && (
            <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--gray-400, #999)' }}>
              {lot.originalPrice}€/{lot.unit}
            </span>
          )}
        </div>

        {/* Certifications */}
        {renderCerts(lot.certs)}

        {/* Demande d'achat specifics */}
        {isDemande && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,152,0,0.08)', borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
              {lot.budget && <span>💰 Budget : <strong>{lot.budget}€</strong></span>}
              {lot.deliveryLocation && <span>📍 {lot.deliveryLocation}</span>}
              {lot.deadline && <span>📅 Avant : <strong>{lot.deadline}</strong></span>}
            </div>
          </div>
        )}

        {/* Price + Timer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <div>
            <span style={{
              fontSize: 22, fontWeight: 800,
              color: isAntiGasp ? '#2E7D32' : isExport ? '#1565C0' : 'var(--gray-900, #111)',
            }}>
              {lot.price}€
            </span>
            <span style={{ fontSize: 13, color: 'var(--gray-500, #666)' }}>/{lot.unit}</span>
          </div>
          {renderCountdownBadge(lot.expiresAt)}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {lot.status === 'disponible' && isAntiGasp && (
            <button className="btn btn-primary btn-sm" onClick={() => handleReserve(lot)} style={{ background: '#2E7D32' }}>
              <Leaf size={14} /> Réserver
            </button>
          )}
          {lot.status === 'disponible' && isDemande && (
            <button className="btn btn-primary btn-sm" onClick={() => handleProposeLot(lot)}>
              <Package size={14} /> Proposer mon lot
            </button>
          )}
          {lot.status === 'disponible' && !isAntiGasp && !isDemande && (
            <button className="btn btn-primary btn-sm" onClick={() => handleInterest(lot)}>
              <MessageCircle size={14} /> Je suis intéressé
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={() => handleDelete(lot.id)} style={{ color: '#C62828', borderColor: '#C62828' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  const renderMapViewItem = (item: MarketplaceLot & { distance: number }) => {
    const isAntiGasp = item.category === 'anti_gaspillage'
    const isExport = item.category === 'export'
    const discount = isAntiGasp && item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0
    const timeLeft = getTimeLeft(item.expiresAt)

    return (
      <div key={item.id} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px', borderBottom: '1px solid var(--gray-200, #e5e5e5)',
        transition: 'background 0.15s',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: isAntiGasp ? '#E8F5E9' : isExport ? '#E3F2FD' : '#FFF3E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {isAntiGasp ? '🌱' : isExport ? '🚢' : '📦'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.product}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500, #666)' }}>{item.producer} • {item.commune}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: isAntiGasp ? '#2E7D32' : 'var(--gray-900, #111)' }}>
            {item.price}€/{item.unit}
            {isAntiGasp && discount > 0 && <span style={{ fontSize: 11, color: '#2E7D32', marginLeft: 4 }}>-{discount}%</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500, #666)' }}>
            📍 {Math.round(item.distance)} km • ⏱ {timeLeft}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* ===== 1. HERO SECTION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        borderRadius: 16, padding: '32px 24px', marginBottom: 24,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, opacity: 0.08 }}>🌾</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          🛒 Marketplace KopéAgri
        </h1>
        <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 20, maxWidth: 600 }}>
          Achetez, vendez, sauvez — connectez-vous aux opportunités agricoles de Martinique
        </p>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '4px 4px 4px 16px',
          marginBottom: 16, maxWidth: 600,
        }}>
          <Search size={20} style={{ color: '#666', flexShrink: 0 }} />
          <input
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 15, background: 'transparent' }}
            placeholder="Rechercher un produit, producteur, commune..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Hero filter toggles */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterCat('all')}
            style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filterCat === 'all' ? 'white' : 'rgba(255,255,255,0.2)',
              color: filterCat === 'all' ? '#1B5E20' : 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
            }}
          >
            🔍 Tous
          </button>
          {HERO_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterCat(filterCat === f.value ? 'all' : f.value)}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: filterCat === f.value ? 'white' : 'rgba(255,255,255,0.2)',
                color: filterCat === f.value ? '#1B5E20' : 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>📦</div>
          <div className="stat-info">
            <span className="stat-num">{stats.disponibles}</span>
            <span className="stat-label">Lots disponibles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>🌱</div>
          <div className="stat-info">
            <span className="stat-num">{stats.antiGasp}</span>
            <span className="stat-label">Anti-gaspillage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>💰</div>
          <div className="stat-info">
            <span className="stat-num">{Math.round(stats.economie)}€</span>
            <span className="stat-label">Économies anti-gaspillage</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FCE4EC', color: '#C62828' }}>🛒</div>
          <div className="stat-info">
            <span className="stat-num">{stats.demandes}</span>
            <span className="stat-label">Demandes d'achat</span>
          </div>
        </div>
      </div>

      {/* ===== 5. AI SUGGESTIONS ===== */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowAISuggestions(!showAISuggestions)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 12, width: '100%',
            background: showAISuggestions ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : 'linear-gradient(135deg, #1E3A5F, #2563EB)',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Sparkles size={20} />
          {showAISuggestions ? 'Masquer les suggestions IA' : 'Suggestions IA — Basé sur votre profil'}
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{showAISuggestions ? '▲' : '▼'}</span>
        </button>

        {showAISuggestions && (
          <div style={{
            marginTop: 12, padding: 20, borderRadius: 12,
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            borderLeft: '4px solid #2563EB',
          }}>
            <h2 style={{ fontSize: 16, marginBottom: 6 }}>🤖 Basé sur votre profil, ces lots vous intéressent</h2>
            <p style={{ fontSize: 13, color: '#3B82F6', marginBottom: 16 }}>
              L'IA analyse vos cultures et besoins pour vous proposer les meilleures opportunités
            </p>

            {/* Price Trend Alerts */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#1E40AF' }}>
                <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Alertes prix de la semaine
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {priceTrends.filter(t => t.trend !== 'stable').map(trend => (
                  <div key={trend.product} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13,
                    background: trend.trend === 'up' ? '#FEE2E2' : '#DCFCE7',
                    color: trend.trend === 'up' ? '#991B1B' : '#166534',
                    fontWeight: 500,
                  }}>
                    {trend.trend === 'up' ? '📈' : '📉'} Le prix de {trend.product} {trend.trend === 'up' ? 'monte' : 'baisse'} cette semaine {trend.trend === 'up' ? '+' : '-'}{trend.change}%
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested lots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {aiSuggestions.map(lot => renderLotCard(lot))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 4. ANTI-GASPI BANNER (TooGoodToGo model) ===== */}
      {antiGaspillage.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          {/* Big green banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)',
            borderRadius: '16px 16px 0 0',
            padding: '20px 24px',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                🌱 Lots anti-gaspillage — Jusqu'à -50%
              </h2>
              <p style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                Ne laissez plus rien se perdre! 🌍 Sauvez les invendus et économisez
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)', padding: '10px 20px',
              borderRadius: 12, fontWeight: 700, fontSize: 18,
            }}>
              💰 {Math.round(stats.economie)}€ d'économies
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 0,
            background: '#E8F5E9', padding: 16, borderRadius: '0 0 16px 16px',
          }}>
            {antiGaspillage.map(lot => {
              const discount = lot.originalPrice ? Math.round((1 - lot.price / lot.originalPrice) * 100) : 50
              const timeLeft = getTimeLeft(lot.expiresAt)
              const isUrgent = getTimeLeftUrgent(lot.expiresAt)
              return (
                <div key={lot.id} style={{
                  background: 'white', borderRadius: 12, margin: 8,
                  overflow: 'hidden', border: '2px solid #4CAF50',
                  boxShadow: '0 2px 8px rgba(46,125,50,0.12)',
                }}>
                  {/* Anti-gaspillage card header */}
                  <div style={{
                    background: isUrgent
                      ? 'linear-gradient(135deg, #C62828, #E53935)'
                      : 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                    color: 'white', padding: '10px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>🌱 -{discount}%</span>
                    {renderCountdownBadge(lot.expiresAt)}
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{lot.product}</h3>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      {lot.producer} • 📍 {lot.commune}
                    </p>
                    {lot.description && (
                      <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 10 }}>
                        {lot.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span className="badge badge-teal">📦 {lot.qty} {lot.unit}</span>
                      <span className={`badge ${QUALITY_BADGES[lot.quality]?.cls || 'badge-orange'}`}>
                        {lot.quality}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 13, marginRight: 8 }}>
                          {lot.originalPrice}€/{lot.unit}
                        </span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>
                          {lot.price}€
                        </span>
                        <span style={{ fontSize: 12, color: '#666' }}>/{lot.unit}</span>
                      </div>
                    </div>
                    {lot.status === 'disponible' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReserve(lot)}
                        style={{ width: '100%', marginTop: 12, background: '#2E7D32', justifyContent: 'center' }}
                      >
                        <Leaf size={14} /> Réserver maintenant
                      </button>
                    ) : (
                      <div style={{
                        marginTop: 12, textAlign: 'center', padding: 8,
                        background: '#FFF3E0', borderRadius: 8, color: '#E65100', fontWeight: 600, fontSize: 13,
                      }}>
                        🔒 Réservé
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== Toolbar: View toggle + Filters + Actions ===== */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('cards')}
          >
            <List size={14} /> Cartes
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={14} /> Vue carte
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(filtered)}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAISuggestions(!showAISuggestions)}>
            <Zap size={16} /> {showAISuggestions ? 'Masquer IA' : 'Suggestions IA'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreate(true) }}>
            <Plus size={16} /> Nouvelle offre
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['all', 'disponible', 'réservé', 'expiré', 'vendu'] as const).map(s => (
          <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'Tous statuts' : `${STATUS_CFG[s].emoji} ${STATUS_CFG[s].label}`}
          </button>
        ))}
      </div>

      {/* ===== 2. LOTS DISPONIBLES ===== */}
      {viewMode === 'cards' && standards.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 19, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            📦 Lots disponibles
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {standards.map(lot => renderLotCard(lot))}
          </div>
        </div>
      )}

      {/* ===== 3. DEMANDES D'ACHAT ===== */}
      {viewMode === 'cards' && demandes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 19, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🛒 Demandes d'achat
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {demandes.map(lot => renderLotCard(lot))}
          </div>
        </div>
      )}

      {/* ===== EXPORT LOTS ===== */}
      {viewMode === 'cards' && exports_.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 19, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚢 Lots Export
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {exports_.map(lot => renderLotCard(lot))}
          </div>
        </div>
      )}

      {/* ===== 6. MAP VIEW ===== */}
      {viewMode === 'map' && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 19, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Map size={20} /> Vue par commune — distances depuis Fort-de-France
          </h2>
          <div className="section-block" style={{ padding: 0, overflow: 'hidden' }}>
            {mapData.length > 0 ? (
              mapData.map(item => renderMapViewItem(item))
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                Aucune offre trouvée pour cette zone
              </div>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 && viewMode === 'cards' && (
        <div className="section-block" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ color: 'var(--gray-500, #666)', marginBottom: 16 }}>Aucune offre trouvée. Créez la première !</p>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true) }}>
            <Plus size={16} /> Nouvelle offre
          </button>
        </div>
      )}

      {/* ===== 7. QUICK ACTIONS ===== */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14,
        marginTop: 24, marginBottom: 32,
      }}>
        <Link to="/lots" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '20px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
            border: '1px solid #FFB74D', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#E65100', marginBottom: 4 }}>Déposer un lot</div>
            <div style={{ fontSize: 12, color: '#BF360C' }}>Publiez vos produits sur la marketplace</div>
            <ArrowRight size={16} style={{ marginTop: 8, color: '#E65100' }} />
          </div>
        </Link>
        <Link to="/orders" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '20px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
            border: '1px solid #64B5F6', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1565C0', marginBottom: 4 }}>Passer une commande</div>
            <div style={{ fontSize: 12, color: '#0D47A1' }}>Commandez directement aux producteurs</div>
            <ArrowRight size={16} style={{ marginTop: 8, color: '#1565C0' }} />
          </div>
        </Link>
        <Link to="/appels-offre" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '20px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
            border: '1px solid #BA68C8', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#6A1B9A', marginBottom: 4 }}>Consulter les appels d'offres</div>
            <div style={{ fontSize: 12, color: '#4A148C' }}>Trouvez des opportunités de transport et vente</div>
            <ArrowRight size={16} style={{ marginTop: 8, color: '#6A1B9A' }} />
          </div>
        </Link>
      </div>

      {/* ===== CREATE MODAL ===== */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius, 12px)', padding: 32,
            maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Nouvelle offre</h2>
              <button onClick={resetForm} style={{
                background: 'none', color: 'var(--gray-500, #666)',
                minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
              }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Produit *</label>
                  <input className="form-input" required value={formProduct} onChange={e => setFormProduct(e.target.value)} placeholder="Banane, mangue..." />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select className="form-input" value={formCategory} onChange={e => setFormCategory(e.target.value as MarketplaceLot['category'])}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{formCategory === 'demande_achat' ? 'Acheteur *' : 'Producteur *'}</label>
                  <input className="form-input" required value={formProducer} onChange={e => setFormProducer(e.target.value)} placeholder="Nom" />
                </div>
                <div className="form-group">
                  <label>Commune</label>
                  <select className="form-input" value={formCommune} onChange={e => setFormCommune(e.target.value)}>
                    <option value="">Sélectionner</option>
                    {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantité *</label>
                  <input className="form-input" type="number" required min={1} value={formQty} onChange={e => setFormQty(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Unité</label>
                  <select className="form-input" value={formUnit} onChange={e => setFormUnit(e.target.value)}>
                    {['kg', 'tonne', 'unité', 'caisse', 'botte', 'sac', 'pièce', 'lot'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix (€/{formUnit}) *</label>
                  <input className="form-input" type="number" required min={0} step={0.01} value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Qualité</label>
                  <select className="form-input" value={formQuality} onChange={e => setFormQuality(e.target.value)}>
                    {['Extra', 'Premium', 'Classe I', 'Classe II', 'Standard'].map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              {formCategory === 'anti_gaspillage' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Prix original (€/{formUnit})</label>
                    <input className="form-input" type="number" min={0} step={0.01} value={formOrigPrice} onChange={e => setFormOrigPrice(Number(e.target.value))} placeholder="Prix avant réduction" />
                  </div>
                </div>
              )}
              {formCategory === 'demande_achat' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget (€)</label>
                      <input className="form-input" type="number" min={0} step={0.01} value={formBudget} onChange={e => setFormBudget(Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Date limite</label>
                      <input className="form-input" type="date" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Lieu de livraison</label>
                    <input className="form-input" value={formDelivery} onChange={e => setFormDelivery(e.target.value)} placeholder="Adresse ou commune de livraison" />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Date d'expiration</label>
                <input className="form-input" type="datetime-local" value={formExpires} onChange={e => setFormExpires(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Certifications</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Bio', 'AOC', 'AOP', 'Label Rouge', 'IGP', 'HVE', 'Commerce équitable'].map(c => (
                    <button key={c} type="button" onClick={() => toggleCert(c)} style={{
                      padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: formCerts.includes(c) ? '#1B5E20' : '#f0f0f0',
                      color: formCerts.includes(c) ? 'white' : '#333',
                      border: '1px solid ' + (formCerts.includes(c) ? '#1B5E20' : '#ddd'),
                      transition: 'all 0.15s',
                    }}>
                      {(CERT_BADGES[c]?.emoji || '📋')} {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Détails sur le lot..." />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

export default MarketplacePage

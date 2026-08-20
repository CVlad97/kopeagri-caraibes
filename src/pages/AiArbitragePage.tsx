import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot, TrendingUp, TrendingDown, Minus, Truck, AlertTriangle,
  Globe, Package, Users, Lightbulb, Share2, ArrowRight,
  Calendar, MapPin, ChevronDown, ChevronUp, Zap, Leaf,
  MessageCircle, Ship, ShoppingCart, BarChart3, Sparkles, Layers
} from 'lucide-react'
import { PRICE_REFERENCES, COMMUNE_COORDS, getAllGeoMembers } from '../services/billingService'
import { getAll as getData } from '../services/dataService'
import type { Lot, Order } from '../services/dataService'

/* ===================================================================
   IA ARBITRAGE — KopéAgri Caraïbes
   Optimisation IA de la production, vente et export
   All data from localStorage + hardcoded Martinique crop calendar
   =================================================================== */

/* ===== TYPES ===== */
interface CropCalendar {
  id: string
  emoji: string
  nom: string
  categorie: 'fruit' | 'legume' | 'epice'
  saisonMois: number[]       // harvest months (0=Jan → 11=Dec)
  picMois: number[]          // peak months
  estimatedVolumeKg: number  // monthly estimated volume in Martinique
  priceKey: string           // key in PRICE_REFERENCES
}

interface PriceAdvice {
  crop: string
  emoji: string
  currentAvgPrice: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  signal: 'sell' | 'wait' | 'low'
  recommendedDate: string
  priceMin: number
  priceMax: number
  unit: string
}

interface RouteSuggestion {
  origin: string
  destination: string
  distanceKm: number
  transporter: string
  estimatedCost: number
  duration: string
  frigorifique: boolean
}

interface SurplusAlert {
  id: string
  crop: string
  emoji: string
  volumeKg: number
  commune: string
  urgency: 'high' | 'medium' | 'low'
  potentialSaving: number
  detectedAt: string
}

interface ExportComparison {
  crop: string
  emoji: string
  localPricePerKg: number
  exportPricePerKg: number
  transportCostPerKg: number
  netExportPrice: number
  recommendation: 'export' | 'local'
  advantage: number
  containerFill: number
}

interface MutualizationOpportunity {
  id: string
  orders: string[]
  destination: string
  timeframe: string
  totalVolumeKg: number
  individualCost: number
  mergedCost: number
  saving: number
  savingPercent: number
}

interface DailyInsight {
  date: string
  tip: string
  emoji: string
  category: string
}

/* ===== MARTINIQUE CROP CALENDAR ===== */
const CROP_CALENDAR: CropCalendar[] = [
  { id: 'banane', emoji: '🍌', nom: 'Banane', categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], estimatedVolumeKg: 45000, priceKey: 'banane' },
  { id: 'banane-plantain', emoji: '🍌', nom: 'Banane plantain', categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], estimatedVolumeKg: 18000, priceKey: 'banane plantain' },
  { id: 'mangue', emoji: '🥭', nom: 'Mangue', categorie: 'fruit', saisonMois: [2,3,4,5,6], picMois: [3,4], estimatedVolumeKg: 12000, priceKey: 'mangue' },
  { id: 'ananas', emoji: '🍍', nom: 'Ananas', categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [2,3,4,5], estimatedVolumeKg: 8000, priceKey: 'ananas' },
  { id: 'avocat', emoji: '🥑', nom: 'Avocat', categorie: 'fruit', saisonMois: [7,8,9,10,11], picMois: [8,9], estimatedVolumeKg: 9000, priceKey: 'avocat' },
  { id: 'citron', emoji: '🍋', nom: 'Citron', categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [6,7,8], estimatedVolumeKg: 5000, priceKey: 'citron' },
  { id: 'igname', emoji: '🍠', nom: 'Igname', categorie: 'legume', saisonMois: [10,11,0,1,2], picMois: [11,0], estimatedVolumeKg: 7000, priceKey: 'igname' },
  { id: 'dachine', emoji: '🥔', nom: 'Dachine', categorie: 'legume', saisonMois: [9,10,11,0,1], picMois: [10,11], estimatedVolumeKg: 5500, priceKey: 'dachine' },
  { id: 'patate-douce', emoji: '🟠', nom: 'Patate douce', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [10,11,0], estimatedVolumeKg: 8000, priceKey: 'patate douce' },
  { id: 'canne', emoji: '🎋', nom: 'Canne à sucre', categorie: 'epice', saisonMois: [1,2,3,4,5,6], picMois: [3,4,5], estimatedVolumeKg: 60000, priceKey: 'canne à sucre' },
  { id: 'cacao', emoji: '🍫', nom: 'Cacao', categorie: 'epice', saisonMois: [9,10,11], picMois: [10], estimatedVolumeKg: 3000, priceKey: 'cacao' },
  { id: 'cafe', emoji: '☕', nom: 'Café', categorie: 'epice', saisonMois: [9,10,11], picMois: [10], estimatedVolumeKg: 2000, priceKey: 'café' },
  { id: 'vanille', emoji: '🫘', nom: 'Vanille', categorie: 'epice', saisonMois: [6,7,8], picMois: [7], estimatedVolumeKg: 200, priceKey: 'vanille' },
  { id: 'piment', emoji: '🌶️', nom: 'Piment', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [7,8,9], estimatedVolumeKg: 3500, priceKey: 'piment' },
  { id: 'christophine', emoji: '🥬', nom: 'Christophine', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [9,10,11,0,1,2], estimatedVolumeKg: 6000, priceKey: 'christophine' },
  { id: 'giraumon', emoji: '🎃', nom: 'Giraumon', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [9,10,11], estimatedVolumeKg: 4500, priceKey: 'giraumon' },
  { id: 'fruit-a-pain', emoji: '🍞', nom: 'Fruit à pain', categorie: 'fruit', saisonMois: [5,6,7,8], picMois: [6,7], estimatedVolumeKg: 4000, priceKey: 'fruit à pain' },
  { id: 'tomate', emoji: '🍅', nom: 'Tomate', categorie: 'legume', saisonMois: [9,10,11,0,1,2], picMois: [10,11,0], estimatedVolumeKg: 6000, priceKey: 'tomate' },
  { id: 'concombre', emoji: '🥒', nom: 'Concombre', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [2,3,4], estimatedVolumeKg: 4000, priceKey: 'concombre' },
  { id: 'aubergine', emoji: '🍆', nom: 'Aubergine', categorie: 'legume', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [5,6,7], estimatedVolumeKg: 3500, priceKey: 'aubergine' },
  { id: 'corossol', emoji: '🍐', nom: 'Corossol', categorie: 'fruit', saisonMois: [5,6,7,8,9,10], picMois: [7,8], estimatedVolumeKg: 2500, priceKey: 'corossol' },
  { id: 'goyave', emoji: '🍈', nom: 'Goyave', categorie: 'fruit', saisonMois: [0,1,2,3,4,5,6,7,8,9,10,11], picMois: [8,9,10], estimatedVolumeKg: 3000, priceKey: 'goyave' },
  { id: 'malanga', emoji: '🫚', nom: 'Malanga', categorie: 'legume', saisonMois: [9,10,11,0,1], picMois: [10,11], estimatedVolumeKg: 3000, priceKey: 'malanga' },
]

const MOIS_NOMS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MOIS_COMPLETS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const TRANSPORTERS = [
  { name: 'Transport Tropical Express', commune: 'Le Lamentin', frigorifique: true, ratePerKm: 0.85 },
  { name: 'Livraison Caraïbes', commune: 'Le Marin', frigorifique: false, ratePerKm: 0.70 },
  { name: 'Logistique Nord Express', commune: 'Saint-Pierre', frigorifique: true, ratePerKm: 0.90 },
  { name: 'Camionnage Central', commune: 'Fort-de-France', frigorifique: false, ratePerKm: 0.65 },
]

const COMMUNES_HUBS = [
  'Fort-de-France', 'Le Lamentin', 'Le François', 'Le Robert',
  'Le Marin', 'Saint-Pierre', 'Schœlcher', 'Le Carbet',
  'Le Morne-Rouge', 'Sainte-Marie', 'Le Vauclin', 'Sainte-Anne',
]

const EXPORT_DESTINATIONS = [
  { name: 'Métropole (France)', premiumFactor: 1.8, transportPerKg: 0.45 },
  { name: 'Guadeloupe', premiumFactor: 1.3, transportPerKg: 0.20 },
  { name: 'Guyane française', premiumFactor: 1.5, transportPerKg: 0.35 },
  { name: 'Canada', premiumFactor: 2.2, transportPerKg: 0.65 },
  { name: 'Europe (UE)', premiumFactor: 2.0, transportPerKg: 0.55 },
]

const DAILY_TIPS: DailyInsight[] = [
  { date: '0', tip: 'Les agrumes sont en saison fraîche. Pensez à valoriser les citrons verts en jus et zestes pour l\'export.', emoji: '🍋', category: 'Fruits' },
  { date: '1', tip: 'C\'est la saison des ignames et dachines. Les prix montent en métropole — envisagez l\'export par groupage.', emoji: '🍠', category: 'Légumes' },
  { date: '2', tip: 'Les mangues arrivent sur les étals. Anticipez les surplus et préparez vos offres anti-gaspillage.', emoji: '🥭', category: 'Fruits' },
  { date: '3', tip: 'Les mangues sont à leur pic de saison. Envisagez d\'augmenter vos lots pour la vente et l\'export.', emoji: '🥭', category: 'Fruits' },
  { date: '4', tip: 'Période de pic pour ananas et canne. Les volumes sont élevés — négociez les tarifs transport.', emoji: '🍍', category: 'Fruits' },
  { date: '5', tip: 'La banane est en pic estival. Les prix européens sont favorables, c\'est le moment d\'exporter.', emoji: '🍌', category: 'Fruits' },
  { date: '6', tip: 'Pleine saison bananière et fruit à pain. Les surplus sont probables — activez le anti-gaspillage.', emoji: '🍌', category: 'Fruits' },
  { date: '7', tip: 'La vanille est en récolte ! Valeur élevée à l\'export. Conditionnez avec soin pour maximiser le prix.', emoji: '🫘', category: 'Épices' },
  { date: '8', tip: 'Les avocats arrivent. Les prix locaux montent. Attendez le pic pour vendre au meilleur tarif.', emoji: '🥑', category: 'Fruits' },
  { date: '9', tip: 'Cacao et café approchent. Préparez vos lots de qualité pour les marchés de niche métropolitains.', emoji: '🍫', category: 'Épices' },
  { date: '10', tip: 'Pic de récolte pour cacao et café. Les marchés spécialisés payent premium pour les origines Martinique.', emoji: '☕', category: 'Épices' },
  { date: '11', tip: 'Fin d\'année : ignames, dachines et légumes pays en force. Les fêtes boostent la demande locale.', emoji: '🍠', category: 'Légumes' },
]

/* ===== HELPERS ===== */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/* ===== MAIN COMPONENT ===== */
const AiArbitragePage: React.FC = () => {
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const [showAllForecasts, setShowAllForecasts] = useState(false)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const today = new Date()

  // Load data from localStorage
  const lots = useMemo(() => (getData('lots') as Lot[]).filter(l => l.active), [])
  const orders = useMemo(() => (getData('orders') as Order[]).filter(o => o.active), [])
  const geoMembers = useMemo(() => getAllGeoMembers(), [])

  /* ===== 1. PRODUCTION FORECAST ===== */
  const inSeasonCrops = useMemo(() =>
    CROP_CALENDAR.filter(c => c.saisonMois.includes(currentMonth)),
    [currentMonth]
  )

  const peakCrops = useMemo(() =>
    CROP_CALENDAR.filter(c => c.picMois.includes(currentMonth)),
    [currentMonth]
  )

  const forecastMonths = useMemo(() => {
    const months: { month: number; year: number; label: string }[] = []
    for (let i = 0; i < 6; i++) {
      const m = (currentMonth + i) % 12
      const y = currentYear + Math.floor((currentMonth + i) / 12)
      months.push({ month: m, year: y, label: `${MOIS_NOMS[m]} ${y}` })
    }
    return months
  }, [currentMonth, currentYear])

  const productionForecast = useMemo(() => {
    return forecastMonths.map(fm => {
      const crops = CROP_CALENDAR.filter(c => c.saisonMois.includes(fm.month))
      const totalVolume = crops.reduce((s, c) => s + c.estimatedVolumeKg, 0)
      const peakCropsForMonth = CROP_CALENDAR.filter(c => c.picMois.includes(fm.month))
      return { ...fm, crops, totalVolume, peakCrops: peakCropsForMonth }
    })
  }, [forecastMonths])

  /* ===== 2. PRICE OPTIMIZATION ===== */
  const priceAdvices = useMemo<PriceAdvice[]>(() => {
    return inSeasonCrops.map(crop => {
      const ref = PRICE_REFERENCES[crop.priceKey]
      if (!ref) return null
      const mid = (ref.min + ref.max) / 2
      // Simulated current price based on season position
      const isPeak = crop.picMois.includes(currentMonth)
      const seasonFactor = isPeak ? 0.85 : 1.1 // prices drop at peak supply
      const currentAvgPrice = Math.round(mid * seasonFactor * 100) / 100
      // Trend based on next month
      const nextMonth = (currentMonth + 1) % 12
      const isNextPeak = crop.picMois.includes(nextMonth)
      const isNextSeason = crop.saisonMois.includes(nextMonth)
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercent = 0
      if (isPeak && !isNextPeak) { trend = 'up'; trendPercent = Math.round(5 + Math.random() * 10) }
      else if (!isPeak && isNextPeak) { trend = 'down'; trendPercent = Math.round(3 + Math.random() * 8) }
      else if (!isNextSeason) { trend = 'up'; trendPercent = Math.round(10 + Math.random() * 15) }
      else { trend = 'stable'; trendPercent = Math.round(Math.random() * 3) }
      // Signal
      let signal: 'sell' | 'wait' | 'low'
      if (currentAvgPrice >= ref.max * 0.9) signal = 'sell'
      else if (currentAvgPrice <= ref.min * 1.1) signal = 'low'
      else if (trend === 'up') signal = 'wait'
      else signal = 'sell'
      // Recommended sell date
      const recDate = new Date(today)
      if (signal === 'sell') recDate.setDate(recDate.getDate() + 3)
      else if (signal === 'wait') recDate.setDate(recDate.getDate() + 14 + Math.floor(Math.random() * 14))
      else recDate.setDate(recDate.getDate() + 21 + Math.floor(Math.random() * 10))
      return {
        crop: crop.nom,
        emoji: crop.emoji,
        currentAvgPrice,
        trend,
        trendPercent,
        signal,
        recommendedDate: recDate.toISOString().slice(0, 10),
        priceMin: ref.min,
        priceMax: ref.max,
        unit: ref.unit,
      }
    }).filter(Boolean) as PriceAdvice[]
  }, [inSeasonCrops, currentMonth, today])

  /* ===== 3. ROUTE OPTIMIZATION ===== */
  const routeSuggestions = useMemo<RouteSuggestion[]>(() => {
    const communes = geoMembers
      .filter(m => m.type === 'producteur' || m.type === 'parcelle')
      .map(m => m.commune)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 6)
    if (communes.length === 0) {
      // Fallback to common communes
      return [
        { origin: 'Le François', destination: 'Fort-de-France', distanceKm: 15, transporter: 'Transport Tropical Express', estimatedCost: 12.75, duration: '25 min', frigorifique: true },
        { origin: 'Le Morne-Rouge', destination: 'Fort-de-France', distanceKm: 12, transporter: 'Logistique Nord Express', estimatedCost: 10.80, duration: '20 min', frigorifique: true },
        { origin: 'Sainte-Marie', destination: 'Le Lamentin', distanceKm: 18, transporter: 'Camionnage Central', estimatedCost: 11.70, duration: '30 min', frigorifique: false },
        { origin: 'Le Vauclin', destination: 'Le Marin', distanceKm: 10, transporter: 'Livraison Caraïbes', estimatedCost: 7.00, duration: '15 min', frigorifique: false },
        { origin: 'Le Carbet', destination: 'Fort-de-France', distanceKm: 14, transporter: 'Transport Tropical Express', estimatedCost: 11.90, duration: '22 min', frigorifique: true },
        { origin: 'Saint-Pierre', destination: 'Le Lamentin', distanceKm: 28, transporter: 'Logistique Nord Express', estimatedCost: 25.20, duration: '40 min', frigorifique: true },
      ]
    }
    const routes: RouteSuggestion[] = []
    communes.forEach(origin => {
      const originCoord = COMMUNE_COORDS[origin]
      if (!originCoord) return
      // Find closest hub
      const hubs = COMMUNES_HUBS.filter(h => h !== origin)
      let closestHub = hubs[0]
      let minDist = Infinity
      hubs.forEach(hub => {
        const hubCoord = COMMUNE_COORDS[hub]
        if (!hubCoord) return
        const d = haversineKm(originCoord.lat, originCoord.lng, hubCoord.lat, hubCoord.lng)
        if (d < minDist) { minDist = d; closestHub = hub }
      })
      const t = TRANSPORTERS[Math.floor(Math.random() * TRANSPORTERS.length)]
      routes.push({
        origin,
        destination: closestHub,
        distanceKm: Math.round(minDist),
        transporter: t.name,
        estimatedCost: Math.round(minDist * t.ratePerKm * 100) / 100,
        duration: `${Math.round(minDist * 1.8)} min`,
        frigorifique: t.frigorifique,
      })
    })
    return routes
  }, [geoMembers])

  /* ===== 4. SURPLUS DETECTION ===== */
  const surplusAlerts = useMemo<SurplusAlert[]>(() => {
    // Check lots with high volume or approaching expiry
    const alerts: SurplusAlert[] = []
    const activeLots = lots.filter(l => l.status !== 'sold' && l.status !== 'cancelled')
    // Group by product + commune
    const grouped = new Map<string, { product: string; commune: string; totalQty: number }>()
    activeLots.forEach(lot => {
      const key = `${lot.product}|${lot.commune}`
      const existing = grouped.get(key)
      if (existing) {
        existing.totalQty += lot.unit === 'kg' ? lot.qty : lot.qty * 0.5
      } else {
        grouped.set(key, { product: lot.product, commune: lot.commune, totalQty: lot.unit === 'kg' ? lot.qty : lot.qty * 0.5 })
      }
    })
    // Also add from seasonal data (simulated surplus when in peak)
    peakCrops.forEach(crop => {
      const surplus = Math.round(crop.estimatedVolumeKg * (0.1 + seededRandom(crop.id.charCodeAt(0) + currentMonth) * 0.15))
      if (surplus > 0) {
        const commune = COMMUNES_HUBS[Math.floor(seededRandom(crop.id.charCodeAt(0) * 3 + currentMonth) * COMMUNES_HUBS.length)]
        const key = `${crop.nom}|${commune}`
        if (!grouped.has(key)) {
          grouped.set(key, { product: crop.nom, commune, totalQty: surplus })
        }
      }
    })
    // Convert to alerts
    grouped.forEach((data, key) => {
      const crop = CROP_CALENDAR.find(c => c.nom === data.product)
      const ref = crop ? PRICE_REFERENCES[crop.priceKey] : PRICE_REFERENCES[data.product.toLowerCase()]
      const threshold = ref ? ref.min * 500 : 300 // surplus threshold in kg
      if (data.totalQty >= threshold) {
        const potentialSaving = ref ? Math.round(data.totalQty * ref.min * 0.5) : Math.round(data.totalQty * 1.0)
        alerts.push({
          id: key,
          crop: data.product,
          emoji: crop?.emoji || '📦',
          volumeKg: data.totalQty,
          commune: data.commune,
          urgency: data.totalQty >= threshold * 3 ? 'high' : data.totalQty >= threshold * 1.5 ? 'medium' : 'low',
          potentialSaving,
          detectedAt: new Date().toISOString(),
        })
      }
    })
    // Sort by urgency
    alerts.sort((a, b) => b.volumeKg - a.volumeKg)
    return alerts
  }, [lots, peakCrops, currentMonth])

  const totalAntiWasteSavings = useMemo(() =>
    surplusAlerts.reduce((s, a) => s + a.potentialSaving, 0),
    [surplusAlerts]
  )

  /* ===== 5. EXPORT RECOMMENDATION ===== */
  const exportComparisons = useMemo<ExportComparison[]>(() => {
    return inSeasonCrops.map(crop => {
      const ref = PRICE_REFERENCES[crop.priceKey]
      if (!ref) return null
      const localPrice = Math.round((ref.min + (ref.max - ref.min) * 0.6) * 100) / 100
      // Best export destination
      let bestDest = EXPORT_DESTINATIONS[0]
      let bestNetExport = 0
      let bestAdvantage = -Infinity
      EXPORT_DESTINATIONS.forEach(dest => {
        const exportPrice = Math.round(localPrice * dest.premiumFactor * 100) / 100
        const netExport = exportPrice - dest.transportPerKg
        const advantage = netExport - localPrice
        if (advantage > bestAdvantage) {
          bestAdvantage = advantage
          bestNetExport = netExport
          bestDest = dest
        }
      })
      const containerFill = Math.min(100, Math.round((crop.estimatedVolumeKg / 25000) * 100))
      return {
        crop: crop.nom,
        emoji: crop.emoji,
        localPricePerKg: localPrice,
        exportPricePerKg: Math.round(localPrice * bestDest.premiumFactor * 100) / 100,
        transportCostPerKg: bestDest.transportPerKg,
        netExportPrice: Math.round(bestNetExport * 100) / 100,
        recommendation: bestAdvantage > 0 ? 'export' as const : 'local' as const,
        advantage: Math.round(bestAdvantage * 100) / 100,
        containerFill,
      }
    }).filter(Boolean) as ExportComparison[]
  }, [inSeasonCrops])

  /* ===== 6. MUTUALIZATION SUGGESTIONS ===== */
  const mutualizationOpportunities = useMemo<MutualizationOpportunity[]>(() => {
    if (orders.length < 2) {
      // Generate from lots data
      const activeLots = lots.filter(l => l.status !== 'sold' && l.status !== 'cancelled')
      if (activeLots.length < 2) return []
      const byCommune = new Map<string, Lot[]>()
      activeLots.forEach(l => {
        if (!byCommune.has(l.commune)) byCommune.set(l.commune, [])
        byCommune.get(l.commune)!.push(l)
      })
      const opps: MutualizationOpportunity[] = []
      byCommune.forEach((communeLots, commune) => {
        if (communeLots.length < 2) return
        const totalKg = communeLots.reduce((s, l) => s + (l.unit === 'kg' ? l.qty : l.qty * 0.5), 0)
        const individualCost = Math.round(communeLots.length * 35 * 100) / 100
        const mergedCost = Math.round((35 + totalKg * 0.02) * 100) / 100
        opps.push({
          id: commune,
          orders: communeLots.map(l => l.id),
          destination: `Hub ${commune} → Fort-de-France`,
          timeframe: 'Cette semaine',
          totalVolumeKg: Math.round(totalKg),
          individualCost,
          mergedCost,
          saving: Math.round((individualCost - mergedCost) * 100) / 100,
          savingPercent: Math.round((1 - mergedCost / individualCost) * 100),
        })
      })
      return opps
    }
    // Group orders by similar delivery destination
    const byDelivery = new Map<string, Order[]>()
    orders.forEach(o => {
      const key = o.delivery || 'non-spécifié'
      if (!byDelivery.has(key)) byDelivery.set(key, [])
      byDelivery.get(key)!.push(o)
    })
    const opps: MutualizationOpportunity[] = []
    byDelivery.forEach((groupOrders, dest) => {
      if (groupOrders.length < 2) return
      const totalKg = groupOrders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0), 0)
      const individualCost = Math.round(groupOrders.length * 45 * 100) / 100
      const mergedCost = Math.round((45 + totalKg * 0.015) * 100) / 100
      opps.push({
        id: dest,
        orders: groupOrders.map(o => o.id),
        destination: dest,
        timeframe: 'Prochaine semaine',
        totalVolumeKg: Math.round(totalKg),
        individualCost,
        mergedCost,
        saving: Math.round((individualCost - mergedCost) * 100) / 100,
        savingPercent: Math.round((1 - mergedCost / individualCost) * 100),
      })
    })
    return opps
  }, [orders, lots])

  /* ===== 7. DAILY INSIGHT ===== */
  const dailyInsight = useMemo<DailyInsight>(() => {
    return DAILY_TIPS[currentMonth] || DAILY_TIPS[0]
  }, [currentMonth])

  /* ===== SIGNAL HELPERS ===== */
  const signalConfig = (signal: 'sell' | 'wait' | 'low') => {
    switch (signal) {
      case 'sell': return { emoji: '🟢', label: 'Vend maintenant', color: '#4CAF50', bg: 'rgba(76,175,80,0.12)' }
      case 'wait': return { emoji: '🟡', label: 'Attends', color: '#FF9800', bg: 'rgba(255,152,0,0.12)' }
      case 'low': return { emoji: '🔴', label: 'Prix bas', color: '#F44336', bg: 'rgba(244,67,54,0.12)' }
    }
  }

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} style={{ color: '#4CAF50' }} />
      case 'down': return <TrendingDown size={16} style={{ color: '#F44336' }} />
      case 'stable': return <Minus size={16} style={{ color: '#FF9800' }} />
    }
  }

  const urgencyStyle = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high': return { border: '2px solid #F44336', bg: 'rgba(244,67,54,0.08)' }
      case 'medium': return { border: '2px solid #FF9800', bg: 'rgba(255,152,0,0.06)' }
      case 'low': return { border: '2px solid #4CAF50', bg: 'rgba(76,175,80,0.06)' }
    }
  }

  /* ===== RENDER ===== */
  return (
    <div className="page">

      {/* ===== HERO ===== */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '32px 24px', borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Bot size={36} style={{ color: '#60a5fa' }} />
          <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#fff' }}>IA Arbitrage KopéAgri</h1>
        </div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
          Optimisation IA de la production, vente et export
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <span style={{ background: 'rgba(96,165,250,0.2)', color: '#93c5fd', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
            📅 {MOIS_COMPLETS[currentMonth]} {currentYear}
          </span>
          <span style={{ background: 'rgba(74,222,128,0.2)', color: '#86efac', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
            🌱 {inSeasonCrops.length} cultures en saison
          </span>
          <span style={{ background: 'rgba(251,191,36,0.2)', color: '#fde68a', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
            🏆 {peakCrops.length} en pic
          </span>
          {surplusAlerts.length > 0 && (
            <span style={{ background: 'rgba(244,67,54,0.2)', color: '#fca5a5', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
              ⚠️ {surplusAlerts.length} alertes surplus
            </span>
          )}
        </div>
      </div>

      {/* ===== 8. DAILY INSIGHTS ===== */}
      <div className="section-block" style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(147,51,234,0.1))', borderLeft: '4px solid #60a5fa' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span style={{ fontSize: 32 }}>{dailyInsight.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Lightbulb size={18} style={{ color: '#60a5fa' }} />
              <strong style={{ fontSize: '0.95rem' }}>Conseil du jour — {MOIS_COMPLETS[currentMonth]}</strong>
              <span style={{ background: 'rgba(96,165,250,0.2)', color: '#93c5fd', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>{dailyInsight.category}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{dailyInsight.tip}</p>
            <div style={{ marginTop: 10 }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🌱 KopéAgri IA — Conseil du jour : ${dailyInsight.tip}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <MessageCircle size={14} /> Partager sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 2. PRICE OPTIMIZATION ===== */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <BarChart3 size={22} style={{ color: '#60a5fa' }} /> Meilleur moment pour vendre
        </h2>
        {priceAdvices.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p>Aucune culture en saison pour le conseil de prix.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {priceAdvices.map(advice => {
              const sig = signalConfig(advice.signal)
              return (
                <div key={advice.crop} className="section-block" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 28 }}>{advice.emoji}</span>
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{advice.crop}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{advice.currentAvgPrice.toFixed(2)}€</span>
                          <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>/ {advice.unit}</span>
                          {trendIcon(advice.trend)}
                          <span style={{ fontSize: '0.8rem', color: advice.trend === 'up' ? '#4CAF50' : advice.trend === 'down' ? '#F44336' : '#FF9800', fontWeight: 600 }}>
                            {advice.trend === 'up' ? '+' : advice.trend === 'down' ? '-' : ''}{advice.trendPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ background: sig.bg, color: sig.color, padding: '4px 12px', borderRadius: 16, fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {sig.emoji} {sig.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        Recommandation: {new Date(advice.recommendedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  {/* Price range bar */}
                  <div style={{ marginTop: 10, background: 'var(--gray-100)', borderRadius: 6, height: 8, position: 'relative' }}>
                    <div style={{
                      position: 'absolute', top: -2, height: 12, width: 12, borderRadius: '50%',
                      background: sig.color, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      left: `${Math.min(95, Math.max(5, ((advice.currentAvgPrice - advice.priceMin) / (advice.priceMax - advice.priceMin)) * 100))}%`,
                      transform: 'translateX(-50%)',
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{advice.priceMin.toFixed(2)}€</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{advice.priceMax.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== 1. PRODUCTION FORECAST ===== */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Calendar size={22} style={{ color: '#4CAF50' }} /> Prévisions de production
        </h2>

        {/* Current month crops */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--gray-600)', marginBottom: 10 }}>
            🌱 Cultures en saison — {MOIS_COMPLETS[currentMonth]}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {(showAllForecasts ? inSeasonCrops : inSeasonCrops.slice(0, 8)).map(crop => {
              const isPeak = crop.picMois.includes(currentMonth)
              const ref = PRICE_REFERENCES[crop.priceKey]
              const trendArrow = isPeak ? '↑' : '→'
              return (
                <div
                  key={crop.id}
                  className="section-block"
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                    border: isPeak ? '2px solid var(--gold-500, #FFC107)' : undefined,
                    background: isPeak ? 'rgba(255,193,7,0.06)' : undefined,
                  }}
                  onClick={() => setExpandedCrop(expandedCrop === crop.id ? null : crop.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{crop.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ fontSize: '0.9rem' }}>{crop.nom}</strong>
                        {isPeak && <span style={{ fontSize: '0.7rem', background: 'var(--gold-500, #FFC107)', color: '#000', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>PIC</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        ~{crop.estimatedVolumeKg >= 1000 ? `${(crop.estimatedVolumeKg / 1000).toFixed(0)}t` : `${crop.estimatedVolumeKg}kg`}/mois
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: isPeak ? '#4CAF50' : '#FF9800', fontWeight: 700 }}>{trendArrow}</span>
                  </div>
                  {expandedCrop === crop.id && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                        Saison : {crop.saisonMois.length === 12 ? 'Toute l\'année' : crop.saisonMois.map(m => MOIS_NOMS[m]).join(', ')}
                      </div>
                      {crop.picMois.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                          Pic : {crop.picMois.map(m => MOIS_NOMS[m]).join(', ')}
                        </div>
                      )}
                      {ref && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          Prix : {ref.min.toFixed(2)}€ – {ref.max.toFixed(2)}€ / {ref.unit}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {inSeasonCrops.length > 8 && (
            <button className="btn btn-secondary" style={{ marginTop: 10, fontSize: '0.85rem' }} onClick={() => setShowAllForecasts(!showAllForecasts)}>
              {showAllForecasts ? 'Voir moins' : `Voir les ${inSeasonCrops.length - 8} autres`}
            </button>
          )}
        </div>

        {/* 6-month timeline */}
        <div className="section-block" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>
            <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Prévision sur 6 mois
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {productionForecast.map((fm, idx) => (
              <div
                key={fm.label}
                style={{
                  padding: 12, borderRadius: 10, textAlign: 'center',
                  background: idx === 0 ? 'rgba(96,165,250,0.12)' : 'var(--gray-50, rgba(255,255,255,0.04))',
                  border: idx === 0 ? '2px solid #60a5fa' : '1px solid var(--gray-200)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: idx === 0 ? '#60a5fa' : 'inherit' }}>
                  {MOIS_NOMS[fm.month]}{idx === 0 && ' ↓'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
                  {fm.crops.length} cultures
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>
                  ~{fm.totalVolume >= 1000 ? `${(fm.totalVolume / 1000).toFixed(0)}t` : `${fm.totalVolume}kg`}
                </div>
                {fm.peakCrops.length > 0 && (
                  <div style={{ fontSize: '0.7rem', marginTop: 4 }}>
                    {fm.peakCrops.slice(0, 2).map(c => c.emoji).join(' ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 4. SURPLUS DETECTION (TooGoodToGo) ===== */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <AlertTriangle size={22} style={{ color: '#FF9800' }} /> Surplus détecté — Anti-gaspillage
        </h2>

        {surplusAlerts.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ background: 'rgba(244,67,54,0.08)' }}>
              <div className="stat-icon" style={{ color: '#F44336' }}><AlertTriangle size={20} /></div>
              <div className="stat-info">
                <span className="stat-value">{surplusAlerts.length}</span>
                <span className="stat-label">Alertes</span>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(76,175,80,0.08)' }}>
              <div className="stat-icon" style={{ color: '#4CAF50' }}><Leaf size={20} /></div>
              <div className="stat-info">
                <span className="stat-value">{totalAntiWasteSavings >= 1000 ? `${(totalAntiWasteSavings / 1000).toFixed(1)}k€` : `${totalAntiWasteSavings}€`}</span>
                <span className="stat-label">Économies potentielles</span>
              </div>
            </div>
          </div>
        )}

        {surplusAlerts.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <Leaf size={32} style={{ color: '#4CAF50', marginBottom: 8 }} />
            <h3>Aucun surplus détecté</h3>
            <p>La production est bien calibrée par rapport à la demande actuelle.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {surplusAlerts.map(alert => {
              const style = urgencyStyle(alert.urgency)
              return (
                <div key={alert.id} className="section-block" style={{ padding: 16, border: style.border, background: style.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{alert.emoji}</span>
                        <div>
                          <strong>⚠️ Surplus détecté : {alert.volumeKg >= 1000 ? `${(alert.volumeKg / 1000).toFixed(1)}t` : `${alert.volumeKg}kg`} {alert.crop}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                            <MapPin size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {alert.commune}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: '0.85rem' }}>
                        💰 Économie potentielle : <strong>{alert.potentialSaving}€</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                        background: alert.urgency === 'high' ? '#F44336' : alert.urgency === 'medium' ? '#FF9800' : '#4CAF50',
                        color: '#fff',
                      }}>
                        {alert.urgency === 'high' ? 'Urgent' : alert.urgency === 'medium' ? 'Modéré' : 'Faible'}
                      </span>
                      <Link to="/marketplace" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                        <ShoppingCart size={14} /> Publier sur Marketplace
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== 5. EXPORT RECOMMENDATION ===== */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Globe size={22} style={{ color: '#1565C0' }} /> Export vs Vente locale
        </h2>

        {exportComparisons.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p>Aucune comparaison export disponible.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {exportComparisons.map(comp => (
              <div key={comp.crop} className="section-block" style={{
                padding: 16,
                border: `2px solid ${comp.recommendation === 'export' ? '#1565C0' : '#4CAF50'}`,
                background: comp.recommendation === 'export' ? 'rgba(21,101,192,0.06)' : 'rgba(76,175,80,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{comp.emoji}</span>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{comp.crop}</strong>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem' }}>
                          🏠 Local : <strong>{comp.localPricePerKg.toFixed(2)}€/kg</strong>
                        </span>
                        <span style={{ fontSize: '0.85rem' }}>
                          🚢 Export : <strong>{comp.exportPricePerKg.toFixed(2)}€/kg</strong>
                          <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}> (–{comp.transportCostPerKg.toFixed(2)}€ transport)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 16, fontSize: '0.8rem', fontWeight: 700,
                      background: comp.recommendation === 'export' ? '#1565C0' : '#4CAF50', color: '#fff',
                    }}>
                      {comp.recommendation === 'export' ? '🚢 Export recommandé' : '🏠 Vente locale'}
                    </span>
                    <div style={{ fontSize: '0.8rem', marginTop: 4, color: comp.advantage > 0 ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                      {comp.advantage > 0 ? '+' : ''}{comp.advantage.toFixed(2)}€/kg
                      {comp.recommendation === 'export' ? ' net export' : ' net local'}
                    </div>
                  </div>
                </div>
                {/* Container fill */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 4 }}>
                    <span>Remplissage conteneur</span>
                    <span>{comp.containerFill}%</span>
                  </div>
                  <div style={{ background: 'var(--gray-200)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 6,
                      width: `${comp.containerFill}%`,
                      background: comp.containerFill >= 80 ? '#4CAF50' : comp.containerFill >= 40 ? '#FF9800' : '#F44336',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
                {comp.recommendation === 'export' && (
                  <div style={{ marginTop: 10 }}>
                    <Link to="/consolidation" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                      <Ship size={14} /> Lancer un groupage
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== 3. ROUTE OPTIMIZATION ===== */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Truck size={22} style={{ color: '#FF9800' }} /> Optimisation des routes
        </h2>

        {routeSuggestions.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p>Aucune route suggérée pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {routeSuggestions.map((route, idx) => {
              const key = `${route.origin}-${route.destination}-${idx}`
              const isExpanded = expandedRoute === key
              return (
                <div key={key} className="section-block" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600 }}>{route.origin}</span>
                        <ArrowRight size={16} style={{ color: 'var(--gray-400)' }} />
                        <span style={{ fontWeight: 600 }}>{route.destination}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.8rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                        <span>📏 {route.distanceKm} km</span>
                        <span>⏱️ {route.duration}</span>
                        <span>💰 {route.estimatedCost.toFixed(2)}€</span>
                        {route.frigorifique && <span style={{ color: '#2196F3' }}>❄️ Frigorifique</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{route.transporter}</span>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setExpandedRoute(isExpanded ? null : key)}
                      >
                        <Zap size={12} /> Optimiser
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
                      <h4 style={{ fontSize: '0.85rem', marginBottom: 8 }}>Alternatives :</h4>
                      {TRANSPORTERS.filter(t => t.name !== route.transporter).map(t => {
                        const altCost = Math.round(route.distanceKm * t.ratePerKm * 100) / 100
                        const savings = Math.round((route.estimatedCost - altCost) * 100) / 100
                        return (
                          <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: 8 }}>
                                {t.frigorifique ? '❄️' : '🚛'} {altCost.toFixed(2)}€
                              </span>
                            </div>
                            {savings > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600 }}>
                                –{savings.toFixed(2)}€
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== 6. MUTUALIZATION SUGGESTIONS ===== */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Users size={22} style={{ color: '#9C27B0' }} /> Commandes groupées possibles
        </h2>

        {mutualizationOpportunities.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <Package size={32} style={{ color: 'var(--gray-400)', marginBottom: 8 }} />
            <h3>Aucune mutualisation détectée</h3>
            <p>Créez plus de lots ou commandes pour que l'IA puisse proposer des groupages.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {mutualizationOpportunities.map(opp => (
              <div key={opp.id} className="section-block" style={{ padding: 16, border: '2px solid #9C27B0', background: 'rgba(156,39,176,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={18} style={{ color: '#9C27B0' }} />
                      <strong>{opp.destination}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
                      {opp.orders.length} commande{opp.orders.length > 1 ? 's' : ''} · {opp.totalVolumeKg >= 1000 ? `${(opp.totalVolumeKg / 1000).toFixed(1)}t` : `${opp.totalVolumeKg}kg`} · {opp.timeframe}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem' }}>
                        Individuel : <strong style={{ textDecoration: 'line-through', color: 'var(--gray-400)' }}>{opp.individualCost.toFixed(2)}€</strong>
                      </span>
                      <span style={{ fontSize: '0.85rem' }}>
                        Groupé : <strong style={{ color: '#4CAF50' }}>{opp.mergedCost.toFixed(2)}€</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 16,
                      background: '#4CAF50', color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                    }}>
                      –{opp.savingPercent}% (–{opp.saving.toFixed(2)}€)
                    </span>
                    <div style={{ marginTop: 8 }}>
                      <Link to="/consolidation" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                        <Layers size={14} /> Proposer groupage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== SUMMARY DASHBOARD ===== */}
      <div style={{ marginTop: 28, marginBottom: 20 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={22} style={{ color: '#60a5fa' }} /> Résumé IA
        </h2>
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4CAF50' }}><Leaf size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{inSeasonCrops.length}</span>
              <span className="stat-label">En saison</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FFC107' }}><TrendingUp size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{peakCrops.length}</span>
              <span className="stat-label">En pic</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#F44336' }}><AlertTriangle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{surplusAlerts.length}</span>
              <span className="stat-label">Surplus</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#1565C0' }}><Globe size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{exportComparisons.filter(c => c.recommendation === 'export').length}</span>
              <span className="stat-label">Export favorable</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#9C27B0' }}><Users size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{mutualizationOpportunities.length}</span>
              <span className="stat-label">Groupages</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#4CAF50' }}><Leaf size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{totalAntiWasteSavings >= 1000 ? `${(totalAntiWasteSavings / 1000).toFixed(1)}k` : totalAntiWasteSavings}€</span>
              <span className="stat-label">Anti-gaspillage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiArbitragePage
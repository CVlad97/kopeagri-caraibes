import React, { useState, useMemo } from 'react'
import {
  Waves, Fish, Anchor, MapPin, Phone, Mail, Star, Calendar,
  TrendingUp, Truck, Globe, Award, Droplets, Thermometer,
  ChevronDown, ChevronUp, Filter, MessageCircle,
} from 'lucide-react'
import { SEAFOOD_SPECIES, FISHING_PORTS, SEAFOOD_SEASONS } from '../lib/types'

/* ===== TYPES ===== */
type SpeciesCategory = 'Poisson' | 'Crustacé' | 'Mollusque'
type PortTypeFilter = 'tous' | 'principal' | 'secondaire' | 'artisanal'
type SpeciesFilter = 'tous' | 'Poisson' | 'Crustacé' | 'Mollusque'

interface Actor {
  name: string
  role: 'Institution' | 'Mareyeur' | 'Formation' | 'Recherche' | 'Restaurant' | 'Poissonnerie'
  address: string
  phone: string | null
  email: string | null
  description: string
}

interface Recommendation {
  title: string
  description: string
  icon: React.ReactNode
  stat: string
  color: string
}

/* ===== CONSTANTS ===== */
const MOIS_NOMS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
]

const MOIS_COMPLETS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const SPECIES_EMOJI: Record<string, string> = {
  'Thazard': '🐟',
  'Dorade coryphène': '🐠',
  'Bonite': '🐟',
  'Espadon': '⚔️',
  'Voilier': '🎣',
  'Sériole': '🐟',
  'Carangue': '🐟',
  'Barracuda': '🦈',
  'Thon albacore': '🐟',
  'Thon obèse': '🐟',
  'Lambi': '🐚',
  'Oursin blanc': '🦔',
  'Oursin noir': '🦔',
  'Bélimbe': '🐟',
  'Crasse-gueule': '🐟',
  'Vivaneau': '🐟',
  'Pagre': '🐟',
  'Mérou': '🐟',
  'Murène': '🐍',
  'Requin': '🦈',
  'Crevette pénéide': '🦐',
  'Langouste': '🦞',
  'Crabe cirique': '🦀',
  'Crabe z\'habitant': '🦀',
  'Poulpe': '🐙',
  'Calamar': '🦑',
  'Ormeau': '🐚',
  'Burgeon': '🐟',
  'Turbot': '🐟',
}

const SPECIES_CATEGORY: Record<string, SpeciesCategory> = {
  'Thazard': 'Poisson',
  'Dorade coryphène': 'Poisson',
  'Bonite': 'Poisson',
  'Espadon': 'Poisson',
  'Voilier': 'Poisson',
  'Sériole': 'Poisson',
  'Carangue': 'Poisson',
  'Barracuda': 'Poisson',
  'Thon albacore': 'Poisson',
  'Thon obèse': 'Poisson',
  'Lambi': 'Mollusque',
  'Oursin blanc': 'Mollusque',
  'Oursin noir': 'Mollusque',
  'Bélimbe': 'Poisson',
  'Crasse-gueule': 'Poisson',
  'Vivaneau': 'Poisson',
  'Pagre': 'Poisson',
  'Mérou': 'Poisson',
  'Murène': 'Poisson',
  'Requin': 'Poisson',
  'Crevette pénéide': 'Crustacé',
  'Langouste': 'Crustacé',
  'Crabe cirique': 'Crustacé',
  'Crabe z\'habitant': 'Crustacé',
  'Poulpe': 'Mollusque',
  'Calamar': 'Mollusque',
  'Ormeau': 'Mollusque',
  'Burgeon': 'Poisson',
  'Turbot': 'Poisson',
}

const SPECIES_PRICE: Record<string, [number, number]> = {
  'Thazard': [12, 18],
  'Dorade coryphène': [14, 22],
  'Bonite': [8, 14],
  'Espadon': [18, 28],
  'Voilier': [16, 24],
  'Sériole': [12, 20],
  'Carangue': [10, 16],
  'Barracuda': [10, 15],
  'Thon albacore': [16, 26],
  'Thon obèse': [14, 22],
  'Lambi': [25, 40],
  'Oursin blanc': [30, 50],
  'Oursin noir': [25, 45],
  'Bélimbe': [8, 14],
  'Crasse-gueule': [8, 13],
  'Vivaneau': [12, 20],
  'Pagre': [14, 22],
  'Mérou': [18, 30],
  'Murène': [8, 14],
  'Requin': [6, 12],
  'Crevette pénéide': [18, 32],
  'Langouste': [35, 60],
  'Crabe cirique': [15, 25],
  'Crabe z\'habitant': [12, 20],
  'Poulpe': [16, 26],
  'Calamar': [14, 22],
  'Ormeau': [40, 65],
  'Burgeon': [10, 16],
  'Turbot': [14, 22],
}

/* Key species shown in the calendar grid (those with SEAFOOD_SEASONS data) */
const CALENDAR_SPECIES = Object.keys(SEAFOOD_SEASONS)

/* ===== ACTEURS DE LA FILIÈRE PÊCHE MARTINIQUE ===== */
const ACTEURS: Actor[] = [
  {
    name: 'Comité Régional des Pêches Maritimes de la Martinique',
    role: 'Institution',
    address: 'Port de pêche, 97200 Le Marin',
    phone: '0596 74 23 67',
    email: 'comite.peches.martinique@wanadoo.fr',
    description: 'Représente les professionnels de la pêche',
  },
  {
    name: 'Criée du Marin',
    role: 'Mareyeur',
    address: 'Quai O\'Leary, 97200 Le Marin',
    phone: '0596 74 20 20',
    email: null,
    description: 'Première criée de Martinique, vente en gros',
  },
  {
    name: 'Maison de la Pêche',
    role: 'Formation',
    address: 'Anse Moustique, 97250 Saint-Pierre',
    phone: '0596 52 15 15',
    email: null,
    description: 'Centre de formation et valorisation',
  },
  {
    name: 'IFREMER Antenne Martinique',
    role: 'Recherche',
    address: 'Pointe Fort, 97200 Fort-de-France',
    phone: '0596 67 08 00',
    email: null,
    description: 'Institut français de recherche maritime',
  },
  {
    name: 'DAAF Service Pêche',
    role: 'Institution',
    address: 'Rue de la République, 97200 Fort-de-France',
    phone: '0596 59 21 21',
    email: null,
    description: 'Direction Agriculture Alimentation Forêts',
  },
  {
    name: 'Association des Pêcheurs du Nord',
    role: 'Institution',
    address: 'Anse Céron, 97250 Le Prêcheur',
    phone: null,
    email: null,
    description: 'Pêcheurs artisanaux côte nord',
  },
  {
    name: 'Coopérative Pêcheurs du Marin',
    role: 'Mareyeur',
    address: 'Port du Marin, 97200 Le Marin',
    phone: '0596 74 22 22',
    email: null,
    description: 'Mareyage et groupage',
  },
  {
    name: 'Poissonnerie du Marché Couvert',
    role: 'Poissonnerie',
    address: 'Rue Isambert, 97200 Fort-de-France',
    phone: null,
    email: null,
    description: 'Poissonnerie historique',
  },
  {
    name: 'Restaurant Le Zanzibar',
    role: 'Restaurant',
    address: 'Marina du Marin, 97200 Le Marin',
    phone: null,
    email: null,
    description: 'Acheteur restaurant haut de gamme',
  },
  {
    name: 'Hôtel Batelière',
    role: 'Restaurant',
    address: 'Route de Balata, 97200 Schoelcher',
    phone: null,
    email: null,
    description: 'Acheteur hôtel 4 étoiles',
  },
]

/* ===== RECOMMANDATIONS STRATÉGIQUES ===== */
const RECOMMANDATIONS: Recommendation[] = [
  {
    title: 'Créer une criée digitale',
    description: 'Vente en ligne temps réel, prix transparent, accès acheteurs Caraïbes',
    icon: <Globe size={24} />,
    stat: '100%',
    color: '#006D77',
  },
  {
    title: 'Mutualiser la logistique frigorifique',
    description: 'Chaîne du froid du bateau au restaurant, -30% pertes',
    icon: <Truck size={24} />,
    stat: '-30%',
    color: '#1B3A5C',
  },
  {
    title: 'Exporter vers les Caraïbes',
    description: 'Guadeloupe, Dominique, Sainte-Lucie, Barbade — potentiels €2M+/an',
    icon: <TrendingUp size={24} />,
    stat: '€2M+',
    color: '#0D1B2A',
  },
  {
    title: 'Certification pêche durable',
    description: 'Label MSC, traçabilité QR, premium 20-30% sur les prix',
    icon: <Award size={24} />,
    stat: '+30%',
    color: '#006D77',
  },
  {
    title: 'Aquaculture intégrée',
    description: 'Crevettes, lambi, algues — diversification revenus',
    icon: <Droplets size={24} />,
    stat: '3 filières',
    color: '#1B3A5C',
  },
]

const ROLE_BADGE: Record<Actor['role'], { label: string; cls: string }> = {
  'Institution': { label: '🏛️ Institution', cls: 'badge-blue' },
  'Mareyeur': { label: '📦 Mareyeur', cls: 'badge-teal' },
  'Formation': { label: '🎓 Formation', cls: 'badge-green' },
  'Recherche': { label: '🔬 Recherche', cls: 'badge-purple' },
  'Restaurant': { label: '🍽️ Restaurant', cls: 'badge-gold' },
  'Poissonnerie': { label: '🐟 Poissonnerie', cls: 'badge-orange' },
}

const PORT_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  'principal': { label: 'Principal', cls: 'badge-blue' },
  'secondaire': { label: 'Secondaire', cls: 'badge-green' },
  'artisanal': { label: 'Artisanal', cls: 'badge-orange' },
}

/* ===== HELPERS ===== */
function getSpeciesStatus(species: string, currentMonth: number): 'disponible' | 'fermé' | 'pic' {
  const season = SEAFOOD_SEASONS[species]
  if (!season) return 'disponible' // default if no season data
  if (season.peak && season.months.includes(currentMonth)) return 'pic'
  if (season.months.includes(currentMonth)) return 'disponible'
  return 'fermé'
}

function formatPhone(phone: string): string {
  return phone.replace(/\s/g, '')
}

/* ===== COMPONENT ===== */
export default function SeafoodMarketPage() {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const moisActuel0 = new Date().getMonth() // 0-11

  const [portFilter, setPortFilter] = useState<PortTypeFilter>('tous')
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('tous')
  const [expandedPort, setExpandedPort] = useState<string | null>(null)
  const [expandedActor, setExpandedActor] = useState<number | null>(null)

  /* Filtered ports */
  const filteredPorts = useMemo(() => {
    if (portFilter === 'tous') return [...FISHING_PORTS]
    return [...FISHING_PORTS].filter(p => p.type === portFilter)
  }, [portFilter])

  /* Filtered species */
  const filteredSpecies = useMemo(() => {
    if (speciesFilter === 'tous') return [...SEAFOOD_SPECIES]
    return [...SEAFOOD_SPECIES].filter(s => SPECIES_CATEGORY[s] === speciesFilter)
  }, [speciesFilter])

  /* Count stats */
  const enSaisonCount = useMemo(() => {
    return CALENDAR_SPECIES.filter(s => {
      const season = SEAFOOD_SEASONS[s]
      return season && season.months.includes(currentMonth)
    }).length
  }, [currentMonth])

  const enPicCount = useMemo(() => {
    return CALENDAR_SPECIES.filter(s => {
      const season = SEAFOOD_SEASONS[s]
      return season && season.peak && season.months.includes(currentMonth)
    }).length
  }, [currentMonth])

  const totalBoats = useMemo(() => {
    return FISHING_PORTS.reduce((sum, p) => sum + p.boats, 0)
  }, [])

  return (
    <div className="page">
      {/* ===== 1. HERO ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 50%, #006D77 100%)',
        borderRadius: 'var(--radius)',
        padding: '56px 32px',
        color: 'white',
        textAlign: 'center',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎣</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'white' }}>
            <Waves size={32} style={{ marginRight: 10, verticalAlign: 'middle' }} />
            Marché de la Pêche — Martinique &amp; Caraïbes
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 560, margin: '0 auto' }}>
            Du bateau à l'assiette en moins de 24h
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              🐟 {enSaisonCount} espèces en saison
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⭐ {enPicCount} en pic saisonnier
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              🚢 {totalBoats} bateaux
            </span>
          </div>
        </div>
      </div>

      {/* ===== 2. STATS BAR ===== */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0F2F1', color: '#006D77' }}>
            <Fish size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">1 200+</span>
            <span className="stat-label">Pêcheurs actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>
            <Anchor size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">17</span>
            <span className="stat-label">Points débarquement</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
            <Waves size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">29</span>
            <span className="stat-label">Espèces commerciales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-num">4 800 T/an</span>
            <span className="stat-label">Production locale</span>
          </div>
        </div>
      </div>

      {/* ===== 3. CALENDRIER SAISONNIER PÊCHE ===== */}
      <div className="section-block">
        <h2><Calendar size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Calendrier Saisonnier Pêche</h2>

        {/* Month banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
          padding: '12px 16px', background: '#E0F2F1', borderRadius: 'var(--radius-sm)',
        }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <div>
            <strong style={{ color: '#006D77', fontSize: 16 }}>Nous sommes en {MOIS_COMPLETS[moisActuel0]}</strong>
            <p style={{ fontSize: 13, color: '#006D77', marginTop: 2 }}>
              {enSaisonCount} espèces en saison
              {enPicCount > 0 && ` — ${enPicCount} en pic saisonnier`}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#4CAF50', display: 'inline-block' }} />
            <span>Disponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#00C853', display: 'inline-block' }} />
            <span>Pic saisonnier</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#E0E0E0', display: 'inline-block' }} />
            <span>Fermé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, border: '2px solid #006D77', display: 'inline-block' }} />
            <span>Mois actuel</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap' }}>
                  Espèce
                </th>
                {MOIS_NOMS.map((m, i) => (
                  <th key={i} style={{
                    textAlign: 'center', padding: '8px 4px', fontSize: 12, fontWeight: 600,
                    color: (i + 1) === currentMonth ? '#006D77' : 'var(--gray-500)',
                    borderBottom: '2px solid var(--gray-200)',
                    background: (i + 1) === currentMonth ? '#E0F2F1' : 'transparent',
                  }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CALENDAR_SPECIES.map((species, idx) => {
                const season = SEAFOOD_SEASONS[species]
                const emoji = SPECIES_EMOJI[species] || '🐟'
                return (
                  <tr key={species} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '8px 10px', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <span style={{ marginRight: 6 }}>{emoji}</span>
                      {species}
                      {season.peak && <Star size={12} style={{ marginLeft: 4, color: '#FFD54F', verticalAlign: 'middle' }} />}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthNum = i + 1
                      const isCurrentMonth = monthNum === currentMonth
                      const isAvailable = season.months.includes(monthNum)
                      const isPeak = season.peak && isAvailable
                      return (
                        <td key={i} style={{ textAlign: 'center', padding: '6px 2px' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 6, margin: '0 auto',
                            background: isPeak ? '#00C853' : isAvailable ? '#4CAF50' : '#E0E0E0',
                            border: isCurrentMonth ? '2px solid #006D77' : '2px solid transparent',
                            transition: 'all 0.15s',
                          }} title={`${MOIS_COMPLETS[i]} — ${species}: ${isPeak ? 'Pic' : isAvailable ? 'Disponible' : 'Fermé'}`} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 4. PORTS DE PÊCHE ===== */}
      <div className="section-block">
        <h2><Anchor size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Ports de Pêche</h2>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Filter size={18} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
          <div className="chip-grid">
            {([
              { value: 'tous' as PortTypeFilter, label: 'Tous', emoji: '⚓' },
              { value: 'principal' as PortTypeFilter, label: 'Principal', emoji: '🚢' },
              { value: 'secondaire' as PortTypeFilter, label: 'Secondaire', emoji: '⛵' },
              { value: 'artisanal' as PortTypeFilter, label: 'Artisanal', emoji: '🎣' },
            ]).map(f => (
              <button
                key={f.value}
                className={`chip ${portFilter === f.value ? 'active' : ''}`}
                onClick={() => setPortFilter(f.value)}
              >
                <span style={{ fontSize: 14 }}>{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ports list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredPorts.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 32 }}>🔍</div>
              <h3>Aucun port trouvé</h3>
              <p>Essayez un autre filtre.</p>
            </div>
          ) : (
            filteredPorts.map(port => {
              const isExpanded = expandedPort === port.id
              const badge = PORT_TYPE_BADGE[port.type]
              return (
                <div key={port.id} style={{
                  background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--gray-200)', overflow: 'hidden',
                  transition: 'all 0.2s',
                }}>
                  <button
                    onClick={() => setExpandedPort(isExpanded ? null : port.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', gap: 12, textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: port.type === 'principal' ? '#E3F2FD' : port.type === 'secondaire' ? '#E8F5E9' : '#FFF3E0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <MapPin size={18} style={{ color: port.type === 'principal' ? '#1565C0' : port.type === 'secondaire' ? '#2E7D32' : '#E65100' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-900)' }}>{port.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{port.commune}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      <span style={{ fontSize: 13, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                        🚢 {port.boats}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--gray-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={14} style={{ flexShrink: 0 }} />
                          <span>Commune : {port.commune}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Anchor size={14} style={{ flexShrink: 0 }} />
                          <span>Type : {port.type.charAt(0).toUpperCase() + port.type.slice(1)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Fish size={14} style={{ flexShrink: 0 }} />
                          <span>{port.boats} bateaux enregistrés</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14 }}>📍</span>
                          <span>Coordonnées : {port.lat.toFixed(4)}, {port.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gray-500)' }}>
          {filteredPorts.length} port{filteredPorts.length !== 1 ? 's' : ''} affiché{filteredPorts.length !== 1 ? 's' : ''} sur {FISHING_PORTS.length}
        </div>
      </div>

      {/* ===== 5. ESPÈCES & PRIX ===== */}
      <div className="section-block">
        <h2><Fish size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Espèces &amp; Prix</h2>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Filter size={18} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
          <div className="chip-grid">
            {([
              { value: 'tous' as SpeciesFilter, label: 'Toutes', emoji: '🐟' },
              { value: 'Poisson' as SpeciesFilter, label: 'Poissons', emoji: '🐠' },
              { value: 'Crustacé' as SpeciesFilter, label: 'Crustacés', emoji: '🦀' },
              { value: 'Mollusque' as SpeciesFilter, label: 'Mollusques', emoji: '🐚' },
            ]).map(f => (
              <button
                key={f.value}
                className={`chip ${speciesFilter === f.value ? 'active' : ''}`}
                onClick={() => setSpeciesFilter(f.value)}
              >
                <span style={{ fontSize: 14 }}>{f.emoji}</span> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Species table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)' }}>Espèce</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)' }}>Catégorie</th>
                <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)' }}>Saison</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', borderBottom: '2px solid var(--gray-200)' }}>Prix (€/kg)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecies.map(species => {
                const emoji = SPECIES_EMOJI[species] || '🐟'
                const category = SPECIES_CATEGORY[species] || 'Poisson'
                const status = getSpeciesStatus(species, currentMonth)
                const price = SPECIES_PRICE[species] || [10, 20]
                const statusLabel = status === 'pic' ? '⭐ Pic' : status === 'disponible' ? '🟢 Disponible' : '🔴 Fermé'
                const statusColor = status === 'pic' ? '#00C853' : status === 'disponible' ? '#4CAF50' : '#E53935'

                return (
                  <tr key={species} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500 }}>
                      <span style={{ marginRight: 6 }}>{emoji}</span>
                      {species}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${category === 'Poisson' ? 'badge-blue' : category === 'Crustacé' ? 'badge-orange' : 'badge-teal'}`}>
                        {category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14, color: statusColor, fontWeight: 600 }}>
                      {statusLabel}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {price[0]}–{price[1]} €
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--gray-500)' }}>
          {filteredSpecies.length} espèce{filteredSpecies.length !== 1 ? 's' : ''} affichée{filteredSpecies.length !== 1 ? 's' : ''} sur {SEAFOOD_SPECIES.length} — Prix indicatifs gros
        </div>
      </div>

      {/* ===== 6. ACTEURS DE LA FILIÈRE ===== */}
      <div className="section-block">
        <h2><Anchor size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Acteurs de la Filière Pêche</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {ACTEURS.map((actor, idx) => {
            const isExpanded = expandedActor === idx
            const roleCfg = ROLE_BADGE[actor.role]
            return (
              <div key={idx} style={{
                background: 'var(--gray-50)', borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-200)', overflow: 'hidden',
                transition: 'all 0.2s',
              }}>
                <button
                  onClick={() => setExpandedActor(isExpanded ? null : idx)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    width: '100%', padding: '16px 18px', background: 'none', border: 'none',
                    cursor: 'pointer', gap: 10, textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>
                      {actor.name}
                    </div>
                    <span className={`badge ${roleCfg.cls}`} style={{ marginBottom: 4 }}>
                      {roleCfg.label}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={18} style={{ flexShrink: 0, marginTop: 2 }} /> : <ChevronDown size={18} style={{ flexShrink: 0, marginTop: 2 }} />}
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
                    <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>{actor.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-700)' }}>
                        <MapPin size={14} style={{ flexShrink: 0, color: 'var(--gray-500)' }} />
                        <span>{actor.address}</span>
                      </div>
                      {actor.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Phone size={14} style={{ flexShrink: 0, color: 'var(--gray-500)' }} />
                          <a href={`tel:+596${formatPhone(actor.phone)}`} style={{ color: '#006D77', fontWeight: 500 }}>
                            {actor.phone}
                          </a>
                          <a
                            href={`https://wa.me/596${formatPhone(actor.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#25D366', fontWeight: 500 }}
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        </div>
                      )}
                      {actor.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Mail size={14} style={{ flexShrink: 0, color: 'var(--gray-500)' }} />
                          <a href={`mailto:${actor.email}`} style={{ color: '#006D77', fontWeight: 500 }}>
                            {actor.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== 7. RECOMMANDATIONS STRATÉGIQUES ===== */}
      <div className="section-block">
        <h2><TrendingUp size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Recommandations Stratégiques</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {RECOMMANDATIONS.map((rec, idx) => (
            <div key={idx} style={{
              background: 'var(--gray-50)', borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-200)', padding: '24px 20px',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: rec.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {rec.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)', marginBottom: 4 }}>
                    {rec.title}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>
                    {rec.description}
                  </p>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                background: rec.color, color: 'white',
                fontSize: 14, fontWeight: 700,
              }}>
                {rec.stat}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 8. CTA ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #006D77 100%)',
        borderRadius: 'var(--radius)',
        padding: '56px 32px',
        color: 'white',
        textAlign: 'center',
        marginTop: 8,
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          <Fish size={26} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Rejoignez la filière pêche KopéAgri
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 520, margin: '0 auto 24px' }}>
          Connectez-vous aux pêcheurs, mareyeurs et acheteurs de Martinique. Digitalisez votre activité et accédez aux marchés caraïbes.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/596696653589"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ background: '#25D366', color: 'white', textDecoration: 'none' }}
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
          <a
            href="mailto:peche@kopeagri.mq"
            className="btn btn-outline"
            style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', textDecoration: 'none' }}
          >
            <Mail size={18} /> peche@kopeagri.mq
          </a>
        </div>
      </div>
    </div>
  )
}

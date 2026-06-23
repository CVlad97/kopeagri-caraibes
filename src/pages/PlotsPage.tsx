import React, { useState } from 'react'
import { MapPin, Droplets, Sun, Wind, Edit, Plus, Search } from 'lucide-react'

const SAMPLE_PLOTS = [
  { id: 1, name: 'Parcelle Nord-Est', farm: 'EARL Larcher', surface: 2.5, soil: 'Argilo-calcaire', water: true, status: 'cultivated', crop: 'Banane Cavendish', commune: 'Le Morne-Rouge' },
  { id: 2, name: 'Terrain Basse-Terre', farm: 'EARL Larcher', surface: 1.2, soil: 'Volcanique', water: true, status: 'available', crop: null, commune: 'Saint-Pierre' },
  { id: 3, name: 'Jardin Créole Sud', farm: 'Coopérative Nord', surface: 3.0, soil: 'Limoneux', water: false, status: 'cultivated', crop: 'Mangue José, Avocat', commune: 'Le François' },
  { id: 4, name: 'Parcelle Côte-Vent', farm: 'SCEA Galbas', surface: 0.8, soil: 'Sablo-argileux', water: true, status: 'fallow', crop: null, commune: 'Sainte-Luce' },
  { id: 5, name: 'Plateau Bellevue', farm: 'Coopérative Nord', surface: 5.0, soil: 'Volcanique riche', water: true, status: 'available', crop: null, commune: 'Ajoupa-Bouillon', rental: 'Location annuelle 1500€/ha' },
]

const STATUS: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: '#2E7D32' },
  cultivated: { label: 'Cultivée', color: '#F57C00' },
  fallow: { label: 'Jachère', color: '#757575' },
  rented: { label: 'Louée', color: '#0277BD' },
}

const PlotsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = SAMPLE_PLOTS.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.commune.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1><MapPin size={24} /> Carte des parcelles</h1>
        <p className="page-subtitle">Terrains disponibles, cultivés et en location</p>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Rechercher par nom ou commune..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        <div className="filter-btns">
          {['all', 'available', 'cultivated', 'fallow', 'rented'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tous' : STATUS[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* Map Preview */}
      <div className="map-preview">
        <div className="map-placeholder">
          <MapPin size={48} />
          <p>Carte interactive — Martinique</p>
          <span>Visualisation des parcelles par commune</span>
          <div className="map-communes">
            {[...new Set(SAMPLE_PLOTS.map(p => p.commune))].map(c => (
              <span key={c} className="commune-chip">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Plots Grid */}
      <div className="plots-grid">
        {filtered.map(plot => {
          const st = STATUS[plot.status] || { label: plot.status, color: '#666' }
          return (
            <div key={plot.id} className="plot-card">
              <div className="plot-header">
                <h3>{plot.name}</h3>
                <span className="plot-status" style={{ backgroundColor: st.color + '20', color: st.color }}>{st.label}</span>
              </div>
              <p className="plot-farm">{plot.farm}</p>
              <div className="plot-details">
                <div className="plot-detail"><MapPin size={14} /> {plot.commune}</div>
                <div className="plot-detail"><Sun size={14} /> {plot.surface} ha</div>
                <div className="plot-detail"><Wind size={14} /> {plot.soil}</div>
                <div className="plot-detail"><Droplets size={14} /> {plot.water ? 'Accès eau ✓' : 'Pas d\'accès eau'}</div>
              </div>
              {plot.crop && <p className="plot-crop">🌿 {plot.crop}</p>}
              {plot.rental && <div className="plot-rental">{plot.rental}</div>}
              <div className="plot-actions">
                <button className="btn btn-sm btn-outline"><Edit size={14} /> Modifier</button>
                <button className="btn btn-sm btn-primary">Réserver</button>
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn btn-primary fab" title="Ajouter une parcelle"><Plus size={24} /></button>
    </div>
  )
}

export default PlotsPage
import React, { useState, useEffect } from 'react'
import { MapPin, Droplets, Sun, Wind, Plus, Search, Pencil, Trash2, Eye, EyeOff, Check, X } from 'lucide-react'
import { getAll, add, update, toggleActive, remove } from '../services/dataService'
import type { Plot } from '../services/dataService'
import { Modal, PlotForm, BookingForm } from '../components/EntityForms'
import type { PlotFormData, BookingFormData } from '../components/EntityForms'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { COMMUNE_COORDS } from '../services/billingService'

// Fix Leaflet default marker icon — use CDN URLs explicitly
const markerIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const STATUS: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: '#2E7D32' },
  cultivated: { label: 'Cultivée', color: '#F57C00' },
  fallow: { label: 'Jachère', color: '#757575' },
  rented: { label: 'Louée', color: '#0277BD' },
}

const PlotsPage: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Plot | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingItem, setBookingItem] = useState<Plot | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = () => setPlots(getAll('plots') as Plot[])
  useEffect(load, [])

  const handleAdd = (data: PlotFormData) => {
    if (editItem) {
      update('plots', editItem.id, { ...data, active: editItem.active } as any)
      setEditItem(null)
    } else {
      add('plots', { ...data, active: true } as any)
    }
    setShowForm(false)
    load()
  }

  const handleEdit = (item: Plot) => {
    setEditItem(item)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    remove('plots', id)
    setConfirmDeleteId(null)
    load()
  }

  const handleToggle = (id: string) => {
    toggleActive('plots', id)
    load()
  }

  const handleBooking = (data: BookingFormData) => {
    if (!bookingItem) return
    add('bookings', {
      collection: 'plots',
      item_id: bookingItem.id,
      item_name: bookingItem.name,
      name: data.name,
      phone: data.phone,
      dates: data.dates,
      message: data.message,
      active: true,
    } as any)
    setShowBooking(false)
    setBookingItem(null)
  }

  const filtered = plots.filter(p => {
    if (!p.active && filter === 'all') return true // show all including inactive
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.commune.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Plots with known commune coordinates for map markers
  const mapPlots = filtered.filter(p => p.active && COMMUNE_COORDS[p.commune])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><MapPin size={24} /> Carte des parcelles</h1>
          <p className="page-subtitle">{filtered.filter(p => p.active).length} actifs sur {filtered.length} — Terrains disponibles, cultivés et en location</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus size={18} /> Ajouter
        </button>
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

      {/* Interactive Leaflet Map */}
      <div className="map-preview" style={{ height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={[14.6415, -61.0]} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapPlots.map(plot => {
            const coords = COMMUNE_COORDS[plot.commune]
            const st = STATUS[plot.status] || { label: plot.status, color: '#666' }
            return (
              <Marker key={plot.id} position={[coords.lat, coords.lng]} icon={markerIcon}>
                <Popup>
                  <strong>{plot.name}</strong><br />
                  {st.label} — {plot.surface} ha<br />
                  {plot.commune}
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Commune chips */}
      <div className="map-communes" style={{ marginTop: 8 }}>
        {[...new Set(filtered.filter(p => p.active).map(p => p.commune))].map(c => (
          <span key={c} className="commune-chip">{c}</span>
        ))}
      </div>

      {/* Plots Grid */}
      <div className="plots-grid">
        {filtered.map(plot => {
          const st = STATUS[plot.status] || { label: plot.status, color: '#666' }
          return (
            <div key={plot.id} className={`plot-card ${!plot.active ? 'card-inactive' : ''}`}>
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
              {!plot.active && <p className="badge badge-gray" style={{ marginTop: 4 }}>Inactif</p>}
              <div className="plot-actions">
                <button className="btn-icon" onClick={() => handleEdit(plot)} title="Modifier">
                  <Pencil size={16} />
                </button>
                <button className={`btn-icon ${plot.active ? 'active' : ''}`} onClick={() => handleToggle(plot.id)} title={plot.active ? 'Désactiver' : 'Activer'}>
                  {plot.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                {confirmDeleteId === plot.id ? (
                  <div className="confirm-delete">
                    <span className="confirm-text">Confirmer ?</span>
                    <button className="btn-icon danger" onClick={() => handleDelete(plot.id)} title="Confirmer">
                      <Check size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => setConfirmDeleteId(null)} title="Annuler">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button className="btn-icon danger" onClick={() => setConfirmDeleteId(plot.id)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                )}
                {plot.status === 'available' && plot.active && (
                  <button className="btn btn-sm btn-primary" onClick={() => { setBookingItem(plot); setShowBooking(true) }}>Réserver</button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">Aucune parcelle trouvée</div>}

      {/* Add/Edit Modal */}
      <Modal open={showForm} title={editItem ? 'Modifier la parcelle' : 'Ajouter une parcelle'} onClose={handleCancelForm}>
        <PlotForm
          initial={editItem ? { name: editItem.name, farm: editItem.farm, surface: editItem.surface, soil: editItem.soil, water: editItem.water, status: editItem.status, crop: editItem.crop, commune: editItem.commune, rental: editItem.rental } : undefined}
          onSubmit={handleAdd}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Booking Modal */}
      <Modal open={showBooking} title="Réserver une parcelle" onClose={() => { setShowBooking(false); setBookingItem(null) }}>
        {bookingItem && (
          <BookingForm
            itemName={bookingItem.name}
            onSubmit={handleBooking}
            onCancel={() => { setShowBooking(false); setBookingItem(null) }}
          />
        )}
      </Modal>
    </div>
  )
}

export default PlotsPage

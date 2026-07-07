import React, { useState, useEffect } from 'react'
import { Search, MapPin, DollarSign, Plus, Pencil, Trash2, Eye, EyeOff, Check, X } from 'lucide-react'
import { getAll, add, update, toggleActive, remove } from '../services/dataService'
import type { Resource } from '../services/dataService'
import { Modal, ResourceForm, BookingForm } from '../components/EntityForms'
import type { ResourceFormData, BookingFormData } from '../components/EntityForms'

const TYPE_ICONS: Record<string, string> = {
  materiel: '🔧',
  chambre_froide: '❄️',
  camion: '🚛',
  main_oeuvre: '👥',
  intrant: '🧪',
  emballage: '📦',
}

const TYPE_LABELS: Record<string, string> = {
  materiel: 'Matériel agricole',
  chambre_froide: 'Chambre froide',
  camion: 'Camion/Camionnette',
  main_oeuvre: 'Main-d\'œuvre',
  intrant: 'Intrants',
  emballage: 'Emballages',
}

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Resource | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingItem, setBookingItem] = useState<Resource | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = () => setResources(getAll('resources') as Resource[])
  useEffect(load, [])

  const handleAdd = (data: ResourceFormData) => {
    if (editItem) {
      update('resources', editItem.id, { ...data, active: editItem.active } as any)
      setEditItem(null)
    } else {
      add('resources', { ...data, active: true } as any)
    }
    setShowForm(false)
    load()
  }

  const handleEdit = (item: Resource) => {
    setEditItem(item)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    remove('resources', id)
    setConfirmDeleteId(null)
    load()
  }

  const handleToggle = (id: string) => {
    toggleActive('resources', id)
    load()
  }

  const handleBooking = (data: BookingFormData) => {
    if (!bookingItem) return
    add('bookings', {
      collection: 'resources',
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

  const filtered = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.commune.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔧 Bourse aux ressources</h1>
          <p className="page-subtitle">{filtered.filter(r => r.active).length} actifs sur {filtered.length} — Matériel, chambres froides, transport, main-d'œuvre, intrants, emballages</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus size={18} /> Ajouter
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Rechercher une ressource..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
      </div>

      <div className="type-filters">
        {['all', 'materiel', 'chambre_froide', 'camion', 'main_oeuvre', 'intrant', 'emballage'].map(t => (
          <button key={t} className={`type-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
            {t === 'all' ? '📋 Tous' : `${TYPE_ICONS[t] || '📋'} ${TYPE_LABELS[t] || t}`}
          </button>
        ))}
      </div>

      <div className="resources-grid">
        {filtered.map(res => (
          <div key={res.id} className={`resource-card ${!res.active ? 'card-inactive' : ''} ${!res.available ? 'unavailable' : ''}`}>
            <div className="resource-header">
              <span className="resource-type-badge">{TYPE_ICONS[res.type] || '📋'} {TYPE_LABELS[res.type]}</span>
              <span className={`status-dot ${res.available ? 'available' : 'unavailable'}`}>
                {res.available ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <h3>{res.name}</h3>
            <p className="resource-owner">👤 {res.owner}</p>
            <p className="resource-desc">{res.desc}</p>
            <div className="resource-meta">
              <span><MapPin size={14} /> {res.commune}</span>
              <span><DollarSign size={14} /> {res.rate}€/{res.unit}</span>
              <span>📦 {res.quantity} {res.unit}</span>
            </div>
            {!res.active && <p className="badge badge-gray" style={{ marginTop: 4 }}>Inactif</p>}
            <div className="crud-actions" style={{ marginTop: 8 }}>
              <button className="btn-icon edit" onClick={() => handleEdit(res)} title="Modifier">
                <Pencil size={16} />
              </button>
              <button className={`btn-icon ${res.active ? 'active' : ''}`} onClick={() => handleToggle(res.id)} title={res.active ? 'Désactiver' : 'Activer'}>
                {res.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              {confirmDeleteId === res.id ? (
                <div className="confirm-delete">
                  <span className="confirm-text">Confirmer ?</span>
                  <button className="btn-icon danger" onClick={() => handleDelete(res.id)} title="Confirmer">
                    <Check size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => setConfirmDeleteId(null)} title="Annuler">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button className="btn-icon danger" onClick={() => setConfirmDeleteId(res.id)} title="Supprimer">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <button
              className="btn btn-primary btn-full"
              disabled={!res.available || !res.active}
              onClick={() => { if (res.available && res.active) { setBookingItem(res); setShowBooking(true) } }}
            >
              {res.available && res.active ? 'Réserver' : 'Indisponible'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state">Aucune ressource trouvée</div>}

      {/* Add/Edit Modal */}
      <Modal open={showForm} title={editItem ? 'Modifier la ressource' : 'Ajouter une ressource'} onClose={handleCancelForm}>
        <ResourceForm
          initial={editItem ? { name: editItem.name, type: editItem.type, owner: editItem.owner, commune: editItem.commune, rate: editItem.rate, unit: editItem.unit, quantity: editItem.quantity, desc: editItem.desc, available: editItem.available } : undefined}
          onSubmit={handleAdd}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Booking Modal */}
      <Modal open={showBooking} title="Réserver une ressource" onClose={() => { setShowBooking(false); setBookingItem(null) }}>
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

export default ResourcesPage

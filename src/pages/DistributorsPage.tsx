import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, ToggleLeft, ToggleRight, Trash2, ShoppingCart, Pencil } from 'lucide-react'
import { getAll, add, update, toggleActive, remove } from '../services/dataService'
import type { Distributor } from '../services/dataService'
import EntityForms from '../components/EntityForms'

const TYPE_LABELS: Record<string, string> = {
  grossiste: 'Grossiste',
  distributeur: 'Distributeur',
  transitaire: 'Transitaire',
  exportateur: 'Exportateur',
  hotel_restaurant: 'Hôtel/Restaurant',
}

const DistributorsPage: React.FC = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Distributor | null>(null)

  const load = () => setDistributors(getAll('distributors') as Distributor[])
  useEffect(load, [])

  const handleAdd = (data: Record<string, unknown>) => {
    if (editItem) {
      update('distributors', editItem.id, data as any)
      setEditItem(null)
    } else {
      add('distributors', data as any)
    }
    setShowForm(false)
    load()
  }

  const handleEdit = (item: Distributor) => {
    setEditItem(item)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditItem(null)
  }

  const filtered = distributors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.commune.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><ShoppingCart size={24} /> Distributeurs</h1>
          <p className="page-subtitle">{filtered.filter(d => d.active).length} actifs sur {filtered.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus size={18} /> Ajouter
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Chercher par nom ou commune..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && <EntityForms type="distributors" onSubmit={handleAdd} onCancel={handleCancelForm} initial={editItem ? { name: editItem.name, contact: editItem.contact, phone: editItem.phone, commune: editItem.commune, type: editItem.type } : undefined} />}

      <div className="card-grid">
        {filtered.map(d => (
          <div key={d.id} className={`card ${!d.active ? 'card-inactive' : ''}`}>
            <div className="card-header">
              <h3>{d.name}</h3>
              <span className={`badge ${d.active ? 'badge-green' : 'badge-gray'}`}>
                {TYPE_LABELS[d.type] || d.type}
              </span>
            </div>
            <div className="card-body">
              <p className="card-commune">📍 {d.commune}</p>
              <p className="card-type">{TYPE_LABELS[d.type] || d.type}</p>
            </div>
            <div className="card-actions">
              <a
                href={`https://wa.me/${d.phone.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm whatsapp-btn"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <button className="btn-icon" onClick={() => handleEdit(d)} title="Modifier">
                <Pencil size={18} />
              </button>
              <button className="btn btn-sm" onClick={() => { toggleActive('distributors', d.id); load() }}>
                {d.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => { remove('distributors', d.id); load() }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">Aucun distributeur trouvé</div>}
    </div>
  )
}

export default DistributorsPage

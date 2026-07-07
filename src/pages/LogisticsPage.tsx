import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, ToggleLeft, ToggleRight, Trash2, Truck, Pencil } from 'lucide-react'
import { getAll, add, update, toggleActive, remove } from '../services/dataService'
import type { LogisticsProvider } from '../services/dataService'
import EntityForms from '../components/EntityForms'

const LogisticsPage: React.FC = () => {
  const [providers, setProviders] = useState<LogisticsProvider[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<LogisticsProvider | null>(null)

  const load = () => setProviders(getAll('logistics') as LogisticsProvider[])
  useEffect(load, [])

  const handleAdd = (data: Record<string, unknown>) => {
    if (editItem) {
      update('logistics', editItem.id, data as any)
      setEditItem(null)
    } else {
      add('logistics', data as any)
    }
    setShowForm(false)
    load()
  }

  const handleEdit = (item: LogisticsProvider) => {
    setEditItem(item)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditItem(null)
  }

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.commune.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><Truck size={24} /> Transporteurs</h1>
          <p className="page-subtitle">{filtered.filter(p => p.active).length} actifs sur {filtered.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus size={18} /> Ajouter
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Chercher par nom ou commune..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && <EntityForms type="logistics" onSubmit={handleAdd} onCancel={handleCancelForm} initial={editItem ? { name: editItem.name, contact: editItem.contact, phone: editItem.phone, commune: editItem.commune, services: editItem.services, fleet: editItem.fleet } : undefined} />}

      <div className="card-grid">
        {filtered.map(p => (
          <div key={p.id} className={`card ${!p.active ? 'card-inactive' : ''}`}>
            <div className="card-header">
              <h3>{p.name}</h3>
              <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>
                {p.active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="card-body">
              <p className="card-commune">📍 {p.commune}</p>
              <p className="card-services">{p.services?.join(', ') || 'Aucun service'}</p>
              <p className="card-fleet">🚛 {p.fleet || 'Flotte non renseignée'}</p>
            </div>
            <div className="card-actions">
              <a
                href={`https://wa.me/${p.phone.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm whatsapp-btn"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <button className="btn-icon" onClick={() => handleEdit(p)} title="Modifier">
                <Pencil size={18} />
              </button>
              <button className="btn btn-sm" onClick={() => { toggleActive('logistics', p.id); load() }}>
                {p.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => { remove('logistics', p.id); load() }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">Aucun transporteur trouvé</div>}
    </div>
  )
}

export default LogisticsPage

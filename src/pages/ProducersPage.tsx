import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, ToggleLeft, ToggleRight, Trash2, Users } from 'lucide-react'
import { getAll, add, toggleActive, remove } from '../services/dataService'
import type { Producer } from '../services/dataService'
import EntityForms from '../components/EntityForms'

const ProducersPage: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => setProducers(getAll('producers') as Producer[])
  useEffect(load, [])

  const handleAdd = (data: Record<string, unknown>) => {
    add('producers', data as any)
    setShowForm(false)
    load()
  }

  const filtered = producers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.commune.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><Users size={24} /> Producteurs</h1>
          <p className="page-subtitle">{filtered.filter(p => p.active).length} actifs sur {filtered.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Ajouter
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Chercher par nom ou commune..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showForm && <EntityForms type="producers" onSubmit={handleAdd} onCancel={() => setShowForm(false)} />}

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
              <p className="card-cultures">{p.cultures?.join(', ') || 'Aucune culture'}</p>
              {p.certifications?.length > 0 && (
                <p className="card-certifs">✅ {p.certifications.join(', ')}</p>
              )}
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
              <button className="btn btn-sm" onClick={() => { toggleActive('producers', p.id); load() }}>
                {p.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => { remove('producers', p.id); load() }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">Aucun producteur trouvé</div>}
    </div>
  )
}

export default ProducersPage

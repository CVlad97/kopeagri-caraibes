import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, ToggleLeft, ToggleRight, Trash2, Check, X, Truck, Pencil, Plane, Ship, ExternalLink, Mail, PackageCheck } from 'lucide-react'
import { getAll, add, update, toggleActive, remove } from '../services/dataService'
import type { LogisticsProvider } from '../services/dataService'
import EntityForms from '../components/EntityForms'

const LogisticsPage: React.FC = () => {
  const [providers, setProviders] = useState<LogisticsProvider[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<LogisticsProvider | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const load = () => setProviders(getAll('logistics') as LogisticsProvider[])
  useEffect(load, [])

  const handleDelete = (id: string) => { remove('logistics', id); setConfirmDeleteId(null); load() }

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
    <div className="page">
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

      <section className="card" style={{ padding: 18, marginBottom: 18, border: '1px solid #b7dfd1', background: 'linear-gradient(135deg,#f3fbf7,#ffffff)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 720 }}>
            <span className="badge badge-green">Prestataire logistique identifié — à contractualiser</span>
            <h2 style={{ margin: '10px 0 6px' }}>Meridian Affret — corridor France / Europe / Caraïbes</h2>
            <p style={{ margin: 0, opacity: .82 }}>Commissionnaire de transport vérifié publiquement : route en France/Europe, aérien, maritime, enlèvement au dépôt ou directement chez le fournisseur, documents/douane et suivi d’expédition.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <a className="btn btn-primary" href="https://meridianaffret.com/demande-cotation" target="_blank" rel="noopener noreferrer">Demander une cotation <ExternalLink size={14} /></a>
            <a className="btn btn-outline" href="mailto:info@meridianaffret.com"><Mail size={14} /> Email</a>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 16 }}>
          <div className="card" style={{ padding: 12 }}><Truck size={18} /><strong> France / Europe</strong><p style={{ margin: '6px 0 0', fontSize: 13 }}>Collecte fournisseur et transport routier.</p></div>
          <div className="card" style={{ padding: 12 }}><Plane size={18} /><strong> Aérien</strong><p style={{ margin: '6px 0 0', fontSize: 13 }}>Pour flux rapides selon devis et contraintes produit.</p></div>
          <div className="card" style={{ padding: 12 }}><Ship size={18} /><strong> Maritime</strong><p style={{ margin: '6px 0 0', fontSize: 13 }}>Groupage ou volumes importants selon étude.</p></div>
          <div className="card" style={{ padding: 12 }}><PackageCheck size={18} /><strong> Passage de relais</strong><p style={{ margin: '6px 0 0', fontSize: 13 }}>KopéAgri prépare et consolide ; le commissionnaire prend le flux export après validation.</p></div>
        </div>
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: '#fff8e6', fontSize: 13 }}>
          <strong>Opérationnel communiqué :</strong> dépôt 6A rue Henri François, Lot 41, 77330 Ozoir-la-Ferrière, chez AJM. À utiliser seulement après confirmation du dossier/cotation. Les tarifs, délais et conditions restent ceux du devis Meridian.
        </div>
      </section>

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
              {confirmDeleteId === p.id ? (
                <div className="confirm-delete">
                  <span className="confirm-text">Confirmer ?</span>
                  <button className="btn-icon danger" onClick={() => handleDelete(p.id)} title="Confirmer"><Check size={16} /></button>
                  <button className="btn-icon" onClick={() => setConfirmDeleteId(null)} title="Annuler"><X size={16} /></button>
                </div>
              ) : (
                <button className="btn-icon danger" onClick={() => setConfirmDeleteId(p.id)} title="Supprimer"><Trash2 size={16} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">Aucun transporteur trouvé</div>}
    </div>
  )
}

export default LogisticsPage

import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Truck, ShoppingCart, Download, Eye, EyeOff, Trash2, Search, DownloadCloud } from 'lucide-react'
import { getAll, toggleActive, remove } from '../services/dataService'
import type { Producer, LogisticsProvider, Distributor } from '../services/dataService'

type TabId = 'dashboard' | 'producers' | 'logistics' | 'distributors'

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [producers, setProducers] = useState<Producer[]>([])
  const [logistics, setLogistics] = useState<LogisticsProvider[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setProducers(getAll('producers'))
    setLogistics(getAll('logistics'))
    setDistributors(getAll('distributors'))
  }, [tab])

  const refreshProducers = () => setProducers(getAll('producers'))
  const refreshLogistics = () => setLogistics(getAll('logistics'))
  const refreshDistributors = () => setDistributors(getAll('distributors'))

  const handleToggle = (key: 'producers' | 'logistics' | 'distributors', id: string) => {
    toggleActive(key, id)
    if (key === 'producers') refreshProducers()
    else if (key === 'logistics') refreshLogistics()
    else refreshDistributors()
  }

  const handleDelete = (key: 'producers' | 'logistics' | 'distributors', id: string, name: string) => {
    if (confirm(`Supprimer ${name} ? Cette action est irréversible.`)) {
      remove(key, id)
      if (key === 'producers') refreshProducers()
      else if (key === 'logistics') refreshLogistics()
      else refreshDistributors()
    }
  }

  const exportCSV = (key: string) => {
    let data: any[] = []
    let headers: string[] = []
    if (key === 'producers') {
      data = producers
      headers = ['Nom', 'Contact', 'Téléphone', 'Commune', 'Cultures', 'Certifications', 'Actif']
    } else if (key === 'logistics') {
      data = logistics
      headers = ['Nom', 'Contact', 'Téléphone', 'Commune', 'Services', 'Flotte', 'Actif']
    } else {
      data = distributors
      headers = ['Nom', 'Contact', 'Téléphone', 'Commune', 'Type', 'Actif']
    }
    const csv = [
      headers.join(','),
      ...data.map((d: any) => [
        `"${d.name}"`, `"${d.contact}"`, d.phone, d.commune,
        `"${d.cultures?.join('; ') || d.services?.join('; ') || d.type}"`,
        d.fleet || d.certifications?.join('; ') || '',
        d.active ? 'Oui' : 'Non',
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kopeagri-${key}-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalActive = producers.filter(p => p.active).length + logistics.filter(l => l.active).length + distributors.filter(d => d.active).length

  const renderTable = (items: any[], key: 'producers' | 'logistics' | 'distributors') => {
    const filtered = search ? items.filter((i: any) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.commune.toLowerCase().includes(search.toLowerCase())
    ) : items

    return (
      <div>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(key)}>
            <DownloadCloud size={14} /> Export CSV
          </button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Téléphone</th>
                <th>Commune</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-cell">Aucune donnée — ajoutez vos premiers partenaires</td></tr>
              ) : filtered.map((item: any) => (
                <tr key={item.id} className={!item.active ? 'row-inactive' : ''}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.contact}</td>
                  <td>{item.phone}</td>
                  <td>{item.commune}</td>
                  <td><span className={`badge ${item.active ? 'badge-green' : 'badge-orange'}`}>{item.active ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn-icon" onClick={() => handleToggle(key, item.id)} title={item.active ? 'Désactiver' : 'Activer'}>
                        {item.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(key, item.id, item.name)} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-count">{filtered.length} entrée(s) sur {items.length} totale(s)</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><BarChart3 size={28} /> Gestion des données</h1>
        <p className="page-subtitle">Administrez vos partenaires réels — producteurs, transporteurs, distributeurs</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2E7D3220', color: '#2E7D32' }}><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-num">{producers.filter(p => p.active).length}</span>
            <span className="stat-label">Producteurs actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F57C0020', color: '#F57C00' }}><Truck size={24} /></div>
          <div className="stat-info">
            <span className="stat-num">{logistics.filter(l => l.active).length}</span>
            <span className="stat-label">Transporteurs actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#0277BD20', color: '#0277BD' }}><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <span className="stat-num">{distributors.filter(d => d.active).length}</span>
            <span className="stat-label">Distributeurs actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#6A1B9A20', color: '#6A1B9A' }}><Download size={24} /></div>
          <div className="stat-info">
            <span className="stat-num">{totalActive}</span>
            <span className="stat-label">Partenaires actifs totaux</span>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          { id: 'dashboard' as TabId, label: '📊 Synthèse' },
          { id: 'producers' as TabId, label: `👨‍🌾 Producteurs (${producers.length})` },
          { id: 'logistics' as TabId, label: `🚛 Transporteurs (${logistics.length})` },
          { id: 'distributors' as TabId, label: `🏪 Distributeurs (${distributors.length})` },
        ].map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'dashboard' && (
          <div className="section-block">
            <h2>Bienvenue dans l'administration</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
              Gérez vos données réelles — producteurs agricoles, transporteurs/logisticiens et distributeurs/acheteurs B2B de Martinique.
              Ajoutez, activez/désactivez ou supprimez des entrées. Aucune donnée fictive.
            </p>
            <div className="quick-actions">
              <button className="quick-action-card" onClick={() => setTab('producers')} style={{ borderColor: '#2E7D32' }}>
                <Users size={28} style={{ color: '#2E7D32' }} /> Producteurs
              </button>
              <button className="quick-action-card" onClick={() => setTab('logistics')} style={{ borderColor: '#F57C00' }}>
                <Truck size={28} style={{ color: '#F57C00' }} /> Transporteurs
              </button>
              <button className="quick-action-card" onClick={() => setTab('distributors')} style={{ borderColor: '#0277BD' }}>
                <ShoppingCart size={28} style={{ color: '#0277BD' }} /> Distributeurs
              </button>
            </div>
          </div>
        )}

        {tab === 'producers' && renderTable(producers, 'producers')}
        {tab === 'logistics' && renderTable(logistics, 'logistics')}
        {tab === 'distributors' && renderTable(distributors, 'distributors')}
      </div>
    </div>
  )
}

export default AdminPage
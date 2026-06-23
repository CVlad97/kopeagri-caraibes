import React, { useState } from 'react'
import { Search, MapPin, DollarSign } from 'lucide-react'

const SAMPLE_RESOURCES = [
  { id: 1, name: 'Tracteur Massey Ferguson 285', type: 'materiel', owner: 'Coopérative Nord', commune: 'Sainte-Marie', rate: 120, available: true, quantity: 1, unit: 'jour', desc: 'Tracteur 80CV avec relevage, prise de force, parfait pour labour et transport de charges.' },
  { id: 2, name: 'Chambre froide 20m³', type: 'chambre_froide', owner: 'SCEA Galbas', commune: 'Le Lamentin', rate: 80, available: true, quantity: 1, unit: 'jour', desc: 'Chambre froide positive 4°C, idéale pour fruits et légumes. Capacité 5 palettes.' },
  { id: 3, name: 'Camion frigorifique 3.5T', type: 'camion', owner: 'Transports Férand', commune: 'Ducos', rate: 200, available: true, quantity: 1, unit: 'jour', desc: 'Camion frigorifique avec hayon, collecte multi-points, tournée Nord/Sud possible.' },
  { id: 4, name: 'Équipe récolte (3 pers.)', type: 'main_oeuvre', owner: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', rate: 250, available: true, quantity: 2, unit: 'équipe/jour', desc: 'Équipe expérimentée pour récolte bananes, mangues, fruits tropicaux. 3 personnes.' },
  { id: 5, name: 'Engrais bio certifié', type: 'intrant', owner: 'Coopérative Nord', commune: 'Saint-Pierre', rate: 35, available: true, quantity: 250, unit: 'kg', desc: 'Engrais organique NPK 4-6-8, certifié bio, idéal pour maraîchage et vergers.' },
  { id: 6, name: 'Caisse plastique réutilisable', type: 'emballage', owner: 'Coopérative Nord', commune: 'Fort-de-France', rate: 2, available: true, quantity: 500, unit: 'pièce', desc: 'Caisses plastiques empilables 40x30x25cm, lavées et désinfectées. Lot de 50 minimum.' },
  { id: 7, name: 'Broyeur végétaux', type: 'materiel', owner: 'EARL Larcher', commune: 'Le Morne-Rouge', rate: 60, available: false, quantity: 1, unit: 'jour', desc: 'Broyeur thermique 15CV, idéal pour paillage et compost.' },
]

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
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filtered = SAMPLE_RESOURCES.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.commune.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔧 Bourse aux ressources</h1>
        <p className="page-subtitle">Matériel, chambres froides, transport, main-d'œuvre, intrants, emballages</p>
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
          <div key={res.id} className={`resource-card ${!res.available ? 'unavailable' : ''}`}>
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
            <button className="btn btn-primary btn-full" disabled={!res.available}>
              {res.available ? 'Réserver' : 'Indisponible'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResourcesPage
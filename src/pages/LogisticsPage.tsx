import React, { useState } from 'react'
import { Calendar, Truck, CheckCircle, Clock, Navigation } from 'lucide-react'

const SAMPLE_TASKS = [
  { id: 'LOG-001', order: 'CMD-001', type: 'collecte', pickup: 'Le Morne-Rouge (EARL Larcher)', drop: 'Hôtel Bakoua - Trois-Îlets', date: '2026-07-10', status: 'assigned', transporter: 'Marc Férand', notes: 'Collecter 200kg bananes. Point relais Nord.' },
  { id: 'LOG-002', order: 'CMD-002', type: 'collecte', pickup: 'Saint-Pierre (Mangue José)', drop: 'Point relais Dillon', date: '2026-07-12', status: 'pending', transporter: null, notes: 'Collecte multi-produits : mangues + avocats.' },
  { id: 'LOG-003', order: 'CMD-003', type: 'livraison', pickup: 'Chambre froide Lamentin', drop: 'Restaurant Petibonum', date: '2026-07-05', status: 'delivered', transporter: 'Marc Férand', notes: 'Livraison ananas + citrons. Signé.' },
  { id: 'LOG-004', order: 'CMD-004', type: 'export', pickup: 'Port de Fort-de-France', drop: 'Port de Pointe-à-Pitre', date: '2026-07-20', status: 'pending', transporter: null, notes: 'Groupage 1T bananes. Documents export à préparer.' },
]

const TYPE_ICONS: Record<string, string> = { collecte: '📦', livraison: '🚚', export: '🚢' }
const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending: { label: 'En attente', color: '#F57C00', icon: Clock },
  assigned: { label: 'Affectée', color: '#0277BD', icon: Navigation },
  in_transit: { label: 'En transit', color: '#00838F', icon: Truck },
  delivered: { label: 'Livrée', color: '#2E7D32', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: '#C62828', icon: Clock },
}

const LogisticsPage: React.FC = () => {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? SAMPLE_TASKS : SAMPLE_TASKS.filter(t => t.status === filter)

  return (
    <div className="page">
      <div className="page-header">
        <h1>🚛 Logistique mutualisée</h1>
        <p className="page-subtitle">Collecte, points relais, froid, port — optimisation des tournées</p>
      </div>

      <div className="type-filters">
        {['all', 'pending', 'assigned', 'in_transit', 'delivered'].map(f => (
          <button key={f} className={`type-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? '📋 Toutes' : STATUS_CFG[f]?.label || f}
          </button>
        ))}
      </div>

      <div className="logistics-grid">
        {filtered.map(task => {
          const st = STATUS_CFG[task.status] || { label: task.status, color: '#666', icon: Clock }
          const StIcon = st.icon
          return (
            <div key={task.id} className="logistics-card">
              <div className="log-header">
                <span className="log-type-badge">{TYPE_ICONS[task.type] || '📦'} {task.type}</span>
                <span className="log-id">{task.id}</span>
              </div>
              <div className="log-status-row">
                <span className="log-status" style={{ backgroundColor: st.color + '20', color: st.color }}>
                  <StIcon size={14} /> {st.label}
                </span>
              </div>
              <div className="log-route">
                <div className="log-stop">
                  <div className="stop-dot start" />
                  <div>
                    <strong>Départ</strong>
                    <p>{task.pickup}</p>
                  </div>
                </div>
                <div className="log-line" />
                <div className="log-stop">
                  <div className="stop-dot end" />
                  <div>
                    <strong>Arrivée</strong>
                    <p>{task.drop}</p>
                  </div>
                </div>
              </div>
              <div className="log-meta">
                <span><Calendar size={14} /> {task.date}</span>
                {task.transporter && <span>👤 {task.transporter}</span>}
                {!task.transporter && <span className="unassigned">Non affecté</span>}
              </div>
              {task.notes && <p className="log-notes">{task.notes}</p>}
              <div className="log-actions">
                <button className="btn btn-sm btn-outline">Détails</button>
                {task.status === 'pending' && <button className="btn btn-sm btn-primary">Prendre en charge</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LogisticsPage
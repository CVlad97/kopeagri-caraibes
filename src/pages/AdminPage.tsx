import React, { useState } from 'react'
import { BarChart3, Users, Package, DollarSign, Download, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="page">
      <div className="page-header">
        <h1><BarChart3 size={28} /> Administration</h1>
        <p className="page-subtitle">Pilotage de la coopérative — validation, statistiques, commissions</p>
      </div>

      {/* Admin Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#2E7D3220', color: '#2E7D32' }}><Users size={24} /></div><div className="stat-info"><span className="stat-num">45</span><span className="stat-label">Membres</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#F57C0020', color: '#F57C00' }}><ShoppingCart size={24} /></div><div className="stat-info"><span className="stat-num">28</span><span className="stat-label">Commandes</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#0277BD20', color: '#0277BD' }}><Package size={24} /></div><div className="stat-info"><span className="stat-num">156</span><span className="stat-label">Lots</span></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#6A1B9A20', color: '#6A1B9A' }}><DollarSign size={24} /></div><div className="stat-info"><span className="stat-num">8 450€</span><span className="stat-label">Commissions</span></div></div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id: 'dashboard', label: '📊 Vue d\'ensemble', icon: BarChart3 },
          { id: 'members', label: '👥 Membres', icon: Users },
          { id: 'lots', label: '📦 Lots à valider', icon: Package },
          { id: 'export', label: '📤 Export CSV', icon: Download },
        ].map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === 'dashboard' && (
          <>
            {/* Pending validations */}
            <div className="section-block">
              <h2>Validations en attente</h2>
              <div className="validation-list">
                {[
                  { type: 'Nouveau membre', name: 'Marie-Solange Bérard', role: 'Producteur', commune: 'Le Robert', time: 'Il y a 1h' },
                  { type: 'Lot à valider', name: 'Avocat Haas - 300kg', producer: 'Coopérative Nord', commune: 'Le François', time: 'Il y a 3h' },
                  { type: 'Nouveau membre', name: 'Paul Mounier', role: 'Transporteur', commune: 'Ducos', time: 'Il y a 5h' },
                ].map((v, i) => (
                  <div key={i} className="validation-item">
                    <div className="validation-info">
                      <span className="validation-type">{v.type}</span>
                      <strong>{v.name}</strong>
                      <p>{v.producer || v.role} · {v.commune} · {v.time}</p>
                    </div>
                    <div className="validation-actions">
                      <button className="btn btn-sm btn-primary"><CheckCircle size={14} /> Approuver</button>
                      <button className="btn btn-sm btn-outline" style={{ color: '#C62828', borderColor: '#C62828' }}><XCircle size={14} /> Rejeter</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume chart area */}
            <div className="section-block">
              <h2>📈 Volume par commune</h2>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {[
                    { label: 'Morne-Rouge', value: 85 },
                    { label: 'St-Pierre', value: 60 },
                    { label: 'Le François', value: 45 },
                    { label: 'Ste-Luce', value: 30 },
                    { label: 'Ajoupa', value: 25 },
                  ].map((b, i) => (
                    <div key={i} className="chart-bar-col">
                      <div className="chart-bar" style={{ height: b.value + '%' }} />
                      <span className="chart-label">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent commission */}
            <div className="section-block">
              <h2>💰 Commissions récentes</h2>
              <div className="commission-list">
                {[
                  { order: 'CMD-001', amount: 25, status: 'paid', date: '2026-07-10' },
                  { order: 'CMD-002', amount: 29.5, status: 'pending', date: '2026-07-12' },
                  { order: 'CMD-003', amount: 12.5, status: 'paid', date: '2026-07-05' },
                  { order: 'CMD-004', amount: 110, status: 'pending', date: '2026-07-20' },
                ].map((c, i) => (
                  <div key={i} className="commission-row">
                    <span>{c.order}</span>
                    <span>{c.amount}€</span>
                    <span className={`badge ${c.status === 'paid' ? 'badge-green' : 'badge-gold'}`}>{c.status === 'paid' ? 'Payée' : 'En attente'}</span>
                    <span>{c.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'members' && (
          <div className="section-block">
            <h2>Membres de la coopérative</h2>
            <div className="members-grid">
              {[
                { name: 'Jean-Marie Larcher', role: 'Producteur', commune: 'Le Morne-Rouge', since: '2025', lots: 5 },
                { name: 'Coopérative Nord Atlantique', role: 'Coopérative', commune: 'Sainte-Marie', since: '2024', lots: 25 },
                { name: 'Sophie Galbas', role: 'Acheteur B2B', commune: 'Fort-de-France', since: '2025', lots: 0 },
                { name: 'Marc Férand', role: 'Transporteur', commune: 'Ducos', since: '2025', lots: 0 },
              ].map((m, i) => (
                <div key={i} className="member-card">
                  <div className="member-avatar">{m.name.charAt(0)}</div>
                  <div className="member-info">
                    <strong>{m.name}</strong>
                    <span className="badge badge-green">{m.role}</span>
                    <p>{m.commune} · Membre depuis {m.since} · {m.lots} lots</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'lots' && (
          <div className="section-block">
            <h2>Lots en attente de validation</h2>
            <div className="validation-list">
              {[
                { product: 'Avocat Haas', producer: 'Coopérative Nord', qty: '300kg', price: '3.80€/kg', commune: 'Le François' },
                { product: 'Patate douce', producer: 'EARL Larcher', qty: '500kg', price: '1.80€/kg', commune: 'Ajoupa-Bouillon' },
              ].map((l, i) => (
                <div key={i} className="validation-item">
                  <div className="validation-info">
                    <strong>{l.product}</strong>
                    <p>{l.producer} · {l.qty} · {l.price} · {l.commune}</p>
                  </div>
                  <div className="validation-actions">
                    <button className="btn btn-sm btn-primary"><CheckCircle size={14} /> Approuver</button>
                    <button className="btn btn-sm btn-outline" style={{ color: '#C62828', borderColor: '#C62828' }}><XCircle size={14} /> Rejeter</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'export' && (
          <div className="section-block">
            <h2>Exporter les données</h2>
            <div className="export-grid">
              {[
                { label: 'Commandes', desc: 'Toutes les commandes avec statuts, montants et commissions' },
                { label: 'Membres', desc: 'Liste des membres avec rôles, communes et statistiques' },
                { label: 'Lots', desc: 'Tous les lots avec producteurs, qualités, prix et statuts' },
                { label: 'Logistique', desc: 'Tournées, collectes et livraisons avec transporteurs' },
                { label: 'Commissions', desc: 'Commissions avec statuts et reversements' },
                { label: 'Paiements', desc: 'Transactions Stripe avec montants et statuts' },
              ].map((exp, i) => (
                <div key={i} className="export-card">
                  <div className="export-content">
                    <h4>{exp.label}</h4>
                    <p>{exp.desc}</p>
                  </div>
                  <button className="btn btn-outline"><Download size={16} /> CSV</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
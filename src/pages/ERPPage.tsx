import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart3, Users, TrendingUp, DollarSign, ArrowRight, Plus, X,
  Download, MessageCircle, FileText, CheckCircle, Clock, AlertCircle,
  ChevronDown, Trash2, Edit3, Calendar, Target, Activity, PieChart
} from 'lucide-react'

/* ===== Types ===== */
interface CRMPipeline {
  id: string
  name: string
  type: 'prospect' | 'cooperative' | 'institution' | 'transporteur' | 'acheteur'
  status: 'prospect' | 'contacté' | 'en négociation' | 'client' | 'partenaire actif'
  email: string
  phone: string
  revenue: number       // MRR contribution
  notes: string
  nextAction: string
  nextActionDate: string
  created_at: string
}

interface CRMTask {
  id: string
  title: string
  type: 'follow-up' | 'relance' | 'réunion' | 'facture' | 'autre'
  status: 'à faire' | 'en cours' | 'fait'
  contactId: string
  dueDate: string
  notes: string
  created_at: string
}

interface CRMEmail {
  id: string
  template: 'partenariat' | 'relance' | 'facture' | 'onboarding' | 'personnalisé'
  to: string
  subject: string
  body: string
  sentAt: string
  created_at: string
}

const LS_PIPELINE = 'kopeagri_erp_pipeline'
const LS_TASKS = 'kopeagri_erp_tasks'
const LS_EMAILS = 'kopeagri_erp_emails'

const PIPELINE_STAGES: CRMPipeline['status'][] = ['prospect', 'contacté', 'en négociation', 'client', 'partenaire actif']

const STAGE_CFG: Record<CRMPipeline['status'], { label: string; color: string; emoji: string; bg: string }> = {
  prospect: { label: 'Prospect', color: '#9E9E9E', emoji: '🔍', bg: '#F5F5F5' },
  contacté: { label: 'Contacté', color: '#2196F3', emoji: '📞', bg: '#E1F5FE' },
  'en négociation': { label: 'En négociation', color: '#FF9800', emoji: '🤝', bg: '#FFF3E0' },
  client: { label: 'Client', color: '#4CAF50', emoji: '✅', bg: '#E8F5E9' },
  'partenaire actif': { label: 'Partenaire actif', color: '#1B5E20', emoji: '🤝', bg: '#C8E6C9' },
}

const TASK_TYPE_CFG: Record<CRMTask['type'], { label: string; emoji: string }> = {
  'follow-up': { label: 'Follow-up', emoji: '🔄' },
  relance: { label: 'Relance', emoji: '🔔' },
  réunion: { label: 'Réunion', emoji: '📅' },
  facture: { label: 'Facture', emoji: '🧾' },
  autre: { label: 'Autre', emoji: '📋' },
}

const EMAIL_TEMPLATES: Record<CRMEmail['template'], { subject: string; body: string }> = {
  partenariat: {
    subject: 'Proposition de partenariat — KopéAgri Caraïbes',
    body: 'Bonjour,\n\nNous souhaitons vous proposer un partenariat avec KopéAgri Caraïbes, la plateforme agricole de Martinique.\n\nNotre mission : connecter producteurs, transporteurs et acheteurs pour une agriculture locale plus forte.\n\nSeriez-vous disponible pour un échange ?\n\nCordialement,\nL\'équipe KopéAgri',
  },
  relance: {
    subject: 'Suite à notre échange — KopéAgri Caraïbes',
    body: 'Bonjour,\n\nSuite à notre échange récent, je souhaitais savoir si vous aviez pu avancer sur notre proposition.\n\nN\'hésitez pas à me contacter pour toute question.\n\nCordialement,\nL\'équipe KopéAgri',
  },
  facture: {
    subject: 'Facture KopéAgri —',
    body: 'Bonjour,\n\nVeuillez trouver ci-joint la facture correspondant à vos services.\n\nMerci de traiter cette facture dans les délais indiqués.\n\nCordialement,\nL\'équipe KopéAgri',
  },
  onboarding: {
    subject: 'Bienvenue sur KopéAgri Caraïbes !',
    body: 'Bonjour,\n\nBienvenue sur KopéAgri ! Nous sommes ravis de vous compter parmi nos partenaires.\n\nVoici les premières étapes pour bien démarrer :\n1. Complétez votre profil\n2. Ajoutez vos premiers lots\n3. Explorez la marketplace\n\nN\'hésitez pas à nous contacter pour toute question.\n\nL\'équipe KopéAgri',
  },
  personnalisé: { subject: '', body: '' },
}

/* ===== CRUD ===== */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getStore<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : [] } catch { return [] }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

/* ===== CSV ===== */
function exportCSV(data: Record<string, string | number>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

/* ===== FEC Export ===== */
function exportFEC(pipeline: CRMPipeline[]): void {
  const headers = ['Journal', 'Date', 'Compte', 'Pièce', 'Libellé', 'Débit', 'Crédit']
  const rows: string[][] = []
  pipeline.filter(p => p.revenue > 0).forEach(p => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    rows.push(['VT', date, '411000', `FAC-${p.id.slice(-6)}`, p.name, (p.revenue * 12).toFixed(2), '0.00'])
    rows.push(['VT', date, '706000', `FAC-${p.id.slice(-6)}`, p.name, '0.00', (p.revenue * 12 * 0.9217).toFixed(2)])
    rows.push(['VT', date, '445710', `FAC-${p.id.slice(-6)}`, `TVA ${p.name}`, '0.00', (p.revenue * 12 * 0.085 / 1.085).toFixed(2)])
  })
  const csv = [headers.join('|'), ...rows.map(r => r.join('|'))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `FEC_KopeAgri_${new Date().getFullYear()}.txt`; a.click()
  URL.revokeObjectURL(url)
}

/* ===== Component ===== */
const ERPPage: React.FC = () => {
  const [pipeline, setPipeline] = useState<CRMPipeline[]>([])
  const [tasks, setTasks] = useState<CRMTask[]>([])
  const [emails, setEmails] = useState<CRMEmail[]>([])
  const [tab, setTab] = useState<'kanban' | 'revenue' | 'tasks' | 'emails'>('kanban')
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [showAddPipeline, setShowAddPipeline] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  // Pipeline form
  const [pName, setPName] = useState('')
  const [pType, setPType] = useState<CRMPipeline['type']>('prospect')
  const [pStatus, setPStatus] = useState<CRMPipeline['status']>('prospect')
  const [pEmail, setPEmail] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pRevenue, setPRevenue] = useState(0)
  const [pNotes, setPNotes] = useState('')
  const [pNextAction, setPNextAction] = useState('')
  const [pNextDate, setPNextDate] = useState('')

  // Task form
  const [tTitle, setTTitle] = useState('')
  const [tType, setTType] = useState<CRMTask['type']>('follow-up')
  const [tContact, setTContact] = useState('')
  const [tDue, setTDue] = useState('')

  // Email form
  const [eTemplate, setETemplate] = useState<CRMEmail['template']>('partenariat')
  const [eTo, setETo] = useState('')
  const [eSubject, setESubject] = useState('')
  const [eBody, setEBody] = useState('')

  const load = () => {
    setPipeline(getStore(LS_PIPELINE))
    setTasks(getStore(LS_TASKS))
    setEmails(getStore(LS_EMAILS))
  }
  useEffect(load, [])

  // Metrics
  const metrics = useMemo(() => {
    const clients = pipeline.filter(p => p.status === 'client' || p.status === 'partenaire actif')
    const mrr = clients.reduce((s, p) => s + p.revenue, 0)
    const arr = mrr * 12
    const totalPipeline = pipeline.filter(p => p.status === 'en négociation').reduce((s, p) => s + p.revenue, 0)
    const conversionRate = pipeline.length > 0 ? (clients.length / pipeline.length * 100) : 0
    const ltv = clients.length > 0 ? arr / clients.length : 0
    const tasksTodo = tasks.filter(t => t.status === 'à faire').length
    const tasksOverdue = tasks.filter(t => t.status !== 'fait' && t.dueDate && new Date(t.dueDate) < new Date()).length
    return { mrr, arr, totalPipeline, conversionRate, ltv, clientsCount: clients.length, pipelineCount: pipeline.length, tasksTodo, tasksOverdue }
  }, [pipeline, tasks])

  // Pipeline by stage
  const pipelineByStage = useMemo(() => {
    const map: Record<string, CRMPipeline[]> = {}
    PIPELINE_STAGES.forEach(s => map[s] = [])
    pipeline.forEach(p => { if (map[p.status]) map[p.status].push(p) })
    return map
  }, [pipeline])

  const resetPipelineForm = () => {
    setPName(''); setPType('prospect'); setPStatus('prospect'); setPEmail(''); setPPhone('')
    setPRevenue(0); setPNotes(''); setPNextAction(''); setPNextDate(''); setShowAddPipeline(false)
  }

  const handleAddPipeline = (e: React.FormEvent) => {
    e.preventDefault()
    const all = getStore<CRMPipeline>(LS_PIPELINE)
    all.push({
      id: generateId(), name: pName, type: pType, status: pStatus,
      email: pEmail, phone: pPhone, revenue: pRevenue, notes: pNotes,
      nextAction: pNextAction, nextActionDate: pNextDate, created_at: new Date().toISOString(),
    })
    setStore(LS_PIPELINE, all); resetPipelineForm(); load()
  }

  const movePipeline = (id: string, newStatus: CRMPipeline['status']) => {
    const all = getStore<CRMPipeline>(LS_PIPELINE).map(p => p.id === id ? { ...p, status: newStatus } : p)
    setStore(LS_PIPELINE, all); load()
  }

  const deletePipeline = (id: string) => {
    if (confirm('Supprimer ce contact ?')) {
      setStore(LS_PIPELINE, getStore<CRMPipeline>(LS_PIPELINE).filter(p => p.id !== id)); load()
    }
  }

  const resetTaskForm = () => {
    setTTitle(''); setTType('follow-up'); setTContact(''); setTDue(''); setShowAddTask(false)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const all = getStore<CRMTask>(LS_TASKS)
    all.push({
      id: generateId(), title: tTitle, type: tType, status: 'à faire',
      contactId: tContact, dueDate: tDue, notes: '', created_at: new Date().toISOString(),
    })
    setStore(LS_TASKS, all); resetTaskForm(); load()
  }

  const toggleTaskStatus = (id: string) => {
    const all = getStore<CRMTask>(LS_TASKS).map(t =>
      t.id === id ? { ...t, status: t.status === 'fait' ? 'à faire' : 'fait' } : t
    )
    setStore(LS_TASKS, all); load()
  }

  const deleteTask = (id: string) => {
    setStore(LS_TASKS, getStore<CRMTask>(LS_TASKS).filter(t => t.id !== id)); load()
  }

  const handleTemplateChange = (template: CRMEmail['template']) => {
    setETemplate(template)
    const t = EMAIL_TEMPLATES[template]
    setESubject(t.subject); setEBody(t.body)
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const all = getStore<CRMEmail>(LS_EMAILS)
    all.push({
      id: generateId(), template: eTemplate, to: eTo, subject: eSubject,
      body: eBody, sentAt: new Date().toISOString(), created_at: new Date().toISOString(),
    })
    setStore(LS_EMAILS, all)
    // Open mailto
    const mailto = `mailto:${eTo}?subject=${encodeURIComponent(eSubject)}&body=${encodeURIComponent(eBody)}`
    window.open(mailto, '_blank')
    setShowEmail(false); load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><BarChart3 size={28} /> ERP / CRM</h1>
          <p className="page-subtitle">Gérez votre pipeline commercial, vos revenus et vos tâches</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportFEC(pipeline)}>
            <FileText size={16} /> Export FEC
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(pipeline.map(p => ({
            Nom: p.name, Type: p.type, Statut: p.status, Email: p.email, Téléphone: p.phone, 'MRR (€)': p.revenue,
          })), 'erp_pipeline_kopeagri.csv')}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>💰</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.mrr.toFixed(0)}€</span>
            <span className="stat-label">MRR</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>📈</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.arr.toFixed(0)}€</span>
            <span className="stat-label">ARR</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-100)', color: 'var(--orange)' }}>🎯</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.conversionRate.toFixed(1)}%</span>
            <span className="stat-label">Taux de conversion</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9', color: 'var(--green-700)' }}>👤</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.clientsCount}</span>
            <span className="stat-label">Clients actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFEBEE', color: 'var(--red)' }}>⏰</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.tasksOverdue}</span>
            <span className="stat-label">Tâches en retard</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'kanban', label: 'Pipeline Kanban', emoji: '📋' },
          { key: 'revenue', label: 'Revenus', emoji: '💰' },
          { key: 'tasks', label: 'Tâches', emoji: '✅' },
          { key: 'emails', label: 'Emails', emoji: '📧' },
        ].map(t => (
          <button key={t.key} className={`filter-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {tab === 'kanban' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddPipeline(true)}>
              <Plus size={16} /> Ajouter un contact
            </button>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
            {PIPELINE_STAGES.map(stage => (
              <div key={stage} style={{ minWidth: 260, flex: 1 }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  background: STAGE_CFG[stage].bg, fontWeight: 700, fontSize: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{STAGE_CFG[stage].emoji} {STAGE_CFG[stage].label}</span>
                  <span style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>
                    {pipelineByStage[stage]?.length || 0}
                  </span>
                </div>
                <div style={{
                  background: 'var(--gray-50)', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                  padding: 12, minHeight: 200,
                }}>
                  {(pipelineByStage[stage] || []).map(p => (
                    <div key={p.id} className="section-block" style={{ padding: 14, marginBottom: 10, cursor: 'grab' }}
                      draggable
                      onDragStart={() => setDragItem(p.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => { if (dragItem) movePipeline(dragItem, stage); setDragItem(null) }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <strong style={{ fontSize: 14 }}>{p.name}</strong>
                        <button onClick={() => deletePipeline(p.id)} style={{ background: 'none', color: 'var(--gray-400)', minHeight: 28, minWidth: 28, display: 'flex', alignItems: 'center' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>
                        {p.email && <span>{p.email}</span>}
                        {p.phone && <span> • {p.phone}</span>}
                      </div>
                      {p.revenue > 0 && (
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-700)', marginBottom: 4 }}>
                          {p.revenue}€/mois
                        </div>
                      )}
                      {p.nextAction && (
                        <div style={{ fontSize: 12, color: 'var(--gray-600)', fontStyle: 'italic' }}>
                          → {p.nextAction} {p.nextActionDate && `(${new Date(p.nextActionDate).toLocaleDateString('fr-FR')})`}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        {PIPELINE_STAGES.filter(s => s !== stage).map(s => (
                          <button key={s} onClick={() => movePipeline(p.id, s)} title={`→ ${STAGE_CFG[s].label}`}
                            style={{
                              background: STAGE_CFG[s].bg, border: 'none', borderRadius: 6, padding: '4px 8px',
                              fontSize: 11, cursor: 'pointer', minHeight: 28,
                            }}>
                            {STAGE_CFG[s].emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue */}
      {tab === 'revenue' && (
        <div className="section-block">
          <h2 style={{ marginBottom: 20 }}>💰 Suivi des revenus</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 20, background: 'var(--green-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>MRR</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-900)' }}>{metrics.mrr.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: 'var(--blue-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>ARR</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-800)' }}>{metrics.arr.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: 'var(--gold-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Pipeline en négociation</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--orange)' }}>{metrics.totalPipeline.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: '#E8F5E9', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>LTV moyenne</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-700)' }}>{metrics.ltv.toFixed(0)}€</div>
            </div>
          </div>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Revenus par client</h3>
          {pipeline.filter(p => p.revenue > 0).length === 0 ? (
            <p style={{ color: 'var(--gray-500)' }}>Aucun revenu enregistré. Ajoutez des contacts avec un MRR.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ textAlign: 'left', padding: 10 }}>Client</th>
                    <th style={{ padding: 10 }}>Statut</th>
                    <th style={{ padding: 10 }}>MRR</th>
                    <th style={{ padding: 10 }}>ARR</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.filter(p => p.revenue > 0).map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: 10 }}>{p.name}</td>
                      <td style={{ padding: 10, textAlign: 'center' }}>
                        <span className={`badge ${p.status === 'client' || p.status === 'partenaire actif' ? 'badge-green' : 'badge-gold'}`}>
                          {STAGE_CFG[p.status].emoji} {STAGE_CFG[p.status].label}
                        </span>
                      </td>
                      <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{p.revenue}€</td>
                      <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{(p.revenue * 12).toFixed(0)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      {tab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTask(true)}>
              <Plus size={16} /> Nouvelle tâche
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="section-block" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--gray-500)' }}>Aucune tâche. Créez votre première tâche !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(t => {
                const isOverdue = t.status !== 'fait' && t.dueDate && new Date(t.dueDate) < new Date()
                return (
                  <div key={t.id} className="section-block" style={{
                    padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                    borderLeft: isOverdue ? '4px solid var(--red)' : undefined,
                    opacity: t.status === 'fait' ? 0.6 : 1,
                  }}>
                    <button onClick={() => toggleTaskStatus(t.id)} style={{
                      width: 28, height: 28, borderRadius: 8, border: '2px solid',
                      borderColor: t.status === 'fait' ? 'var(--green-700)' : 'var(--gray-300)',
                      background: t.status === 'fait' ? 'var(--green-700)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: 'white', cursor: 'pointer',
                    }}>
                      {t.status === 'fait' && <CheckCircle size={16} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, textDecoration: t.status === 'fait' ? 'line-through' : 'none' }}>
                          {TASK_TYPE_CFG[t.type].emoji} {t.title}
                        </span>
                      </div>
                      {t.dueDate && (
                        <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--gray-500)' }}>
                          📅 {new Date(t.dueDate).toLocaleDateString('fr-FR')} {isOverdue && '(en retard)'}
                        </span>
                      )}
                    </div>
                    <button onClick={() => deleteTask(t.id)} style={{ background: 'none', color: 'var(--gray-400)', minHeight: 40, minWidth: 40, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Emails */}
      {tab === 'emails' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { handleTemplateChange('partenariat'); setShowEmail(true) }}>
              <Plus size={16} /> Nouvel email
            </button>
          </div>
          {emails.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>📧 Emails envoyés</h3>
              {emails.map(e => (
                <div key={e.id} className="section-block" style={{ padding: 16, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{e.subject || '(Sans objet)'}</strong>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(e.sentAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>À : {e.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Pipeline Modal */}
      {showAddPipeline && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Nouveau contact pipeline</h2>
              <button onClick={resetPipelineForm} style={{ background: 'none', color: 'var(--gray-500)', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPipeline} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-input" required value={pName} onChange={e => setPName(e.target.value)} placeholder="Nom du contact" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-input" value={pType} onChange={e => setPType(e.target.value as CRMPipeline['type'])}>
                    {['prospect', 'cooperative', 'institution', 'transporteur', 'acheteur'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select className="form-input" value={pStatus} onChange={e => setPStatus(e.target.value as CRMPipeline['status'])}>
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{STAGE_CFG[s].emoji} {STAGE_CFG[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-input" type="tel" value={pPhone} onChange={e => setPPhone(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>MRR (€/mois)</label>
                <input className="form-input" type="number" min={0} value={pRevenue} onChange={e => setPRevenue(Number(e.target.value))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prochaine action</label>
                  <input className="form-input" value={pNextAction} onChange={e => setPNextAction(e.target.value)} placeholder="Relance, réunion..." />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input className="form-input" type="date" value={pNextDate} onChange={e => setPNextDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={3} value={pNotes} onChange={e => setPNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={resetPipelineForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Nouvelle tâche</h2>
              <button onClick={resetTaskForm} style={{ background: 'none', color: 'var(--gray-500)', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Titre *</label>
                <input className="form-input" required value={tTitle} onChange={e => setTTitle(e.target.value)} placeholder="Relance client X..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-input" value={tType} onChange={e => setTType(e.target.value as CRMTask['type'])}>
                    {Object.entries(TASK_TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Échéance</label>
                  <input className="form-input" type="date" value={tDue} onChange={e => setTDue(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Contact associé</label>
                <select className="form-input" value={tContact} onChange={e => setTContact(e.target.value)}>
                  <option value="">— Aucun —</option>
                  {pipeline.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={resetTaskForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>📧 Envoyer un email</h2>
              <button onClick={() => setShowEmail(false)} style={{ background: 'none', color: 'var(--gray-500)', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Template</label>
                <select className="form-input" value={eTemplate} onChange={e => handleTemplateChange(e.target.value as CRMEmail['template'])}>
                  {Object.entries(EMAIL_TEMPLATES).map(([k]) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Destinataire *</label>
                <input className="form-input" type="email" required value={eTo} onChange={e => setETo(e.target.value)} placeholder="email@exemple.fr" />
              </div>
              <div className="form-group">
                <label>Objet</label>
                <input className="form-input" value={eSubject} onChange={e => setESubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-input" rows={8} value={eBody} onChange={e => setEBody(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEmail(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><MessageCircle size={16} /> Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ERPPage

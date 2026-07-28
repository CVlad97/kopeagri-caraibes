import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart3, Users, TrendingUp, DollarSign, ArrowRight, Plus, X,
  Download, MessageCircle, FileText, CheckCircle, Clock, AlertCircle,
  ChevronDown, Trash2, Edit3, Calendar, Target, Activity, PieChart,
  Filter, Zap, RefreshCw
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
  lost?: boolean        // for churn calculation
}

interface CRMTask {
  id: string
  title: string
  type: 'follow-up' | 'relance' | 'réunion' | 'facture' | 'appel' | 'autre'
  status: 'à faire' | 'en cours' | 'fait'
  assignee: string
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
  appel: { label: 'Appel', emoji: '📞' },
  autre: { label: 'Autre', emoji: '📋' },
}

const EMAIL_TEMPLATES: Record<CRMEmail['template'], { subject: string; body: string }> = {
  partenariat: {
    subject: 'Proposition de partenariat — KopéAgri Caraïbes',
    body: 'Bonjour,\n\nNous souhaitons vous proposer un partenariat avec KopéAgri Caraïbes, la plateforme agricole de Martinique.\n\nNotre mission : connecter producteurs, transporteurs et acheteurs pour une agriculture locale plus forte.\n\nSeriez-vous disponible pour un échange ?\n\nCordialement,\nL\'équipe KopéAgri',
  },
  relance: {
    subject: 'Relance devis — KopéAgri Caraïbes',
    body: 'Bonjour,\n\nSuite à notre échange récent, je souhaitais savoir si vous aviez pu avancer sur notre proposition.\n\nN\'hésitez pas à me contacter pour toute question.\n\nCordialement,\nL\'équipe KopéAgri',
  },
  facture: {
    subject: 'Facture impayée — KopéAgri Caraïbes',
    body: 'Bonjour,\n\nVeuillez trouver ci-joint la facture correspondant à vos services.\n\nMerci de traiter cette facture dans les délais indiqués.\n\nCordialement,\nL\'équipe KopéAgri',
  },
  onboarding: {
    subject: 'Bienvenue nouveau partenaire — KopéAgri Caraïbes !',
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

/* ===== FEC Export (Full DGFIP format with all 18 fields) ===== */
function exportFEC(pipeline: CRMPipeline[]): void {
  const headers = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib',
    'CompAuxNum', 'CompAuxLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
    'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'
  ]
  const rows: string[][] = []
  let ecritureNum = 1
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const validDate = date

  pipeline.filter(p => p.revenue > 0).forEach(p => {
    const pieceRef = `FAC-${p.id.slice(-6).toUpperCase()}`
    const montantAnnuel = p.revenue * 12
    const montantHT = montantAnnuel / 1.085
    const montantTVA = montantAnnuel - montantHT

    // Débit: Client (411000)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '411000', 'Clients',
      p.id.slice(-6), p.name, pieceRef, date, `Facture ${p.name}`,
      montantAnnuel.toFixed(2), '0.00', '', '', validDate, '', ''
    ])
    // Crédit: Ventes (706000)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '706000', 'Prestations de services',
      '', '', pieceRef, date, `Facture ${p.name}`,
      '0.00', montantHT.toFixed(2), '', '', validDate, '', ''
    ])
    // Crédit: TVA collectée (445710)
    rows.push([
      'VT', 'Ventes', String(ecritureNum), date, '445710', 'TVA collectée',
      '', '', pieceRef, date, `TVA ${p.name}`,
      '0.00', montantTVA.toFixed(2), '', '', validDate, '', ''
    ])
    ecritureNum++
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

  // Task filters
  const [taskFilterType, setTaskFilterType] = useState<string>('all')
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all')

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
  const [tAssignee, setTAssignee] = useState('')

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
    const prospects = pipeline.filter(p => p.status === 'prospect')
    const mrr = clients.reduce((s, p) => s + p.revenue, 0)
    const arr = mrr * 12
    const totalPipeline = pipeline.filter(p => p.status === 'en négociation').reduce((s, p) => s + p.revenue, 0)
    const conversionRate = pipeline.length > 0 ? (clients.length / pipeline.length * 100) : 0
    const ltv = clients.length > 0 ? arr / clients.length : 0

    // CAC = total marketing spend / new clients (simplified: use revenue of prospects as acquisition cost proxy)
    const totalAcquisitionCost = prospects.reduce((s, p) => s + Math.max(p.revenue * 3, 100), 0)
    const cac = clients.length > 0 ? totalAcquisitionCost / clients.length : 0

    // Churn rate: lost clients / total clients (ever)
    const lostClients = pipeline.filter(p => p.lost).length
    const totalEverClients = clients.length + lostClients
    const churnRate = totalEverClients > 0 ? (lostClients / totalEverClients * 100) : 0

    // Commissions this month (15% of active MRR)
    const commissions = mrr * 0.15

    // Partners by status
    const partnersByStatus: Record<string, number> = {}
    PIPELINE_STAGES.forEach(s => partnersByStatus[s] = pipeline.filter(p => p.status === s).length)

    const tasksTodo = tasks.filter(t => t.status === 'à faire').length
    const tasksOverdue = tasks.filter(t => t.status !== 'fait' && t.dueDate && new Date(t.dueDate) < new Date()).length
    return {
      mrr, arr, totalPipeline, conversionRate, ltv, cac, churnRate, commissions,
      clientsCount: clients.length, pipelineCount: pipeline.length, tasksTodo, tasksOverdue,
      partnersByStatus,
    }
  }, [pipeline, tasks])

  // Pipeline by stage
  const pipelineByStage = useMemo(() => {
    const map: Record<string, CRMPipeline[]> = {}
    PIPELINE_STAGES.forEach(s => map[s] = [])
    pipeline.forEach(p => { if (map[p.status]) map[p.status].push(p) })
    return map
  }, [pipeline])

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilterType !== 'all' && t.type !== taskFilterType) return false
      if (taskFilterStatus !== 'all' && t.status !== taskFilterStatus) return false
      return true
    })
  }, [tasks, taskFilterType, taskFilterStatus])

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
    setTTitle(''); setTType('follow-up'); setTContact(''); setTDue(''); setTAssignee(''); setShowAddTask(false)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const all = getStore<CRMTask>(LS_TASKS)
    all.push({
      id: generateId(), title: tTitle, type: tType, status: 'à faire',
      assignee: tAssignee, contactId: tContact, dueDate: tDue, notes: '', created_at: new Date().toISOString(),
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

  // Relance automatique: creates email template + task
  const handleRelanceAuto = (contact: CRMPipeline) => {
    // Create task
    const allTasks = getStore<CRMTask>(LS_TASKS)
    allTasks.push({
      id: generateId(), title: `Relance automatique: ${contact.name}`, type: 'relance', status: 'à faire',
      assignee: '', contactId: contact.id, dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      notes: '', created_at: new Date().toISOString(),
    })
    setStore(LS_TASKS, allTasks)

    // Open email template
    setETemplate('relance')
    setETo(contact.email)
    setESubject(EMAIL_TEMPLATES.relance.subject)
    setEBody(EMAIL_TEMPLATES.relance.body)
    setShowEmail(true)
    load()
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
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: '#7B1FA2' }}>💵</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.commissions.toFixed(0)}€</span>
            <span className="stat-label">Commissions (mois)</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>📉</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.churnRate.toFixed(1)}%</span>
            <span className="stat-label">Churn rate</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>🧲</div>
          <div className="stat-info">
            <span className="stat-num">{metrics.cac.toFixed(0)}€</span>
            <span className="stat-label">CAC</span>
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
              <div key={stage} style={{ minWidth: 280, flex: 1 }}>
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
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {PIPELINE_STAGES.filter(s => s !== stage).map(s => (
                          <button key={s} onClick={() => movePipeline(p.id, s)} title={`→ ${STAGE_CFG[s].label}`}
                            style={{
                              background: STAGE_CFG[s].bg, border: 'none', borderRadius: 6, padding: '4px 8px',
                              fontSize: 11, cursor: 'pointer', minHeight: 28,
                            }}>
                            {STAGE_CFG[s].emoji}
                          </button>
                        ))}
                        {p.email && (
                          <button onClick={() => handleRelanceAuto(p)} title="Relance automatique"
                            style={{
                              background: '#FFF3E0', border: 'none', borderRadius: 6, padding: '4px 8px',
                              fontSize: 11, cursor: 'pointer', minHeight: 28, color: '#E65100', fontWeight: 600,
                            }}>
                            <Zap size={12} /> Relance
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Partners by status summary */}
          <div className="section-block" style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>📊 Partenaires par statut</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {PIPELINE_STAGES.map(s => (
                <div key={s} style={{ padding: 16, background: STAGE_CFG[s].bg, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: STAGE_CFG[s].color }}>{metrics.partnersByStatus[s]}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{STAGE_CFG[s].emoji} {STAGE_CFG[s].label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue */}
      {tab === 'revenue' && (
        <div className="section-block">
          <h2 style={{ marginBottom: 20 }}>💰 Suivi des revenus</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 20, background: 'var(--green-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>MRR (Monthly Recurring Revenue)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-900)' }}>{metrics.mrr.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: 'var(--blue-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>ARR (MRR × 12)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-800)' }}>{metrics.arr.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: 'var(--gold-100)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Pipeline en négociation</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--orange)' }}>{metrics.totalPipeline.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: '#E8F5E9', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>LTV (Lifetime Value)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-700)' }}>{metrics.ltv.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: '#E3F2FD', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>CAC (Customer Acquisition Cost)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1565C0' }}>{metrics.cac.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: '#F3E5F5', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Commissions ce mois</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7B1FA2' }}>{metrics.commissions.toFixed(0)}€</div>
            </div>
            <div style={{ padding: 20, background: '#FFF3E0', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Churn rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#E65100' }}>{metrics.churnRate.toFixed(1)}%</div>
            </div>
            <div style={{ padding: 20, background: '#E8F5E9', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Taux de conversion</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-700)' }}>{metrics.conversionRate.toFixed(1)}%</div>
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
                    <th style={{ padding: 10 }}>LTV estimée</th>
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
                      <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{(p.revenue * 12 * 3).toFixed(0)}€</td>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={16} style={{ color: 'var(--gray-500)' }} />
              <select className="form-input" style={{ width: 'auto', minHeight: 36, fontSize: 13 }} value={taskFilterType} onChange={e => setTaskFilterType(e.target.value)}>
                <option value="all">Tous les types</option>
                {Object.entries(TASK_TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
              <select className="form-input" style={{ width: 'auto', minHeight: 36, fontSize: 13 }} value={taskFilterStatus} onChange={e => setTaskFilterStatus(e.target.value)}>
                <option value="all">Tous les statuts</option>
                <option value="à faire">À faire</option>
                <option value="en cours">En cours</option>
                <option value="fait">Fait</option>
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTask(true)}>
              <Plus size={16} /> Nouvelle tâche
            </button>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="section-block" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--gray-500)' }}>Aucune tâche trouvée. Créez votre première tâche !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTasks.map(t => {
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
                        <span className={`badge ${t.status === 'fait' ? 'badge-green' : t.status === 'en cours' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                          {t.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {t.assignee && <span>👤 {t.assignee}</span>}
                        {t.dueDate && (
                          <span style={{ color: isOverdue ? 'var(--red)' : 'var(--gray-500)' }}>
                            📅 {new Date(t.dueDate).toLocaleDateString('fr-FR')} {isOverdue && '(en retard)'}
                          </span>
                        )}
                      </div>
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

          {/* Email templates quick-access */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
            {([
              { key: 'partenariat' as const, label: 'Proposition de partenariat', emoji: '🤝', desc: 'Proposer un partenariat à un prospect' },
              { key: 'relance' as const, label: 'Relance devis', emoji: '🔔', desc: 'Relancer suite à un devis envoyé' },
              { key: 'facture' as const, label: 'Facture impayée', emoji: '🧾', desc: 'Relancer pour facture impayée' },
              { key: 'onboarding' as const, label: 'Bienvenue nouveau partenaire', emoji: '🎉', desc: 'Accueillir un nouveau partenaire' },
            ]).map(t => (
              <div key={t.key} className="section-block" style={{ padding: 16, cursor: 'pointer' }}
                onClick={() => { handleTemplateChange(t.key); setShowEmail(true) }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t.desc}</div>
              </div>
            ))}
          </div>

          {emails.length > 0 && (
            <div>
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
                <label>Assigné à</label>
                <input className="form-input" value={tAssignee} onChange={e => setTAssignee(e.target.value)} placeholder="Nom de la personne" />
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
                  <option value="partenariat">🤝 Proposition de partenariat</option>
                  <option value="relance">🔔 Relance devis</option>
                  <option value="facture">🧾 Facture impayée</option>
                  <option value="onboarding">🎉 Bienvenue nouveau partenaire</option>
                  <option value="personnalisé">✏️ Personnalisé</option>
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
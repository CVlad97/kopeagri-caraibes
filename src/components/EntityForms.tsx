import React, { useState } from 'react'
import { X, Plus, Check, Edit3, Eye, EyeOff, Trash2 } from 'lucide-react'

interface CrudActionsProps<T> {
  item: T & { id: string; active: boolean }
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (item: T & { id: string }) => void
}

export function CrudActions<T>({ item, onToggle, onDelete, onEdit }: CrudActionsProps<T>) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="crud-actions">
      {onEdit && (
        <button className="btn-icon edit" onClick={() => onEdit(item)} title="Modifier">
          <Edit3 size={16} />
        </button>
      )}
      <button
        className={`btn-icon ${item.active ? 'active' : ''}`}
        onClick={() => onToggle(item.id)}
        title={item.active ? 'Désactiver' : 'Activer'}
      >
        {item.active ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      {confirmDelete ? (
        <div className="confirm-delete">
          <span className="confirm-text">Confirmer ?</span>
          <button className="btn-icon danger" onClick={() => { onDelete(item.id); setConfirmDelete(false) }} title="Confirmer la suppression">
            <Check size={16} />
          </button>
          <button className="btn-icon" onClick={() => setConfirmDelete(false)} title="Annuler">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button className="btn-icon danger" onClick={() => setConfirmDelete(true)} title="Supprimer">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

// === MODAL ===
interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// === PRODUCER FORM ===
export interface ProducerFormData {
  name: string
  contact: string
  phone: string
  commune: string
  cultures: string[]
  certifications: string[]
}

interface ProducerFormProps {
  initial?: ProducerFormData
  onSubmit: (data: ProducerFormData) => void
  onCancel: () => void
}

export const MARTINIQUE_COMMUNES = [
  'Ajoupa-Bouillon','Basse-Pointe','Bellefontaine','Case-Pilote','Ducos',
  'Fonds-Saint-Denis','Fort-de-France','Grand-Rivière','Gros-Morne',
  'La Trinité','Le Carbet','Le Diamant','Le François','Le Lamentin',
  'Le Lorrain','Le Marigot','Le Marin','Le Morne-Rouge','Le Morne-Vert',
  'Le Prêcheur','Le Robert','Le Vauclin','Les Anses-d\'Arlet','Les Trois-Îlets',
  'Macouba','Rivière-Pilote','Rivière-Salée','Saint-Esprit','Saint-Joseph',
  'Saint-Pierre','Sainte-Anne','Sainte-Luce','Sainte-Marie','Schœlcher',
]

const CULTURES = [
  'Banane Cavendish','Banane plantain','Mangue José','Mangue Amélie',
  'Ananas Victoria','Ananas Queen','Avocat Haas','Avocat Lula',
  'Patate douce','Igname','Manioc','Dasheen','Christophine',
  'Giraumon','Concombre','Tomate','Laitue','Poivron',
  'Citron vert','Orange','Pamplemousse','Fruit à pain',
  'Coco','Cacao','Vanille','Canne à sucre','Café',
]

const CERTS = ['Bio','Commerce équitable','HVE','Label Rouge','IGP','AOP']

export function ProducerForm({ initial, onSubmit, onCancel }: ProducerFormProps) {
  const [name, setName] = useState(initial?.name || '')
  const [contact, setContact] = useState(initial?.contact || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [commune, setCommune] = useState(initial?.commune || '')
  const [cultures, setCultures] = useState<string[]>(initial?.cultures || [])
  const [certifications, setCertifications] = useState<string[]>(initial?.certifications || [])

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, contact, phone, commune, cultures, certifications })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nom de l'exploitation / producteur *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="EARL Larcher" />
        </div>
        <div className="form-group">
          <label>Contact *</label>
          <input value={contact} onChange={e => setContact(e.target.value)} required className="form-input" placeholder="Jean Larcher" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Téléphone *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required className="form-input" placeholder="0696 XX XX XX" />
        </div>
        <div className="form-group">
          <label>Commune *</label>
          <select value={commune} onChange={e => setCommune(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Productions / Cultures</label>
        <div className="chip-grid">
          {CULTURES.map(c => (
            <button key={c} type="button" className={`chip ${cultures.includes(c) ? 'active' : ''}`}
              onClick={() => toggleArray(cultures, c, setCultures)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Certifications</label>
        <div className="chip-grid">
          {CERTS.map(c => (
            <button key={c} type="button" className={`chip ${certifications.includes(c) ? 'active' : ''}`}
              onClick={() => toggleArray(certifications, c, setCertifications)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary"><Plus size={16} /> Ajouter</button>
      </div>
    </form>
  )
}

// === LOGISTICS FORM ===
export interface LogisticsFormData {
  name: string
  contact: string
  phone: string
  commune: string
  services: string[]
  fleet: string
}

const LOG_SERVICES = ['Collecte producteurs','Transport frigorifique','Livraison locale','Stockage froid','Groupage','Export documentation','Transit portuaire','Distribution point relais']

export function LogisticsForm({ initial, onSubmit, onCancel }: {
  initial?: LogisticsFormData
  onSubmit: (data: LogisticsFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [contact, setContact] = useState(initial?.contact || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [commune, setCommune] = useState(initial?.commune || '')
  const [services, setServices] = useState<string[]>(initial?.services || [])
  const [fleet, setFleet] = useState(initial?.fleet || '')

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, contact, phone, commune, services, fleet })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nom du transporteur / société *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="Transports Férand" />
        </div>
        <div className="form-group">
          <label>Contact *</label>
          <input value={contact} onChange={e => setContact(e.target.value)} required className="form-input" placeholder="Marc Férand" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Téléphone *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required className="form-input" placeholder="0696 XX XX XX" />
        </div>
        <div className="form-group">
          <label>Commune *</label>
          <select value={commune} onChange={e => setCommune(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Flotte / Véhicules</label>
        <input value={fleet} onChange={e => setFleet(e.target.value)} className="form-input" placeholder="3 camions frigorifiques 3.5T, 1 camion 10T" />
      </div>
      <div className="form-group">
        <label>Services proposés</label>
        <div className="chip-grid">
          {LOG_SERVICES.map(s => (
            <button key={s} type="button" className={`chip ${services.includes(s) ? 'active' : ''}`}
              onClick={() => toggleArray(services, s, setServices)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary"><Plus size={16} /> Ajouter</button>
      </div>
    </form>
  )
}

// === DISTRIBUTOR FORM ===
export interface DistributorFormData {
  name: string
  contact: string
  phone: string
  commune: string
  type: string
}

const DIST_TYPES = [
  { value: 'grossiste', label: 'Grossiste' },
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'transitaire', label: 'Transitaire / Commissionnaire' },
  { value: 'exportateur', label: 'Exportateur' },
  { value: 'hotel_restaurant', label: 'Hôtel / Restaurant / Collectivité' },
]

export function DistributorForm({ initial, onSubmit, onCancel }: {
  initial?: DistributorFormData
  onSubmit: (data: DistributorFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [contact, setContact] = useState(initial?.contact || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [commune, setCommune] = useState(initial?.commune || '')
  const [type, setType] = useState(initial?.type || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, contact, phone, commune, type })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nom de la société *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="Hôtel Bakoua" />
        </div>
        <div className="form-group">
          <label>Contact *</label>
          <input value={contact} onChange={e => setContact(e.target.value)} required className="form-input" placeholder="Sophie Galbas" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Téléphone *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required className="form-input" placeholder="0696 XX XX XX" />
        </div>
        <div className="form-group">
          <label>Commune *</label>
          <select value={commune} onChange={e => setCommune(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Type *</label>
        <select value={type} onChange={e => setType(e.target.value)} required className="form-input">
          <option value="">Sélectionner</option>
          {DIST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary"><Plus size={16} /> Ajouter</button>
      </div>
    </form>
  )
}

// Default export wrapper for pages that use <EntityForms type="..." />
interface EntityFormsWrapperProps {
  type: 'producers' | 'logistics' | 'distributors'
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}

function EntityFormsWrapper({ type, onSubmit, onCancel }: EntityFormsWrapperProps) {
  if (type === 'producers') return <ProducerForm onSubmit={onSubmit as any} onCancel={onCancel} />
  if (type === 'logistics') return <LogisticsForm onSubmit={onSubmit as any} onCancel={onCancel} />
  return <DistributorForm onSubmit={onSubmit as any} onCancel={onCancel} />
}

export default EntityFormsWrapper
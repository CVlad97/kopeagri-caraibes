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
        <button type="submit" className="btn btn-primary">{initial ? <Edit3 size={16} /> : <Plus size={16} />} {initial ? 'Modifier' : 'Ajouter'}</button>
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
        <button type="submit" className="btn btn-primary">{initial ? <Edit3 size={16} /> : <Plus size={16} />} {initial ? 'Modifier' : 'Ajouter'}</button>
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
        <button type="submit" className="btn btn-primary">{initial ? <Edit3 size={16} /> : <Plus size={16} />} {initial ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

// === PLOT FORM ===
export interface PlotFormData {
  name: string
  farm: string
  surface: number
  soil: string
  water: boolean
  status: string
  crop: string
  commune: string
  rental: string
}

const SOIL_TYPES = ['Argilo-calcaire', 'Volcanique', 'Limoneux', 'Sablo-argileux']
const PLOT_STATUSES = [
  { value: 'available', label: 'Disponible' },
  { value: 'cultivated', label: 'Cultivée' },
  { value: 'fallow', label: 'Jachère' },
  { value: 'rented', label: 'Louée' },
]

export function PlotForm({ initial, onSubmit, onCancel }: {
  initial?: PlotFormData
  onSubmit: (data: PlotFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [farm, setFarm] = useState(initial?.farm || '')
  const [surface, setSurface] = useState(initial?.surface?.toString() || '')
  const [soil, setSoil] = useState(initial?.soil || '')
  const [water, setWater] = useState(initial?.water ?? true)
  const [status, setStatus] = useState(initial?.status || 'available')
  const [crop, setCrop] = useState(initial?.crop || '')
  const [commune, setCommune] = useState(initial?.commune || '')
  const [rental, setRental] = useState(initial?.rental || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, farm, surface: parseFloat(surface) || 0, soil, water, status, crop, commune, rental })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nom de la parcelle *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="Parcelle Nord-Est" />
        </div>
        <div className="form-group">
          <label>Exploitation *</label>
          <input value={farm} onChange={e => setFarm(e.target.value)} required className="form-input" placeholder="EARL Larcher" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Surface (ha) *</label>
          <input type="number" step="0.1" min="0" value={surface} onChange={e => setSurface(e.target.value)} required className="form-input" placeholder="2.5" />
        </div>
        <div className="form-group">
          <label>Type de sol *</label>
          <select value={soil} onChange={e => setSoil(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Statut *</label>
          <select value={status} onChange={e => setStatus(e.target.value)} required className="form-input">
            {PLOT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Commune *</label>
          <select value={commune} onChange={e => setCommune(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Culture</label>
          <input value={crop} onChange={e => setCrop(e.target.value)} className="form-input" placeholder="Banane Cavendish, Mangue José" />
        </div>
        <div className="form-group">
          <label>Accès eau</label>
          <label className="toggle-label">
            <input type="checkbox" checked={water} onChange={e => setWater(e.target.checked)} />
            <span>{water ? 'Accès eau ✓' : 'Pas d\'accès eau'}</span>
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>Conditions de location (optionnel)</label>
        <input value={rental} onChange={e => setRental(e.target.value)} className="form-input" placeholder="Location annuelle 1500€/ha" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary">{initial ? <Edit3 size={16} /> : <Plus size={16} />} {initial ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

// === RESOURCE FORM ===
export interface ResourceFormData {
  name: string
  type: string
  owner: string
  commune: string
  rate: number
  unit: string
  quantity: number
  desc: string
  available: boolean
}

const RESOURCE_TYPES = [
  { value: 'materiel', label: '🔧 Matériel agricole' },
  { value: 'chambre_froide', label: '❄️ Chambre froide' },
  { value: 'camion', label: '🚛 Camion / Camionnette' },
  { value: 'main_oeuvre', label: '👥 Main-d\'œuvre' },
  { value: 'intrant', label: '🧪 Intrants' },
  { value: 'emballage', label: '📦 Emballages' },
]

export function ResourceForm({ initial, onSubmit, onCancel }: {
  initial?: ResourceFormData
  onSubmit: (data: ResourceFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || '')
  const [owner, setOwner] = useState(initial?.owner || '')
  const [commune, setCommune] = useState(initial?.commune || '')
  const [rate, setRate] = useState(initial?.rate?.toString() || '')
  const [unit, setUnit] = useState(initial?.unit || '')
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() || '')
  const [desc, setDesc] = useState(initial?.desc || '')
  const [available, setAvailable] = useState(initial?.available ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, type, owner, commune, rate: parseFloat(rate) || 0, unit, quantity: parseInt(quantity) || 0, desc, available })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-row">
        <div className="form-group">
          <label>Nom de la ressource *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="Tracteur Massey Ferguson 285" />
        </div>
        <div className="form-group">
          <label>Type *</label>
          <select value={type} onChange={e => setType(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Propriétaire *</label>
          <input value={owner} onChange={e => setOwner(e.target.value)} required className="form-input" placeholder="Coopérative Nord" />
        </div>
        <div className="form-group">
          <label>Commune *</label>
          <select value={commune} onChange={e => setCommune(e.target.value)} required className="form-input">
            <option value="">Sélectionner</option>
            {MARTINIQUE_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Tarif (€) *</label>
          <input type="number" min="0" step="0.01" value={rate} onChange={e => setRate(e.target.value)} required className="form-input" placeholder="120" />
        </div>
        <div className="form-group">
          <label>Unité *</label>
          <input value={unit} onChange={e => setUnit(e.target.value)} required className="form-input" placeholder="jour / kg / pièce" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Quantité disponible *</label>
          <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} required className="form-input" placeholder="1" />
        </div>
        <div className="form-group">
          <label>Disponible</label>
          <label className="toggle-label">
            <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />
            <span>{available ? 'Disponible ✓' : 'Indisponible'}</span>
          </label>
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className="form-input" rows={3} placeholder="Description de la ressource..." />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary">{initial ? <Edit3 size={16} /> : <Plus size={16} />} {initial ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

// === BOOKING FORM ===
export interface BookingFormData {
  name: string
  phone: string
  dates: string
  message: string
}

export function BookingForm({ itemName, onSubmit, onCancel }: {
  itemName: string
  onSubmit: (data: BookingFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dates, setDates] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, phone, dates, message })
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <p className="form-subtitle">Réserver : <strong>{itemName}</strong></p>
      <div className="form-row">
        <div className="form-group">
          <label>Votre nom *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-input" placeholder="Jean Dupont" />
        </div>
        <div className="form-group">
          <label>Téléphone *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required className="form-input" placeholder="0696 XX XX XX" />
        </div>
      </div>
      <div className="form-group">
        <label>Dates souhaitées *</label>
        <input value={dates} onChange={e => setDates(e.target.value)} required className="form-input" placeholder="Du 10 au 15 juillet 2026" />
      </div>
      <div className="form-group">
        <label>Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} className="form-input" rows={3} placeholder="Précisez votre besoin..." />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary"><Plus size={16} /> Envoyer la réservation</button>
      </div>
    </form>
  )
}

// Default export wrapper for pages that use <EntityForms type="..." />
interface EntityFormsWrapperProps {
  type: 'producers' | 'logistics' | 'distributors' | 'plots' | 'resources'
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  initial?: Record<string, unknown>
}

function EntityFormsWrapper({ type, onSubmit, onCancel, initial }: EntityFormsWrapperProps) {
  if (type === 'producers') return <ProducerForm initial={initial as ProducerFormData | undefined} onSubmit={onSubmit as any} onCancel={onCancel} />
  if (type === 'logistics') return <LogisticsForm initial={initial as LogisticsFormData | undefined} onSubmit={onSubmit as any} onCancel={onCancel} />
  if (type === 'distributors') return <DistributorForm initial={initial as DistributorFormData | undefined} onSubmit={onSubmit as any} onCancel={onCancel} />
  if (type === 'plots') return <PlotForm initial={initial as PlotFormData | undefined} onSubmit={onSubmit as any} onCancel={onCancel} />
  return <ResourceForm initial={initial as ResourceFormData | undefined} onSubmit={onSubmit as any} onCancel={onCancel} />
}

export default EntityFormsWrapper
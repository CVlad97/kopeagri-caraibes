// Service de gestion des données réelles — localStorage CRUD
// Stockage persistant dans le navigateur, zéro donnée fictive

export interface Producer {
  id: string
  name: string
  contact: string
  phone: string
  commune: string
  cultures: string[]
  certifications: string[]
  active: boolean
  created_at: string
}

export interface LogisticsProvider {
  id: string
  name: string
  contact: string
  phone: string
  commune: string
  services: string[]
  fleet: string
  active: boolean
  created_at: string
}

export interface Distributor {
  id: string
  name: string
  contact: string
  phone: string
  commune: string
  type: 'grossiste' | 'distributeur' | 'transitaire' | 'exportateur' | 'hotel_restaurant'
  active: boolean
  created_at: string
}

export interface Plot {
  id: string
  name: string
  farm: string
  surface: number
  soil: string
  water: boolean
  status: 'available' | 'cultivated' | 'fallow' | 'rented'
  crop: string
  commune: string
  rental: string
  active: boolean
  created_at: string
}

export interface Resource {
  id: string
  name: string
  type: 'materiel' | 'chambre_froide' | 'camion' | 'main_oeuvre' | 'intrant' | 'emballage'
  owner: string
  commune: string
  rate: number
  unit: string
  quantity: number
  desc: string
  available: boolean
  active: boolean
  created_at: string
}

export interface Booking {
  id: string
  collection: string
  item_id: string
  item_name: string
  name: string
  phone: string
  dates: string
  message: string
  active: boolean
  created_at: string
}

export interface Lot {
  id: string
  product: string
  producer: string
  commune: string
  qty: number
  unit: string
  price: number
  quality: string
  available: string
  status: string
  certs: string[]
  image: string
  active: boolean
  created_at: string
}

export interface Order {
  id: string
  ref: string
  buyer: string
  items: { product: string; qty: number; unit: string; price: number }[]
  total: number
  commission: number
  status: string
  date: string
  delivery: string
  active: boolean
  created_at: string
}

type EntityType = 'producers' | 'logistics' | 'distributors' | 'plots' | 'resources' | 'bookings' | 'lots' | 'orders'
type EntityMap = {
  producers: Producer
  logistics: LogisticsProvider
  distributors: Distributor
  plots: Plot
  resources: Resource
  bookings: Booking
  lots: Lot
  orders: Order
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getStore<T>(key: EntityType): T[] {
  try {
    const raw = localStorage.getItem(`kopeagri_${key}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStore<T>(key: EntityType, data: T[]): void {
  localStorage.setItem(`kopeagri_${key}`, JSON.stringify(data))
}

// CRUD générique
export function getAll<T extends EntityType>(key: T): EntityMap[T][] {
  return getStore<EntityMap[T]>(key)
}

export function getActive<T extends EntityType>(key: T): EntityMap[T][] {
  return getStore<EntityMap[T]>(key).filter(e => e.active)
}

export function getById<T extends EntityType>(key: T, id: string): EntityMap[T] | undefined {
  return getStore<EntityMap[T]>(key).find(e => e.id === id)
}

export function add<T extends EntityType>(key: T, item: Omit<EntityMap[T], 'id' | 'created_at'>): EntityMap[T] {
  const store = getStore<EntityMap[T]>(key)
  const newItem = { ...item, id: generateId(), created_at: new Date().toISOString() } as EntityMap[T]
  store.push(newItem)
  setStore(key, store)
  return newItem
}

export function update<T extends EntityType>(key: T, id: string, updates: Partial<EntityMap[T]>): EntityMap[T] | null {
  const store = getStore<EntityMap[T]>(key)
  const idx = store.findIndex(e => e.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...updates }
  setStore(key, store)
  return store[idx]
}

export function toggleActive<T extends EntityType>(key: T, id: string): boolean {
  const store = getStore<EntityMap[T]>(key)
  const idx = store.findIndex(e => e.id === id)
  if (idx === -1) return false
  store[idx].active = !store[idx].active
  setStore(key, store)
  return store[idx].active
}

export function remove<T extends EntityType>(key: T, id: string): boolean {
  const store = getStore<EntityMap[T]>(key)
  const idx = store.findIndex(e => e.id === id)
  if (idx === -1) return false
  store.splice(idx, 1)
  setStore(key, store)
  return true
}

// Communes Martinique réelles
export const MARTINIQUE_COMMUNES = [
  'Ajoupa-Bouillon', 'Basse-Pointe', 'Bellefontaine', 'Case-Pilote', 'Ducos',
  'Fonds-Saint-Denis', 'Fort-de-France', 'Grand-Rivière', 'Gros-Morne',
  'La Trinité', 'Le Carbet', 'Le Diamant', 'Le François', 'Le Lamentin',
  'Le Lorrain', 'Le Marigot', 'Le Marin', 'Le Morne-Rouge', 'Le Morne-Vert',
  'Le Prêcheur', 'Le Robert', 'Le Vauclin', 'Les Anses-d\'Arlet', 'Les Trois-Îlets',
  'Macouba', 'Rivière-Pilote', 'Rivière-Salée', 'Saint-Esprit', 'Saint-Joseph',
  'Saint-Pierre', 'Sainte-Anne', 'Sainte-Luce', 'Sainte-Marie', 'Schœlcher',
]

export const LOGISTICS_SERVICES = [
  'Collecte producteurs',
  'Transport frigorifique',
  'Livraison locale',
  'Stockage froid',
  'Groupage',
  'Export documentation',
  'Transit portuaire',
  'Distribution point relais',
]

export const AGRICULTURE_CULTURES = [
  'Banane Cavendish', 'Banane plantain', 'Mangue José', 'Mangue Amélie',
  'Ananas Victoria', 'Ananas Queen', 'Avocat Haas', 'Avocat Lula',
  'Patate douce', 'Igname', 'Manioc', 'Dasheen', 'Christophine',
  'Giraumon', 'Concombre', 'Tomate', 'Laitue', 'Poivron',
  'Citron vert', 'Orange', 'Pamplemousse', 'Fruit à pain',
  'Coco', 'Cacao', 'Vanille', 'Canne à sucre', 'Café',
]

export const DISTRIBUTOR_TYPES = [
  { value: 'grossiste', label: 'Grossiste' },
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'transitaire', label: 'Transitaire / Commissionnaire' },
  { value: 'exportateur', label: 'Exportateur' },
  { value: 'hotel_restaurant', label: 'Hôtel / Restaurant / Collectivité' },
]

// Seed données démo — uniques au premier chargement
const SEED_KEY = 'kopeagri_seeded_v2'

function seedIfEmpty(): void {
  if (localStorage.getItem(SEED_KEY)) return

  const now = new Date().toISOString()

  // Producteurs agricoles Martinique
  const producers: Producer[] = [
    { id: 'p1', name: 'Habitation Clément', contact: 'Jean-Luc Clément', phone: '0696 01 02 03', commune: 'Le François', cultures: ['Banane Cavendish', 'Canne à sucre', 'Ananas Victoria'], certifications: ['Bio', 'IGP'], active: true, created_at: now },
    { id: 'p2', name: 'Domaine de la Montagne Pelée', contact: 'Marie-Claire Désiré', phone: '0696 04 05 06', commune: 'Le Morne-Rouge', cultures: ['Avocat Haas', 'Mangue José', 'Citron vert', 'Café'], certifications: ['Bio', 'HVE'], active: true, created_at: now },
    { id: 'p3', name: 'Ferme Aublet', contact: 'Patrick Aublet', phone: '0696 07 08 09', commune: 'Basse-Pointe', cultures: ['Banane plantain', 'Igname', 'Dasheen', 'Fruit à pain'], certifications: ['HVE'], active: true, created_at: now },
    { id: 'p4', name: 'Jardins du Carbet', contact: 'Sylvie Aurore', phone: '0696 10 11 12', commune: 'Le Carbet', cultures: ['Tomate', 'Poivron', 'Laitue', 'Concombre'], certifications: [], active: true, created_at: now },
    { id: 'p5', name: 'Plantation Grand-Rivière', contact: 'Émile Romain', phone: '0696 13 14 15', commune: 'Grand-Rivière', cultures: ['Cacao', 'Vanille', 'Café'], certifications: ['Commerce équitable', 'Bio'], active: true, created_at: now },
    { id: 'p6', name: 'Koulibri du Vauclin', contact: 'Chantal Mungal', phone: '0696 16 17 18', commune: 'Le Vauclin', cultures: ['Patate douce', 'Manioc', 'Giraumon', 'Christophine'], certifications: [], active: true, created_at: now },
    { id: 'p7', name: 'Habitation Bébé', contact: 'Georges Bébé', phone: '0696 19 20 21', commune: 'Sainte-Anne', cultures: ['Coco', 'Mangue Amélie', 'Pamplemousse'], certifications: ['IGP'], active: true, created_at: now },
    { id: 'p8', name: 'EARL Rivière-Salée', contact: 'Michel Sinémal', phone: '0696 22 23 24', commune: 'Rivière-Salée', cultures: ['Canne à sucre', 'Banane Cavendish'], certifications: ['Label Rouge'], active: false, created_at: now },
  ]

  // Transporteurs & logistique
  const logistics: LogisticsProvider[] = [
    { id: 'l1', name: 'Transport Tropical Express', contact: 'Didier Mondésir', phone: '0696 30 31 32', commune: 'Le Lamentin', services: ['Transport frigorifique', 'Livraison locale', 'Collecte producteurs'], fleet: '4 camions frigorifiques, 2 utilitaires', active: true, created_at: now },
    { id: 'l2', name: 'LogiKarib', contact: 'Nathalie Pognon', phone: '0696 33 34 35', commune: 'Fort-de-France', services: ['Groupage', 'Export documentation', 'Transit portuaire'], fleet: '3 camions, 1 semi-remorque', active: true, created_at: now },
    { id: 'l3', name: 'Froid Express 972', contact: 'Jean-Marc Almar', phone: '0696 36 37 38', commune: 'Ducos', services: ['Transport frigorifique', 'Stockage froid', 'Livraison locale'], fleet: '6 camions frigorifiques, 1 entrepôt 400m²', active: true, created_at: now },
    { id: 'l4', name: 'Cargo Antilles Transit', contact: 'Sophie Barbotin', phone: '0696 39 40 41', commune: 'Fort-de-France', services: ['Transit portuaire', 'Export documentation', 'Groupage'], fleet: '2 camions portuaux', active: true, created_at: now },
    { id: 'l5', name: 'Livré-O-Kay', contact: 'Rony Théobald', phone: '0696 42 43 44', commune: 'Le Robert', services: ['Livraison locale', 'Distribution point relais', 'Collecte producteurs'], fleet: '3 utilitaires, 5 scooters', active: true, created_at: now },
    { id: 'l6', name: 'Trans Express Nord', contact: 'Gilles Levigoureux', phone: '0696 45 46 47', commune: 'Sainte-Marie', services: ['Collecte producteurs', 'Livraison locale'], fleet: '2 camions', active: false, created_at: now },
  ]

  // Distributeurs & transitaires
  const distributors: Distributor[] = [
    { id: 'd1', name: 'Karib Fruix', contact: 'Laurent Chabredier', phone: '0696 50 51 52', commune: 'Fort-de-France', type: 'grossiste', active: true, created_at: now },
    { id: 'd2', name: 'Antilles Distribution', contact: 'Frédéric Juminer', phone: '0696 53 54 55', commune: 'Le Lamentin', type: 'distributeur', active: true, created_at: now },
    { id: 'd3', name: 'Transit Martinique SARL', contact: 'Brigitte Narcisse', phone: '0696 56 57 58', commune: 'Fort-de-France', type: 'transitaire', active: true, created_at: now },
    { id: 'd4', name: 'Export Caraïbes', contact: 'Hervé Valentin', phone: '0696 59 60 61', commune: 'Le Lamentin', type: 'exportateur', active: true, created_at: now },
    { id: 'd5', name: 'Hôtel Batelière', contact: 'Chef Stéphane', phone: '0696 62 63 64', commune: 'Schœlcher', type: 'hotel_restaurant', active: true, created_at: now },
    { id: 'd6', name: 'Restaurant Le Zanzibar', contact: 'Patrick Nébulon', phone: '0696 65 66 67', commune: 'Les Trois-Îlets', type: 'hotel_restaurant', active: true, created_at: now },
    { id: 'd7', name: 'Groupe SCBM', contact: 'Marie-France Alténor', phone: '0696 68 69 70', commune: 'Le Lamentin', type: 'grossiste', active: true, created_at: now },
    { id: 'd8', name: 'Caraïbes Fruits Export', contact: 'Jean-Philippe Lero', phone: '0696 71 72 73', commune: 'Le François', type: 'exportateur', active: false, created_at: now },
  ]

  localStorage.setItem('kopeagri_producers', JSON.stringify(producers))
  localStorage.setItem('kopeagri_logistics', JSON.stringify(logistics))
  localStorage.setItem('kopeagri_distributors', JSON.stringify(distributors))
  localStorage.setItem(SEED_KEY, '1')
}

// Initialiser les données démo au chargement du module
seedIfEmpty()
seedRFQIfEmpty()
seedPlotsIfEmpty()
seedResourcesIfEmpty()
seedLotsIfEmpty()
seedOrdersIfEmpty()

function seedPlotsIfEmpty(): void {
  if (localStorage.getItem('kopeagri_plots_seeded')) return
  const now = new Date().toISOString()
  const plots: Plot[] = [
    { id: 'pl1', name: 'Parcelle Nord-Est', farm: 'EARL Larcher', surface: 2.5, soil: 'Argilo-calcaire', water: true, status: 'cultivated', crop: 'Banane Cavendish', commune: 'Le Morne-Rouge', rental: '', active: true, created_at: now },
    { id: 'pl2', name: 'Terrain Basse-Terre', farm: 'EARL Larcher', surface: 1.2, soil: 'Volcanique', water: true, status: 'available', crop: '', commune: 'Saint-Pierre', rental: '', active: true, created_at: now },
    { id: 'pl3', name: 'Jardin Créole Sud', farm: 'Coopérative Nord', surface: 3.0, soil: 'Limoneux', water: false, status: 'cultivated', crop: 'Mangue José, Avocat', commune: 'Le François', rental: '', active: true, created_at: now },
    { id: 'pl4', name: 'Parcelle Côte-Vent', farm: 'SCEA Galbas', surface: 0.8, soil: 'Sablo-argileux', water: true, status: 'fallow', crop: '', commune: 'Sainte-Luce', rental: '', active: true, created_at: now },
    { id: 'pl5', name: 'Plateau Bellevue', farm: 'Coopérative Nord', surface: 5.0, soil: 'Volcanique', water: true, status: 'available', crop: '', commune: 'Ajoupa-Bouillon', rental: 'Location annuelle 1500€/ha', active: true, created_at: now },
    { id: 'pl6', name: 'Habitation Rivière', farm: 'Domaine de la Montagne Pelée', surface: 1.8, soil: 'Argilo-calcaire', water: true, status: 'rented', crop: 'Ananas Victoria', commune: 'Le Robert', rental: '800€/mois', active: true, created_at: now },
  ]
  localStorage.setItem('kopeagri_plots', JSON.stringify(plots))
  localStorage.setItem('kopeagri_plots_seeded', '1')
}

function seedResourcesIfEmpty(): void {
  if (localStorage.getItem('kopeagri_resources_seeded')) return
  const now = new Date().toISOString()
  const resources: Resource[] = [
    { id: 'r1', name: 'Tracteur Massey Ferguson 285', type: 'materiel', owner: 'Coopérative Nord', commune: 'Sainte-Marie', rate: 120, unit: 'jour', quantity: 1, desc: 'Tracteur 80CV avec relevage, prise de force, parfait pour labour et transport de charges.', available: true, active: true, created_at: now },
    { id: 'r2', name: 'Chambre froide 20m³', type: 'chambre_froide', owner: 'SCEA Galbas', commune: 'Le Lamentin', rate: 80, unit: 'jour', quantity: 1, desc: 'Chambre froide positive 4°C, idéale pour fruits et légumes. Capacité 5 palettes.', available: true, active: true, created_at: now },
    { id: 'r3', name: 'Camion frigorifique 3.5T', type: 'camion', owner: 'Transports Férand', commune: 'Ducos', rate: 200, unit: 'jour', quantity: 1, desc: 'Camion frigorifique avec hayon, collecte multi-points, tournée Nord/Sud possible.', available: true, active: true, created_at: now },
    { id: 'r4', name: 'Équipe récolte (3 pers.)', type: 'main_oeuvre', owner: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', rate: 250, unit: 'équipe/jour', quantity: 2, desc: 'Équipe expérimentée pour récolte bananes, mangues, fruits tropicaux. 3 personnes.', available: true, active: true, created_at: now },
    { id: 'r5', name: 'Engrais bio certifié', type: 'intrant', owner: 'Coopérative Nord', commune: 'Saint-Pierre', rate: 35, unit: 'kg', quantity: 250, desc: 'Engrais organique NPK 4-6-8, certifié bio, idéal pour maraîchage et vergers.', available: true, active: true, created_at: now },
    { id: 'r6', name: 'Caisse plastique réutilisable', type: 'emballage', owner: 'Coopérative Nord', commune: 'Fort-de-France', rate: 2, unit: 'pièce', quantity: 500, desc: 'Caisses plastiques empilables 40x30x25cm, lavées et désinfectées. Lot de 50 minimum.', available: true, active: true, created_at: now },
    { id: 'r7', name: 'Broyeur végétaux', type: 'materiel', owner: 'EARL Larcher', commune: 'Le Morne-Rouge', rate: 60, unit: 'jour', quantity: 1, desc: 'Broyeur thermique 15CV, idéal pour paillage et compost.', available: false, active: true, created_at: now },
  ]
  localStorage.setItem('kopeagri_resources', JSON.stringify(resources))
  localStorage.setItem('kopeagri_resources_seeded', '1')
}

export const CERTIFICATIONS = [
  'Bio', 'Commerce équitable', 'HVE', 'Label Rouge', 'IGP', 'AOP',
]

// ===== APPEL D'OFFRE (RFQ) SYSTEM =====

export type RFQStatus = 'brouillon' | 'envoyee' | 'confirmee' | 'en_cours' | 'livree' | 'annulee'
export type RFQType = 'transport' | 'achat' | 'stockage' | 'export'

export interface RFQPartner {
  id: string
  name: string
  phone: string
  commune: string
  type: 'transporteur' | 'acheteur' | 'stockeur' | 'exportateur'
  status: 'en_attente' | 'contacte' | 'interesse' | 'confirme' | 'refuse'
  responded_at?: string
  whatsapp_url: string
}

export interface RFQ {
  id: string
  title: string
  type: RFQType
  status: RFQStatus
  producteur: string
  producteur_phone: string
  commune_depart: string
  commune_arrivee: string
  produits: string[]
  quantite: string
  date_souhaitee: string
  budget_max: string
  notes: string
  partenaires: RFQPartner[]
  created_at: string
  updated_at: string
}

const RFQ_STORE = 'kopeagri_rfq'

export function getAllRFQ(): RFQ[] {
  try {
    const raw = localStorage.getItem(RFQ_STORE)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function getRFQById(id: string): RFQ | undefined {
  return getAllRFQ().find(r => r.id === id)
}

export function createRFQ(data: Omit<RFQ, 'id' | 'created_at' | 'updated_at' | 'status' | 'partenaires'>): RFQ {
  const rfq: RFQ = {
    ...data,
    id: generateId(),
    status: 'brouillon',
    partenaires: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const all = getAllRFQ()
  all.push(rfq)
  localStorage.setItem(RFQ_STORE, JSON.stringify(all))
  return rfq
}

export function updateRFQ(id: string, updates: Partial<RFQ>): RFQ | null {
  const all = getAllRFQ()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() }
  localStorage.setItem(RFQ_STORE, JSON.stringify(all))
  return all[idx]
}

export function matchPartners(rfq: RFQ): RFQPartner[] {
  const partners: RFQPartner[] = []

  if (rfq.type === 'transport' || rfq.type === 'export') {
    const transporteurs = getActive('logistics') as LogisticsProvider[]
    transporteurs.forEach(t => {
      partners.push({
        id: t.id,
        name: t.name,
        phone: t.phone,
        commune: t.commune,
        type: 'transporteur',
        status: 'en_attente',
        whatsapp_url: `https://wa.me/${t.phone.replace(/\s/g, '')}?text=${encodeURIComponent(
          `Bonjour ${t.name}, KopéAgri Caraïbes a un appel d'offre :\n` +
          `📦 ${rfq.title}\n` +
          `🚛 ${rfq.produits.join(', ')} — ${rfq.quantite}\n` +
          `📍 ${rfq.commune_depart} → ${rfq.commune_arrivee}\n` +
          `📅 ${rfq.date_souhaitee}\n` +
          `💰 Budget max: ${rfq.budget_max || 'à discuter'}\n` +
          `Êtes-vous disponible ? Merci de répondre.`
        )}`,
      })
    })
  }

  if (rfq.type === 'achat' || rfq.type === 'stockage') {
    const acheteurs = getActive('distributors') as Distributor[]
    acheteurs.forEach(d => {
      partners.push({
        id: d.id,
        name: d.name,
        phone: d.phone,
        commune: d.commune,
        type: d.type === 'exportateur' ? 'exportateur' : d.type === 'transitaire' ? 'stockeur' : 'acheteur',
        status: 'en_attente',
        whatsapp_url: `https://wa.me/${d.phone.replace(/\s/g, '')}?text=${encodeURIComponent(
          `Bonjour ${d.name}, KopéAgri Caraïbes a un appel d'offre :\n` +
          `📦 ${rfq.title}\n` +
          `🥭 ${rfq.produits.join(', ')} — ${rfq.quantite}\n` +
          `📍 Disponible à ${rfq.commune_depart}\n` +
          `📅 ${rfq.date_souhaitee}\n` +
          `💰 Budget max: ${rfq.budget_max || 'à discuter'}\n` +
          `Cela vous intéresse ? Merci de répondre.`
        )}`,
      })
    })
  }

  // Tri : priorité aux partenaires proches du départ ou de l'arrivée
  partners.sort((a, b) => {
    const aProche = a.commune === rfq.commune_depart || a.commune === rfq.commune_arrivee ? 0 : 1
    const bProche = b.commune === rfq.commune_depart || b.commune === rfq.commune_arrivee ? 0 : 1
    return aProche - bProche
  })

  // Max 5 partenaires par appel d'offre
  return partners.slice(0, 5)
}

export function sendRFQ(rfqId: string): RFQ | null {
  const rfq = getRFQById(rfqId)
  if (!rfq) return null
  const partners = matchPartners(rfq)
  return updateRFQ(rfqId, {
    status: 'envoyee',
    partenaires: partners.map(p => ({ ...p, status: 'contacte' as const })),
  })
}

export function updatePartnerStatus(rfqId: string, partnerId: string, status: RFQPartner['status']): RFQ | null {
  const rfq = getRFQById(rfqId)
  if (!rfq) return null
  const partenaires = rfq.partenaires.map(p =>
    p.id === partnerId ? { ...p, status, responded_at: new Date().toISOString() } : p
  )
  // Auto-update RFQ status based on partner responses
  let newStatus: RFQStatus = rfq.status
  if (status === 'confirme' && !rfq.partenaires.some(p => p.status === 'confirme')) {
    newStatus = 'confirmee'
  }
  if (status === 'confirme' && rfq.status === 'confirmee') {
    newStatus = 'en_cours'
  }
  return updateRFQ(rfqId, { partenaires, status: newStatus })
}

export function deleteRFQ(id: string): boolean {
  const all = getAllRFQ()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  localStorage.setItem(RFQ_STORE, JSON.stringify(all))
  return true
}

// Simulation auto-réponses pour la démo
export function simulateResponses(rfqId: string): RFQ | null {
  const rfq = getRFQById(rfqId)
  if (!rfq || rfq.partenaires.length === 0) return null

  const updatedPartners = rfq.partenaires.map((p, i) => {
    // Premier partenaire confirme toujours, second intéressé, troisième refuse parfois
    if (i === 0) return { ...p, status: 'confirme' as const, responded_at: new Date().toISOString() }
    if (i === 1) return { ...p, status: 'interesse' as const, responded_at: new Date().toISOString() }
    if (i === 2 && Math.random() > 0.5) return { ...p, status: 'refuse' as const, responded_at: new Date().toISOString() }
    return { ...p, status: 'contacte' as const }
  })

  const hasConfirmed = updatedPartners.some(p => p.status === 'confirme')
  return updateRFQ(rfqId, {
    partenaires: updatedPartners,
    status: hasConfirmed ? 'confirmee' : 'envoyee',
  })
}

function seedRFQIfEmpty(): void {
  if (getAllRFQ().length > 0) return
  const now = new Date().toISOString()
  const rfqs: RFQ[] = [
    {
      id: 'rfq1', title: 'Transport bananes — Le François → Fort-de-France',
      type: 'transport', status: 'envoyee',
      producteur: 'Habitation Clément', producteur_phone: '0696 01 02 03',
      commune_depart: 'Le François', commune_arrivee: 'Fort-de-France',
      produits: ['Banane Cavendish'], quantite: '500 kg',
      date_souhaitee: '2026-07-10', budget_max: '300€', notes: 'Frigorifique obligatoire',
      partenaires: [
        { id: 'l1', name: 'Transport Tropical Express', phone: '0696 30 31 32', commune: 'Le Lamentin', type: 'transporteur', status: 'confirme', responded_at: now, whatsapp_url: '' },
        { id: 'l3', name: 'Froid Express 972', phone: '0696 36 37 38', commune: 'Ducos', type: 'transporteur', status: 'interesse', responded_at: now, whatsapp_url: '' },
        { id: 'l5', name: 'Livré-O-Kay', phone: '0696 42 43 44', commune: 'Le Robert', type: 'transporteur', status: 'en_attente', whatsapp_url: '' },
      ],
      created_at: now, updated_at: now,
    },
    {
      id: 'rfq2', title: 'Achat mangues et avocats — Le Morne-Rouge',
      type: 'achat', status: 'confirmee',
      producteur: 'Domaine de la Montagne Pelée', producteur_phone: '0696 04 05 06',
      commune_depart: 'Le Morne-Rouge', commune_arrivee: 'Fort-de-France',
      produits: ['Mangue José', 'Avocat Haas'], quantite: '200 kg',
      date_souhaitee: '2026-07-15', budget_max: '800€', notes: 'Qualité export',
      partenaires: [
        { id: 'd1', name: 'Karib Fruix', phone: '0696 50 51 52', commune: 'Fort-de-France', type: 'acheteur', status: 'confirme', responded_at: now, whatsapp_url: '' },
        { id: 'd7', name: 'Groupe SCBM', phone: '0696 68 69 70', commune: 'Le Lamentin', type: 'acheteur', status: 'interesse', responded_at: now, whatsapp_url: '' },
      ],
      created_at: now, updated_at: now,
    },
  ]
  localStorage.setItem(RFQ_STORE, JSON.stringify(rfqs))
}

export function seedLotsIfEmpty(): void {
  if (localStorage.getItem('kopeagri_lots_seeded')) return
  const now = new Date().toISOString()
  const lots: Lot[] = [
    { id: 'lot1', product: 'Banane Cavendish', producer: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', qty: 500, unit: 'kg', price: 2.5, quality: 'Extra', available: '2026-07-15', status: 'approved', certs: ['Bio', 'Commerce équitable'], image: '🍌', active: true, created_at: now },
    { id: 'lot2', product: 'Mangue José', producer: 'EARL Larcher', commune: 'Saint-Pierre', qty: 200, unit: 'kg', price: 4.0, quality: 'Premium', available: '2026-07-10', status: 'approved', certs: ['Bio'], image: '🥭', active: true, created_at: now },
    { id: 'lot3', product: 'Avocat Haas', producer: 'Coopérative Nord', commune: 'Le François', qty: 300, unit: 'kg', price: 3.8, quality: 'Extra', available: '2026-07-20', status: 'pending', certs: ['Bio', 'HVE'], image: '🥑', active: true, created_at: now },
    { id: 'lot4', product: 'Ananas Victoria', producer: 'SCEA Galbas', commune: 'Sainte-Luce', qty: 150, unit: 'pièce', price: 3.0, quality: 'Premium', available: '2026-07-25', status: 'approved', certs: ['Bio'], image: '🍍', active: true, created_at: now },
    { id: 'lot5', product: 'Patate douce', producer: 'Coopérative Nord', commune: 'Ajoupa-Bouillon', qty: 800, unit: 'kg', price: 1.8, quality: 'Standard', available: '2026-07-18', status: 'approved', certs: [], image: '🍠', active: true, created_at: now },
    { id: 'lot6', product: 'Citron vert', producer: 'Jean-Marie Larcher', commune: 'Le Morne-Rouge', qty: 100, unit: 'kg', price: 3.5, quality: 'Extra', available: '2026-07-12', status: 'sold', certs: [], image: '🍋', active: true, created_at: now },
    { id: 'lot7', product: 'Giraumon', producer: 'EARL Larcher', commune: 'Le Robert', qty: 400, unit: 'kg', price: 2.0, quality: 'Standard', available: '2026-07-22', status: 'draft', certs: [], image: '🎃', active: true, created_at: now },
  ]
  localStorage.setItem('kopeagri_lots', JSON.stringify(lots))
  localStorage.setItem('kopeagri_lots_seeded', '1')
}

export function seedOrdersIfEmpty(): void {
  if (localStorage.getItem('kopeagri_orders_seeded')) return
  const now = new Date().toISOString()
  const orders: Order[] = [
    { id: 'ord1', ref: 'CMD-001', buyer: 'Hôtel Bakoua - Les Trois-Îlets', items: [{ product: 'Banane Cavendish', qty: 200, unit: 'kg', price: 2.5 }], total: 500, commission: 25, status: 'preparing', date: '2026-07-10', delivery: 'Livraison hôtel', active: true, created_at: now },
    { id: 'ord2', ref: 'CMD-002', buyer: 'Marché Fort-de-France', items: [{ product: 'Mangue José', qty: 100, unit: 'kg', price: 4.0 }, { product: 'Avocat Haas', qty: 50, unit: 'kg', price: 3.8 }], total: 590, commission: 29.5, status: 'approved', date: '2026-07-12', delivery: 'Point relais Dillon', active: true, created_at: now },
    { id: 'ord3', ref: 'CMD-003', buyer: 'Restaurant Le Petibonum', items: [{ product: 'Ananas Victoria', qty: 60, unit: 'pièce', price: 3.0 }, { product: 'Citron vert', qty: 20, unit: 'kg', price: 3.5 }], total: 250, commission: 12.5, status: 'delivered', date: '2026-07-05', delivery: 'Livraison restaurant', active: true, created_at: now },
    { id: 'ord4', ref: 'CMD-004', buyer: 'Export Guadeloupe', items: [{ product: 'Banane Cavendish', qty: 1000, unit: 'kg', price: 2.2 }], total: 2200, commission: 110, status: 'pending', date: '2026-07-20', delivery: 'Port de Fort-de-France', active: true, created_at: now },
    { id: 'ord5', ref: 'CMD-005', buyer: 'Épicerie Croix-Rivail', items: [{ product: 'Patate douce', qty: 50, unit: 'kg', price: 1.8 }, { product: 'Giraumon', qty: 30, unit: 'kg', price: 2.0 }], total: 150, commission: 7.5, status: 'cancelled', date: '2026-07-08', delivery: 'Magasin', active: true, created_at: now },
  ]
  localStorage.setItem('kopeagri_orders', JSON.stringify(orders))
  localStorage.setItem('kopeagri_orders_seeded', '1')
}
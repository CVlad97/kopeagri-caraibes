// Types partagés entre le client et les pages
// Alignés sur le schéma Supabase (schema.sql)

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'producteur' | 'proprietaire' | 'cooperative' | 'acheteur_b2b' | 'transporteur' | 'institution' | 'admin'
  commune: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  siret: string | null
  rib: string | null
  company_name: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  active: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Producer {
  id: string
  owner_id: string
  name: string
  contact: string
  phone: string
  commune: string
  cultures: string[]
  certifications: string[]
  superficie_ha: number
  description: string | null
  photo_url: string | null
  active: boolean
  geo_lat: number | null
  geo_lng: number | null
  created_at: string
  updated_at: string
}

export interface LogisticsProvider {
  id: string
  owner_id: string
  name: string
  contact: string
  phone: string
  commune: string
  services: string[]
  fleet: string | null
  zone_couverture: string[]
  capacite_kg: number
  frigorifique: boolean
  active: boolean
  geo_lat: number | null
  geo_lng: number | null
  created_at: string
  updated_at: string
}

export interface Distributor {
  id: string
  owner_id: string
  name: string
  contact: string
  phone: string
  commune: string
  type: 'grossiste' | 'distributeur' | 'transitaire' | 'exportateur' | 'hotel_restaurant'
  active: boolean
  geo_lat: number | null
  geo_lng: number | null
  created_at: string
  updated_at: string
}

export interface Parcelle {
  id: string
  owner_id: string
  name: string
  commune: string
  superficie_ha: number
  cultures: string[]
  geo_lat: number
  geo_lng: number
  altitude_m: number | null
  irrigation: boolean
  certification: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type DocumentType = 'devis' | 'facture' | 'bon_commande'
export type DocumentStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye' | 'annule' | 'expire'
export type PaymentStatus = 'non_paye' | 'partiel' | 'paye' | 'en_retard'

export interface BillingDocument {
  id: string
  owner_id: string
  type: DocumentType
  reference: string
  status: DocumentStatus
  payment_status: PaymentStatus
  client_name: string
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  client_siret: string | null
  subtotal_ht: number
  total_tva: number
  total_ttc: number
  due_date: string
  sent_at: string | null
  paid_at: string | null
  notes: string | null
  qonto_synced: boolean
  pdf_url: string | null
  geo_lat: number | null
  geo_lng: number | null
  lines: BillingLine[]
  created_at: string
  updated_at: string
}

export interface BillingLine {
  id: string
  document_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  tva_rate: number
  total_ht: number
  total_ttc: number
  sort_order: number
  created_at: string
}

export type QontoTxCategory = 'vente' | 'achat' | 'commission' | 'abonnement' | 'transport' | 'carburant' | 'fourniture' | 'salaire' | 'loyer' | 'assurance' | 'autre'

export interface QontoTransaction {
  id: string
  owner_id: string
  date: string
  amount: number
  description: string
  category: QontoTxCategory
  status: 'completed' | 'pending' | 'failed'
  linked_document_id: string | null
  qonto_id: string | null
  reconciliation_status: string | null
  created_at: string
}

export type PlanType = 'gratuit' | 'konbit' | 'lakou' | 'plantasyon'
export type SubStatus = 'active' | 'en_attente' | 'expiree' | 'resiliee'

export interface Subscription {
  id: string
  user_id: string
  user_name: string
  plan: PlanType
  status: SubStatus
  started_at: string
  expires_at: string
  auto_renew: boolean
  payment_method: 'virement' | 'cheque' | 'especes' | 'mobile_money' | 'carte'
  amount: number
  reference: string
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export type RFQStatus = 'brouillon' | 'envoyee' | 'confirmee' | 'en_cours' | 'livree' | 'annulee'
export type RFQType = 'transport' | 'achat' | 'stockage' | 'export'

export interface RFQ {
  id: string
  owner_id: string
  title: string
  type: RFQType
  status: RFQStatus
  producteur: string
  producteur_phone: string
  commune_depart: string
  commune_arrivee: string | null
  produits: string[]
  quantite: string
  date_souhaitee: string | null
  budget_max: number | null
  notes: string | null
  partenaires: RFQPartner[]
  created_at: string
  updated_at: string
}

export type PartnerStatus = 'en_attente' | 'contacte' | 'interesse' | 'confirme' | 'refuse'
export type PartnerType = 'transporteur' | 'acheteur' | 'stockeur' | 'exportateur'

export interface RFQPartner {
  id: string
  rfq_id: string
  partner_id: string | null
  name: string
  phone: string
  commune: string | null
  type: PartnerType
  status: PartnerStatus
  proposed_price: number | null
  proposed_date: string | null
  notes: string | null
  responded_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  channel: 'whatsapp' | 'email' | 'sms' | 'push' | 'in_app'
  status: 'en_attente' | 'envoyee' | 'echouee' | 'lue'
  title: string
  body: string
  action_url: string | null
  metadata: Record<string, unknown>
  sent_at: string | null
  read_at: string | null
  created_at: string
}

// Constantes Martinique
export const MARTINIQUE_COMMUNES = [
  'Ajoupa-Bouillon', 'Basse-Pointe', 'Bellefontaine', 'Case-Pilote', 'Ducos',
  'Fonds-Saint-Denis', 'Fort-de-France', 'Grand-Rivière', 'Gros-Morne',
  'La Trinité', 'Le Carbet', 'Le Diamant', 'Le François', 'Le Lamentin',
  'Le Lorrain', 'Le Marigot', 'Le Marin', 'Le Morne-Rouge', 'Le Morne-Vert',
  'Le Prêcheur', 'Le Robert', 'Le Vauclin', "Les Anses-d'Arlet", 'Les Trois-Îlets',
  'Macouba', 'Rivière-Pilote', 'Rivière-Salée', 'Saint-Esprit', 'Saint-Joseph',
  'Saint-Pierre', 'Sainte-Anne', 'Sainte-Luce', 'Sainte-Marie', 'Schœlcher',
] as const

export const AGRICULTURE_CULTURES = [
  'Banane Cavendish', 'Banane plantain', 'Mangue José', 'Mangue Amélie',
  'Ananas Victoria', 'Ananas Queen', 'Avocat Haas', 'Avocat Lula',
  'Patate douce', 'Igname', 'Manioc', 'Dasheen', 'Christophine',
  'Giraumon', 'Concombre', 'Tomate', 'Laitue', 'Poivron',
  'Citron vert', 'Orange', 'Pamplemousse', 'Fruit à pain',
  'Coco', 'Cacao', 'Vanille', 'Canne à sucre', 'Café',
] as const

export const DISTRIBUTOR_TYPES = [
  { value: 'grossiste', label: 'Grossiste' },
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'transitaire', label: 'Transitaire / Commissionnaire' },
  { value: 'exportateur', label: 'Exportateur' },
  { value: 'hotel_restaurant', label: 'Hôtel / Restaurant / Collectivité' },
] as const

export const TVA_RATES = [0, 2.1, 5.5, 8.5, 10, 20] as const

export const COMMUNE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Fort-de-France': { lat: 14.6161, lng: -61.0636 },
  'Schœlcher': { lat: 14.6140, lng: -61.0810 },
  'Le Lamentin': { lat: 14.6050, lng: -61.0060 },
  'Saint-Joseph': { lat: 14.6732, lng: -61.0019 },
  'Le François': { lat: 14.6170, lng: -60.9070 },
  'Le Robert': { lat: 14.6710, lng: -60.9420 },
  'Le Marin': { lat: 14.4737, lng: -60.8708 },
  'Sainte-Anne': { lat: 14.4355, lng: -60.8468 },
  'Le Vauclin': { lat: 14.5123, lng: -60.8302 },
  'Sainte-Luce': { lat: 14.4739, lng: -60.9287 },
  'Rivière-Pilote': { lat: 14.4704, lng: -60.8845 },
  'Le Diamant': { lat: 14.4388, lng: -61.0284 },
  "Les Anses-d'Arlet": { lat: 14.4823, lng: -61.0739 },
  'Les Trois-Îlets': { lat: 14.5407, lng: -61.0004 },
  'Le Carbet': { lat: 14.6528, lng: -61.1701 },
  'Bellefontaine': { lat: 14.6327, lng: -61.1421 },
  'Case-Pilote': { lat: 14.6425, lng: -61.1187 },
  'Saint-Pierre': { lat: 14.7433, lng: -61.1713 },
  'Le Prêcheur': { lat: 14.7854, lng: -61.2078 },
  'Le Morne-Rouge': { lat: 14.7512, lng: -61.1292 },
  'Ajoupa-Bouillon': { lat: 14.8105, lng: -61.1028 },
  'Le Morne-Vert': { lat: 14.6921, lng: -61.0940 },
  'Gros-Morne': { lat: 14.6711, lng: -61.0614 },
  'Macouba': { lat: 14.8364, lng: -61.0782 },
  "Grand'Rivière": { lat: 14.8663, lng: -61.2135 },
  'La Trinité': { lat: 14.7225, lng: -60.9681 },
}

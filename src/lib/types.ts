export type UserRole = 'producteur' | 'proprietaire' | 'cooperative' | 'acheteur_b2b' | 'transporteur' | 'institution'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  commune: string
  phone: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Farm {
  id: string
  owner_id: string
  name: string
  description: string | null
  commune: string
  address: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface Plot {
  id: string
  farm_id: string
  name: string
  surface_ha: number
  soil_type: string
  water_access: boolean
  status: 'available' | 'cultivated' | 'fallow' | 'rented'
  latitude: number | null
  longitude: number | null
  description: string | null
  available_for_rent: boolean
  rental_conditions: string | null
  created_at: string
}

export interface Resource {
  id: string
  owner_id: string
  name: string
  type: 'materiel' | 'chambre_froide' | 'camion' | 'main_oeuvre' | 'intrant' | 'emballage'
  description: string
  commune: string
  daily_rate: number | null
  available: boolean
  quantity: number
  unit: string
  created_at: string
}

export interface Booking {
  id: string
  resource_id: string
  requester_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'
  total_amount: number | null
  notes: string | null
  created_at: string
}

export interface Lot {
  id: string
  producer_id: string
  product_name: string
  category: string
  quantity: number
  unit: string
  quality_grade: string | null
  description: string | null
  available_date: string
  price_per_unit: number
  photos: string[]
  commune: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sold'
  qr_code: string | null
  certifications: string[]
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  status: 'draft' | 'pending' | 'approved' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  commission_amount: number
  delivery_address: string | null
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  lot_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface LogisticsTask {
  id: string
  order_id: string
  transporter_id: string | null
  pickup_location: string
  delivery_location: string
  scheduled_date: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  stripe_payment_id: string | null
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  name: string
  type: string
  file_url: string
  verified: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export type StatusMap = Record<string, string>
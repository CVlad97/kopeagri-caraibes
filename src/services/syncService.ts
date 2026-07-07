// ===== SUPABASE ↔ LOCALSTORAGE SYNC SERVICE =====
// Bridges local data with Supabase backend.
// When HAS_CREDENTIALS is true, can pull/push data between Supabase and localStorage.
// UI pages continue to read from localStorage synchronously — no signature changes needed.
//
// Usage:
//   import { syncFromSupabase, syncToSupabase, getSyncStatus } from '../services/syncService'
//   // On login / app startup:
//   await syncFromSupabase()
//   // On "Sync" button in admin:
//   await syncToSupabase()
//   // Check status:
//   const status = getSyncStatus()

import { supabase, HAS_CREDENTIALS } from '../lib/supabase'
import * as dataService from './dataService'
import type {
  Producer, LogisticsProvider, Distributor, Plot, Resource,
  Booking, Lot, Order, RFQ,
} from './dataService'

// ============================================================
// TABLE MAPPING: localStorage key prefix → Supabase table name
// ============================================================
export const TABLE_MAP: Record<string, string> = {
  producers:   'producteurs',           // NOT "producers" — schema uses producteurs
  logistics:   'logistics_providers',   // ✓
  distributors: 'distributors',          // ✓
  plots:       'parcelles',             // NOT "plots" — schema uses parcelles
  resources:   'resources',             // ✓
  bookings:    'bookings',              // ✓
  lots:        'lots',                  // ✓
  orders:      'orders',                // ✓
  rfq:         'rfq',                   // NOT "rfqs" — schema uses rfq
  notifications: 'notifications',       // ✓
  // Billing & subscriptions (future expansion)
  documents:   'billing_documents',     // ✓
  qonto:       'qonto_transactions',    // ✓
  subscriptions: 'subscriptions',       // ✓
  commissions:  'commissions',
}

// localStorage key → Supabase table
const LS_PREFIX = 'kopeagri_'
function lsKey(collection: string): string {
  return `${LS_PREFIX}${collection}`
}

// ============================================================
// FIELD MAPPING: local shape ↔ Supabase row shape
// ============================================================

// --- Producers ---
function producerToSupabase(p: Producer): Record<string, unknown> {
  return {
    full_name:  p.name,
    email:      p.contact,       // contact name → email field in simplified schema
    phone:      p.phone,
    commune:    p.commune,
    bio:        p.cultures?.join(', ') || '',
    avatar_url: null,
    active:     p.active,
    created_at: p.created_at,
  }
}
function producerFromSupabase(row: Record<string, unknown>, id: string): Producer {
  return {
    id:            id,
    name:          (row.full_name as string) || '',
    contact:       (row.email as string) || '',
    phone:         (row.phone as string) || '',
    commune:       (row.commune as string) || '',
    cultures:      ((row.bio as string) || '').split(', ').filter(Boolean),
    certifications: [] as string[],  // not in simplified producers table
    active:        (row.active as boolean) ?? true,
    created_at:    (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Logistics ---
function logisticsToSupabase(l: LogisticsProvider): Record<string, unknown> {
  return {
    name:         l.name,
    contact_name: l.contact,
    phone:        l.phone,
    commune:      l.commune,
    services:     l.services,
    fleet:        l.fleet,
    active:       l.active,
    created_at:   l.created_at,
  }
}
function logisticsFromSupabase(row: Record<string, unknown>, id: string): LogisticsProvider {
  return {
    id:         id,
    name:       (row.name as string) || '',
    contact:    (row.contact_name as string) || '',
    phone:      (row.phone as string) || '',
    commune:    (row.commune as string) || '',
    services:   (row.services as string[]) || [],
    fleet:      (row.fleet as string) || '',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Distributors ---
function distributorToSupabase(d: Distributor): Record<string, unknown> {
  return {
    name:         d.name,
    contact_name: d.contact,
    phone:        d.phone,
    commune:      d.commune,
    type:         d.type,
    active:       d.active,
    created_at:   d.created_at,
  }
}
function distributorFromSupabase(row: Record<string, unknown>, id: string): Distributor {
  return {
    id:         id,
    name:       (row.name as string) || '',
    contact:    (row.contact_name as string) || '',
    phone:      (row.phone as string) || '',
    commune:    (row.commune as string) || '',
    type:       (row.type as Distributor['type']) || 'grossiste',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Plots ---
function plotToSupabase(p: Plot): Record<string, unknown> {
  return {
    name:          p.name,
    farm_name:     p.farm,
    surface_ha:    p.surface,
    soil_type:     p.soil,
    water_access:  p.water,
    status:        p.status,
    current_crop:  p.crop,
    commune:       p.commune,
    rental_terms:  p.rental,
    active:        p.active,
    created_at:    p.created_at,
  }
}
function plotFromSupabase(row: Record<string, unknown>, id: string): Plot {
  return {
    id:         id,
    name:       (row.name as string) || '',
    farm:       (row.farm_name as string) || '',
    surface:    (row.surface_ha as number) || 0,
    soil:       (row.soil_type as string) || '',
    water:      (row.water_access as boolean) ?? false,
    status:     (row.status as Plot['status']) || 'available',
    crop:       (row.current_crop as string) || '',
    commune:    (row.commune as string) || '',
    rental:     (row.rental_terms as string) || '',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Resources ---
function resourceToSupabase(r: Resource): Record<string, unknown> {
  return {
    name:        r.name,
    type:         r.type,
    owner_name:   r.owner,
    commune:      r.commune,
    rate:         r.rate,
    unit:         r.unit,
    quantity:     r.quantity,
    description:  r.desc,
    available:    r.available,
    active:       r.active,
    created_at:   r.created_at,
  }
}
function resourceFromSupabase(row: Record<string, unknown>, id: string): Resource {
  return {
    id:         id,
    name:       (row.name as string) || '',
    type:       (row.type as Resource['type']) || 'materiel',
    owner:      (row.owner_name as string) || '',
    commune:    (row.commune as string) || '',
    rate:       (row.rate as number) || 0,
    unit:       (row.unit as string) || '',
    quantity:   (row.quantity as number) || 0,
    desc:       (row.description as string) || '',
    available:  (row.available as boolean) ?? true,
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Bookings ---
interface LocalBooking {
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
function bookingToSupabase(b: LocalBooking): Record<string, unknown> {
  return {
    resource_id:    b.item_id,
    resource_name:  b.item_name,
    booker_name:    b.name,
    booker_phone:   b.phone,
    dates:          b.dates,
    message:        b.message,
    active:         b.active,
    created_at:     b.created_at,
  }
}
function bookingFromSupabase(row: Record<string, unknown>, id: string): LocalBooking {
  return {
    id:         id,
    collection: 'resources',  // default collection context
    item_id:    (row.resource_id as string) || '',
    item_name:  (row.resource_name as string) || '',
    name:       (row.booker_name as string) || '',
    phone:      (row.booker_phone as string) || '',
    dates:      (row.dates as string) || '',
    message:    (row.message as string) || '',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Lots ---
function lotToSupabase(l: Lot): Record<string, unknown> {
  return {
    product:         l.product,
    producer_id:     null,  // producer is a string name, not a UUID FK
    commune:         l.commune,
    qty:             l.qty,
    unit:            l.unit,
    price_per_unit:  l.price,
    quality:         l.quality,
    available_date:  l.available,
    status:          l.status,
    certifications:  l.certs,
    image_url:       l.image,
    active:          l.active,
    created_at:      l.created_at,
  }
}
function lotFromSupabase(row: Record<string, unknown>, id: string): Lot {
  return {
    id:         id,
    product:    (row.product as string) || '',
    producer:   (row.producer_id as string) || '',  // won't be a name; fallback
    commune:    (row.commune as string) || '',
    qty:        (row.qty as number) || 0,
    unit:       (row.unit as string) || '',
    price:      (row.price_per_unit as number) || 0,
    quality:    (row.quality as string) || '',
    available:  (row.available_date as string) || '',
    status:     (row.status as string) || '',
    certs:      (row.certifications as string[]) || [],
    image:      (row.image_url as string) || '',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- Orders ---
function orderToSupabase(o: Order): Record<string, unknown> {
  return {
    ref:           o.ref,
    buyer_name:    o.buyer,
    items:         o.items,
    total:         o.total,
    commission:    o.commission,
    status:        o.status,
    order_date:    o.date,
    delivery_info: o.delivery,
    active:        o.active,
    created_at:    o.created_at,
  }
}
function orderFromSupabase(row: Record<string, unknown>, id: string): Order {
  return {
    id:         id,
    ref:        (row.ref as string) || '',
    buyer:      (row.buyer_name as string) || '',
    items:      (row.items as Order['items']) || [],
    total:      (row.total as number) || 0,
    commission: (row.commission as number) || 0,
    status:     (row.status as string) || '',
    date:       (row.order_date as string) || '',
    delivery:   (row.delivery_info as string) || '',
    active:     (row.active as boolean) ?? true,
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// --- RFQs ---
function rfqToSupabase(r: RFQ): Record<string, unknown> {
  return {
    title:           r.title,
    type:            r.type,
    status:          r.status,
    producer_id:     null,  // producer is string name, not UUID
    producer_phone:  r.producteur_phone,
    commune_from:    r.commune_depart,
    commune_to:      r.commune_arrivee,
    products:        r.produits,
    quantity:        r.quantite,
    desired_date:    r.date_souhaitee,
    budget_max:      r.budget_max ? parseFloat(r.budget_max) : null,
    notes:           r.notes,
    partners:        r.partenaires,
    created_at:      r.created_at,
    updated_at:      r.updated_at,
  }
}
function rfqFromSupabase(row: Record<string, unknown>, id: string): RFQ {
  return {
    id:                id,
    title:             (row.title as string) || '',
    type:              (row.type as RFQ['type']) || 'transport',
    status:            (row.status as RFQ['status']) || 'brouillon',
    producteur:        '',  // no direct name field in Supabase row
    producteur_phone:  (row.producer_phone as string) || '',
    commune_depart:    (row.commune_from as string) || '',
    commune_arrivee:   (row.commune_to as string) || '',
    produits:          (row.products as string[]) || [],
    quantite:          (row.quantity as string) || '',
    date_souhaitee:    (row.desired_date as string) || '',
    budget_max:        row.budget_max != null ? String(row.budget_max) : '',
    notes:             (row.notes as string) || '',
    partenaires:       (row.partners as RFQ['partenaires']) || [],
    created_at:        (row.created_at as string) || new Date().toISOString(),
    updated_at:        (row.updated_at as string) || new Date().toISOString(),
  }
}

// --- Notifications ---
interface LocalNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link: string
  active: boolean
  created_at: string
}
function notificationToSupabase(n: LocalNotification): Record<string, unknown> {
  return {
    user_id: null,  // no user context in localStorage version
    type:    n.type,
    title:   n.title,
    message: n.message,
    read:    n.read,
    link:    n.link,
    created_at: n.created_at,
  }
}
function notificationFromSupabase(row: Record<string, unknown>, id: string): LocalNotification {
  return {
    id:         id,
    type:       (row.type as string) || '',
    title:      (row.title as string) || '',
    message:    (row.message as string) || '',
    read:       (row.read as boolean) ?? false,
    link:       (row.link as string) || '',
    active:     true,  // Supabase notifications don't have active, assume true
    created_at: (row.created_at as string) || new Date().toISOString(),
  }
}

// ============================================================
// FIELD MAPPER REGISTRY
// ============================================================
type ToSupabase = (item: any) => Record<string, unknown>
type FromSupabase = (row: Record<string, unknown>, id: string) => any

interface FieldMapper {
  toSupabase:   ToSupabase
  fromSupabase: FromSupabase
}

const FIELD_MAPPERS: Record<string, FieldMapper> = {
  producers:     { toSupabase: producerToSupabase,   fromSupabase: producerFromSupabase },
  logistics:     { toSupabase: logisticsToSupabase,  fromSupabase: logisticsFromSupabase },
  distributors:  { toSupabase: distributorToSupabase, fromSupabase: distributorFromSupabase },
  plots:         { toSupabase: plotToSupabase,        fromSupabase: plotFromSupabase },
  resources:     { toSupabase: resourceToSupabase,    fromSupabase: resourceFromSupabase },
  bookings:      { toSupabase: bookingToSupabase,    fromSupabase: bookingFromSupabase },
  lots:          { toSupabase: lotToSupabase,         fromSupabase: lotFromSupabase },
  orders:        { toSupabase: orderToSupabase,       fromSupabase: orderFromSupabase },
  rfq:           { toSupabase: rfqToSupabase,          fromSupabase: rfqFromSupabase },
  notifications: { toSupabase: notificationToSupabase,  fromSupabase: notificationFromSupabase },
}

// ============================================================
// SYNC STATUS TRACKING
// ============================================================
const SYNC_STATUS_KEY = 'kopeagri_sync_status'

export interface SyncStatus {
  lastSyncFromSupabase: string | null   // ISO timestamp of last pull
  lastSyncToSupabase:   string | null    // ISO timestamp of last push
  lastError:           string | null
  isSyncing:           boolean
  tablesSynced:        string[]         // which tables were synced
}

export function getSyncStatus(): SyncStatus {
  try {
    const raw = localStorage.getItem(SYNC_STATUS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    lastSyncFromSupabase: null,
    lastSyncToSupabase:   null,
    lastError:            null,
    isSyncing:             false,
    tablesSynced:         [],
  }
}

function updateSyncStatus(partial: Partial<SyncStatus>): void {
  const current = getSyncStatus()
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({ ...current, ...partial }))
}

// ============================================================
// SYNC EVENT SYSTEM (for UI re-render)
// ============================================================
type SyncListener = (event: 'sync-start' | 'sync-complete' | 'sync-error', detail?: string) => void
const listeners: SyncListener[] = []

export function onSyncEvent(listener: SyncListener): () => void {
  listeners.push(listener)
  return () => {
    const idx = listeners.indexOf(listener)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}

function emit(event: 'sync-start' | 'sync-complete' | 'sync-error', detail?: string) {
  listeners.forEach(l => { try { l(event, detail) } catch { /* swallow */ } })
}

// ============================================================
// READ LOCAL STORAGE COLLECTION
// ============================================================
function readLocalCollection(collection: string): any[] {
  const key = lsKey(collection)
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalCollection(collection: string, items: any[]): void {
  const key = lsKey(collection)
  localStorage.setItem(key, JSON.stringify(items))
}

// ============================================================
// syncFromSupabase(): Pull all tables from Supabase → localStorage
// ============================================================
export async function syncFromSupabase(
  options?: { tables?: string[] }
): Promise<{ synced: string[]; errors: Record<string, string> }> {
  if (!HAS_CREDENTIALS) {
    return { synced: [], errors: { __general: 'No Supabase credentials configured' } }
  }

  const tables = options?.tables || Object.keys(TABLE_MAP)
  const synced: string[] = []
  const errors: Record<string, string> = {}

  updateSyncStatus({ isSyncing: true })
  emit('sync-start', 'syncFromSupabase')

  for (const collection of tables) {
    const table = TABLE_MAP[collection]
    if (!table) continue

    try {
      const { data, error } = await supabase.from(table).select('*')

      if (error) {
        errors[collection] = error.message || String(error)
        continue
      }

      if (!data || data.length === 0) {
        // No data in Supabase for this table — keep local data, don't overwrite with empty
        synced.push(collection)
        continue
      }

      // Convert Supabase rows → local shape and write to localStorage
      const mapper = FIELD_MAPPERS[collection]
      const localItems = data.map((row: Record<string, unknown>) => {
        const id = (row.id as string) || crypto.randomUUID()
        if (mapper) {
          return mapper.fromSupabase(row, id)
        }
        // No mapper → use raw row with id injected (best-effort passthrough)
        return { ...row, id }
      })

      writeLocalCollection(collection, localItems)
      synced.push(collection)
    } catch (err: any) {
      errors[collection] = err.message || String(err)
    }
  }

  const hasErrors = Object.keys(errors).length > 0
  updateSyncStatus({
    lastSyncFromSupabase: new Date().toISOString(),
    isSyncing: false,
    lastError: hasErrors ? Object.values(errors).join('; ') : null,
    tablesSynced: synced,
  })

  emit(hasErrors ? 'sync-error' : 'sync-complete', 'syncFromSupabase')
  return { synced, errors }
}

// ============================================================
// syncToSupabase(): Push all localStorage → Supabase (upsert)
// ============================================================
export async function syncToSupabase(
  options?: { tables?: string[] }
): Promise<{ synced: string[]; errors: Record<string, string> }> {
  if (!HAS_CREDENTIALS) {
    return { synced: [], errors: { __general: 'No Supabase credentials configured' } }
  }

  const tables = options?.tables || Object.keys(TABLE_MAP)
  const synced: string[] = []
  const errors: Record<string, string> = {}

  updateSyncStatus({ isSyncing: true })
  emit('sync-start', 'syncToSupabase')

  for (const collection of tables) {
    const table = TABLE_MAP[collection]
    if (!table) continue

    try {
      const localItems = readLocalCollection(collection)
      if (localItems.length === 0) {
        synced.push(collection)
        continue
      }

      const mapper = FIELD_MAPPERS[collection]
      const supabaseRows = localItems.map((item: any) => {
        const row = mapper ? mapper.toSupabase(item) : { ...item }
        // Include the local id so upsert matches by id
        row.id = item.id
        return row
      })

      // Upsert in batches of 50 to avoid payload limits
      const BATCH = 50
      for (let i = 0; i < supabaseRows.length; i += BATCH) {
        const batch = supabaseRows.slice(i, i + BATCH)
        const { error } = await supabase.from(table).upsert(batch, {
          onConflict: 'id',
        })
        if (error) {
          errors[`${collection}_batch_${i}`] = error.message || String(error)
        }
      }

      if (!errors[`${collection}_batch_0`]) {
        synced.push(collection)
      }
    } catch (err: any) {
      errors[collection] = err.message || String(err)
    }
  }

  const hasErrors = Object.keys(errors).length > 0
  updateSyncStatus({
    lastSyncToSupabase: new Date().toISOString(),
    isSyncing: false,
    lastError: hasErrors ? Object.values(errors).join('; ') : null,
    tablesSynced: synced,
  })

  emit(hasErrors ? 'sync-error' : 'sync-complete', 'syncToSupabase')
  return { synced, errors }
}

// ============================================================
// bidirectionalSync(): Smart merge — pull from Supabase, then push local-only items
// ============================================================
export async function bidirectionalSync(
  options?: { tables?: string[] }
): Promise<{ pulled: string[]; pushed: string[]; errors: Record<string, string> }> {
  if (!HAS_CREDENTIALS) {
    return { pulled: [], pushed: [], errors: { __general: 'No Supabase credentials configured' } }
  }

  updateSyncStatus({ isSyncing: true })
  emit('sync-start', 'bidirectionalSync')

  // Step 1: Pull from Supabase
  const pullResult = await syncFromSupabase(options)
  const pulled = pullResult.synced
  const errors = { ...pullResult.errors }

  // Step 2: Push local data (upsert handles merge by id)
  const pushResult = await syncToSupabase(options)
  const pushed = pushResult.synced

  // Merge push errors
  Object.assign(errors, pushResult.errors)

  updateSyncStatus({
    lastSyncFromSupabase: new Date().toISOString(),
    lastSyncToSupabase:   new Date().toISOString(),
    isSyncing: false,
    lastError: Object.keys(errors).length > 0 ? Object.values(errors).join('; ') : null,
    tablesSynced: [...new Set([...pulled, ...pushed])],
  })

  emit(Object.keys(errors).length > 0 ? 'sync-error' : 'sync-complete', 'bidirectionalSync')
  return { pulled, pushed, errors }
}

// ============================================================
// syncSingleTable(): Sync just one collection (for targeted operations)
// ============================================================
export async function syncSingleTable(
  collection: string,
  direction: 'pull' | 'push' | 'both' = 'both'
): Promise<{ success: boolean; error?: string }> {
  if (!HAS_CREDENTIALS) {
    return { success: false, error: 'No Supabase credentials configured' }
  }

  const table = TABLE_MAP[collection]
  if (!table) {
    return { success: false, error: `Unknown collection: ${collection}` }
  }

  try {
    if (direction === 'pull' || direction === 'both') {
      const pullResult = await syncFromSupabase({ tables: [collection] })
      if (pullResult.errors[collection]) {
        return { success: false, error: pullResult.errors[collection] }
      }
    }

    if (direction === 'push' || direction === 'both') {
      const pushResult = await syncToSupabase({ tables: [collection] })
      if (pushResult.errors[collection]) {
        return { success: false, error: pushResult.errors[collection] }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || String(err) }
  }
}

// ============================================================
// autoSyncOnLogin(): Call this after successful auth
// Pulls from Supabase to get the latest data, then pushes any
// local-only data that might not be on the server yet.
// ============================================================
export async function autoSyncOnLogin(): Promise<void> {
  if (!HAS_CREDENTIALS) return

  try {
    await bidirectionalSync()
  } catch {
    // Silent fail — the app still works with localStorage
  }
}

// ============================================================
// schedulePeriodicSync(): Set up auto-sync interval
// Returns a cleanup function to clear the interval.
// ============================================================
export function schedulePeriodicSync(intervalMs: number = 5 * 60 * 1000): () => void {
  if (!HAS_CREDENTIALS) return () => {}

  let running = false
  const id = setInterval(async () => {
    if (running) return  // skip if previous sync still in progress
    running = true
    try {
      await syncFromSupabase()
    } catch {
      // silent
    } finally {
      running = false
    }
  }, intervalMs)

  // Also do an immediate sync
  syncFromSupabase().catch(() => {})

  return () => clearInterval(id)
}

// ============================================================
// clearSyncStatus(): Reset sync metadata (for testing / logout)
// ============================================================
export function clearSyncStatus(): void {
  localStorage.removeItem(SYNC_STATUS_KEY)
}

// ============================================================
// hasCredentials(): Convenience accessor
// ============================================================
export function hasCredentials(): boolean {
  return HAS_CREDENTIALS
}

// ============================================================
// getSupabaseTableNames(): List all mapped Supabase tables
// ============================================================
export function getSupabaseTableNames(): string[] {
  return Object.values(TABLE_MAP)
}

// ============================================================
// getCollectionNames(): List all localStorage collections
// ============================================================
export function getCollectionNames(): string[] {
  return Object.keys(TABLE_MAP)
}

export type InviteType = 'lot_share' | 'neighbor' | 'buyer' | 'transporter'
export type TrafficSource = InviteType | 'direct'

export interface InviteMetrics {
  total: number
  lot_share: number
  neighbor: number
  buyer: number
  transporter: number
  queued_offline: number

  lot_page_views_total: number
  lot_page_views_from_invite: number
  lot_page_views_direct: number
  lot_page_views_lot_share: number
  lot_page_views_neighbor: number
  lot_page_views_buyer: number
  lot_page_views_transporter: number

  orders_created_total: number
  orders_from_invite: number
  orders_direct: number
  orders_lot_share: number
  orders_neighbor: number
  orders_buyer: number
  orders_transporter: number

  last_event_at: string | null
}

const METRICS_KEY = 'kopeagri_growth_invites_v1'

const DEFAULT_METRICS: InviteMetrics = {
  total: 0,
  lot_share: 0,
  neighbor: 0,
  buyer: 0,
  transporter: 0,
  queued_offline: 0,

  lot_page_views_total: 0,
  lot_page_views_from_invite: 0,
  lot_page_views_direct: 0,
  lot_page_views_lot_share: 0,
  lot_page_views_neighbor: 0,
  lot_page_views_buyer: 0,
  lot_page_views_transporter: 0,

  orders_created_total: 0,
  orders_from_invite: 0,
  orders_direct: 0,
  orders_lot_share: 0,
  orders_neighbor: 0,
  orders_buyer: 0,
  orders_transporter: 0,

  last_event_at: null,
}

function isInviteSource(source: TrafficSource): source is InviteType {
  return source === 'lot_share' || source === 'neighbor' || source === 'buyer' || source === 'transporter'
}

export function normalizeTrafficSource(input?: string | null): TrafficSource {
  if (!input) return 'direct'
  const value = input.trim().toLowerCase()
  if (value === 'lot_share' || value === 'neighbor' || value === 'buyer' || value === 'transporter') {
    return value
  }
  return 'direct'
}

export function getInviteMetrics(): InviteMetrics {
  try {
    const raw = localStorage.getItem(METRICS_KEY)
    if (!raw) return { ...DEFAULT_METRICS }
    const parsed = JSON.parse(raw) as Partial<InviteMetrics>
    return { ...DEFAULT_METRICS, ...parsed }
  } catch {
    return { ...DEFAULT_METRICS }
  }
}

function saveInviteMetrics(next: InviteMetrics): void {
  localStorage.setItem(METRICS_KEY, JSON.stringify(next))
}

export function trackInvite(type: InviteType, queuedOffline = false): InviteMetrics {
  const current = getInviteMetrics()
  const next: InviteMetrics = {
    ...current,
    total: current.total + 1,
    [type]: (current[type] || 0) + 1,
    queued_offline: queuedOffline ? current.queued_offline + 1 : current.queued_offline,
    last_event_at: new Date().toISOString(),
  }
  saveInviteMetrics(next)
  return next
}

export function trackLotPageView(source: TrafficSource): InviteMetrics {
  const current = getInviteMetrics()
  const next: InviteMetrics = {
    ...current,
    lot_page_views_total: current.lot_page_views_total + 1,
    lot_page_views_from_invite: isInviteSource(source) ? current.lot_page_views_from_invite + 1 : current.lot_page_views_from_invite,
    lot_page_views_direct: source === 'direct' ? current.lot_page_views_direct + 1 : current.lot_page_views_direct,
    lot_page_views_lot_share: source === 'lot_share' ? current.lot_page_views_lot_share + 1 : current.lot_page_views_lot_share,
    lot_page_views_neighbor: source === 'neighbor' ? current.lot_page_views_neighbor + 1 : current.lot_page_views_neighbor,
    lot_page_views_buyer: source === 'buyer' ? current.lot_page_views_buyer + 1 : current.lot_page_views_buyer,
    lot_page_views_transporter: source === 'transporter' ? current.lot_page_views_transporter + 1 : current.lot_page_views_transporter,
    last_event_at: new Date().toISOString(),
  }
  saveInviteMetrics(next)
  return next
}

export function trackOrderCreated(source: TrafficSource): InviteMetrics {
  const current = getInviteMetrics()
  const next: InviteMetrics = {
    ...current,
    orders_created_total: current.orders_created_total + 1,
    orders_from_invite: isInviteSource(source) ? current.orders_from_invite + 1 : current.orders_from_invite,
    orders_direct: source === 'direct' ? current.orders_direct + 1 : current.orders_direct,
    orders_lot_share: source === 'lot_share' ? current.orders_lot_share + 1 : current.orders_lot_share,
    orders_neighbor: source === 'neighbor' ? current.orders_neighbor + 1 : current.orders_neighbor,
    orders_buyer: source === 'buyer' ? current.orders_buyer + 1 : current.orders_buyer,
    orders_transporter: source === 'transporter' ? current.orders_transporter + 1 : current.orders_transporter,
    last_event_at: new Date().toISOString(),
  }
  saveInviteMetrics(next)
  return next
}

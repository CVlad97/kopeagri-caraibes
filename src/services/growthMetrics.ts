export type InviteType = 'lot_share' | 'neighbor' | 'buyer' | 'transporter'

export interface InviteMetrics {
  total: number
  lot_share: number
  neighbor: number
  buyer: number
  transporter: number
  queued_offline: number
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
  last_event_at: null,
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

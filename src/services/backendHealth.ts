import { getSyncStatus, hasCredentials } from './syncService'

export type BackendMode = 'local' | 'connected' | 'degraded'

export interface BackendHealth {
  mode: BackendMode
  hasSupabaseCreds: boolean
  latencyMs: number | null
  checkedAt: string
  lastSyncFromSupabase: string | null
  lastSyncToSupabase: string | null
  lastError: string | null
  pendingOfflineShares: number
}

const WA_QUEUE_KEY = 'kopeagri_wa_queue'

function getPendingOfflineShares(): number {
  try {
    const raw = localStorage.getItem(WA_QUEUE_KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  const sync = getSyncStatus()
  const creds = hasCredentials()
  const pendingOfflineShares = getPendingOfflineShares()

  if (!creds) {
    return {
      mode: 'local',
      hasSupabaseCreds: false,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      lastSyncFromSupabase: sync.lastSyncFromSupabase,
      lastSyncToSupabase: sync.lastSyncToSupabase,
      lastError: sync.lastError,
      pendingOfflineShares,
    }
  }

  const start = performance.now()
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
    const latencyMs = Math.round(performance.now() - start)

    return {
      mode: res.ok ? 'connected' : 'degraded',
      hasSupabaseCreds: true,
      latencyMs,
      checkedAt: new Date().toISOString(),
      lastSyncFromSupabase: sync.lastSyncFromSupabase,
      lastSyncToSupabase: sync.lastSyncToSupabase,
      lastError: sync.lastError || (res.ok ? null : `HTTP ${res.status}`),
      pendingOfflineShares,
    }
  } catch (error) {
    return {
      mode: 'degraded',
      hasSupabaseCreds: true,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      lastSyncFromSupabase: sync.lastSyncFromSupabase,
      lastSyncToSupabase: sync.lastSyncToSupabase,
      lastError: error instanceof Error ? error.message : 'Erreur réseau',
      pendingOfflineShares,
    }
  }
}

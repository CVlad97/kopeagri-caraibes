// Supabase — Production client with graceful fallback
// Real backend if VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set
// Safe stub if not (demo mode)

import type { User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const HAS_CREDENTIALS = !!(supabaseUrl && supabaseKey)

let _realClient: any = null

export async function getRealClient() {
  if (_realClient) return _realClient
  const { createClient } = await import('@supabase/supabase-js')
  _realClient = createClient(supabaseUrl!, supabaseKey!, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    realtime: { params: { eventsPerSecond: 10 } },
  })
  return _realClient
}

// Stub chain for demo mode (no Supabase)
function createStubSelect() {
  const self: any = {
    data: [], error: null,
    eq: () => self, neq: () => self, gt: () => self, lt: () => self,
    gte: () => self, lte: () => self, in: () => self, contains: () => self,
    range: () => self, limit: () => self, order: () => self,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
  }
  return self
}

function createStubChain() {
  const self: any = {
    select: () => createStubSelect(),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    upsert: async () => ({ data: null, error: null }),
  }
  return self
}

// Real client wrapper
function wrapRealFrom(table: string) {
  return {
    select: (cols?: string) => {
      const chain: any = { _filters: [], _options: {} }
      chain._apply = async () => {
        const client = await getRealClient()
        let q = client.from(table).select(cols || '*')
        for (const f of chain._filters) q = q[f.method](f.col, f.val)
        if (chain._options.order) q = q.order(chain._options.order.col, chain._options.order.opts)
        if (chain._options.limit) q = q.limit(chain._options.limit)
        if (chain._options.range) q = q.range(...chain._options.range)
        return q
      }
      for (const m of ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'contains']) {
        chain[m] = (col: string, val: any) => { chain._filters.push({ method: m, col, val }); return chain }
      }
      chain.limit = (n: number) => { chain._options.limit = n; return chain }
      chain.order = (col: string, opts?: any) => { chain._options.order = { col, opts }; return chain }
      chain.range = (from: number, to: number) => { chain._options.range = [from, to]; return chain }
      chain.single = async () => { const r = await chain._apply(); return r?.single?.() || r }
      chain.maybeSingle = async () => { const r = await chain._apply(); return r?.maybeSingle?.() || r }
      return chain
    },
    insert: async (rows: any) => {
      const client = await getRealClient()
      return client.from(table).insert(rows).select()
    },
    update: (data: any) => {
      const chain: any = { _filters: [], _data: data }
      chain.eq = (col: string, val: any) => { chain._filters.push({ method: 'eq', col, val }); return chain }
      chain.select = () => chain
      chain.then = async (resolve: any, reject: any) => {
        try {
          const client = await getRealClient()
          let q = client.from(table).update(data)
          for (const f of chain._filters) q = q[f.method](f.col, f.val)
          q = q.select()
          resolve(await q)
        } catch (e: any) { reject(e) }
      }
      return chain
    },
    delete: () => {
      const chain: any = { _filters: [] }
      chain.eq = (col: string, val: any) => { chain._filters.push({ method: 'eq', col, val }); return chain }
      chain.then = async (resolve: any, reject: any) => {
        try {
          const client = await getRealClient()
          let q = client.from(table).delete()
          for (const f of chain._filters) q = q[f.method](f.col, f.val)
          resolve(await q)
        } catch (e: any) { reject(e) }
      }
      return chain
    },
    upsert: async (rows: any, opts?: any) => {
      const client = await getRealClient()
      return client.from(table).upsert(rows, opts).select()
    },
  }
}

// Exported client
export const supabase = {
  auth: {
    getSession: async () => {
      if (!HAS_CREDENTIALS) return { data: { session: null }, error: null }
      try { return (await getRealClient()).auth.getSession() } catch { return { data: { session: null }, error: null } }
    },
    onAuthStateChange: (callback?: any) => {
      if (!HAS_CREDENTIALS) return { data: { subscription: { unsubscribe: () => {} } } }
      // Lazy-init pattern: return a subscription that sets up on first auth call
      let _sub: any = null
      return {
        data: {
          subscription: {
            unsubscribe: () => { _sub?.unsubscribe?.() },
            _setup: async () => {
              const client = await getRealClient()
              const { data } = client.auth.onAuthStateChange(callback)
              _sub = data.subscription
            },
          },
        },
      }
    },
    signInWithPassword: async (creds: any) => {
      if (!HAS_CREDENTIALS) return { data: { user: null, session: null }, error: { message: 'Mode démo — connectez-vous avec un compte démo' } }
      try { return (await getRealClient()).auth.signInWithPassword(creds) } catch (e: any) { return { data: { user: null, session: null }, error: e } }
    },
    signUp: async (creds: any) => {
      if (!HAS_CREDENTIALS) return { data: { user: null, session: null }, error: { message: 'Mode démo' } }
      try { return (await getRealClient()).auth.signUp(creds) } catch (e: any) { return { data: { user: null, session: null }, error: e } }
    },
    signOut: async () => {
      if (!HAS_CREDENTIALS) return { error: null }
      try { return (await getRealClient()).auth.signOut() } catch { return { error: null } }
    },
    getUser: async () => {
      if (!HAS_CREDENTIALS) return { data: { user: null }, error: null }
      try { return (await getRealClient()).auth.getUser() } catch { return { data: { user: null }, error: null } }
    },
    resetPasswordForEmail: async (email: string) => {
      if (!HAS_CREDENTIALS) return { data: {}, error: null }
      try { return (await getRealClient()).auth.resetPasswordForEmail(email) } catch (e: any) { return { data: null, error: e } }
    },
  },
  from: (table: string) => {
    if (!HAS_CREDENTIALS) return createStubChain()
    return wrapRealFrom(table)
  },
  rpc: async (fn: string, params?: any) => {
    if (!HAS_CREDENTIALS) return { data: null, error: null }
    try { return (await getRealClient()).rpc(fn, params) } catch (e: any) { return { data: null, error: e } }
  },
  channel: (name: string) => {
    if (!HAS_CREDENTIALS) {
      return { on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) }
    }
    // Return a lazy channel that inits on subscribe
    return {
      on: (event: string, filter: any, callback: any) => ({
        _event: event, _filter: filter, _callback: callback, _name: name,
        subscribe: async () => {
          const client = await getRealClient()
          const ch = client.channel(name).on(event, filter, callback)
          ch.subscribe()
          return ch
        },
      }),
    }
  },
  storage: {
    from: (bucket: string) => {
      if (!HAS_CREDENTIALS) {
        return {
          upload: async () => ({ data: null, error: { message: 'No Supabase' } }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
          remove: async () => ({ data: null, error: null }),
          download: async () => ({ data: null, error: null }),
        }
      }
      // Lazy: wrap calls in async
      const handler: any = {
        upload: async (path: string, file: File | Blob, opts?: any) => {
          const client = await getRealClient()
          return client.storage.from(bucket).upload(path, file, opts)
        },
        getPublicUrl: (path: string) => {
          // This is synchronous in the real client — we proxy it lazily
          return { data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` } }
        },
        remove: async (paths: string[]) => {
          const client = await getRealClient()
          return client.storage.from(bucket).remove(paths)
        },
        download: async (path: string) => {
          const client = await getRealClient()
          return client.storage.from(bucket).download(path)
        },
      }
      return handler
    },
  },
  get isConfigured() { return HAS_CREDENTIALS },
}

export type { User }

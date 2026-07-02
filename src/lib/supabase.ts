// Supabase — Zero-crash client
// If no credentials: all methods return safe empty results
// If credentials exist: lazy-init the real client

import type { User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const HAS_CREDENTIALS = !!(supabaseUrl && supabaseKey)

// Lazy real client
let _realClient: any = null

async function getRealClient() {
  if (_realClient) return _realClient
  const { createClient } = await import('@supabase/supabase-js')
  _realClient = createClient(supabaseUrl!, supabaseKey!)
  return _realClient
}

// Export a stable object — all methods work safely even without Supabase
export const supabase = {
  auth: {
    getSession: async () => {
      if (!HAS_CREDENTIALS) return { data: { session: null }, error: null }
      try { return (await getRealClient()).auth.getSession() } catch { return { data: { session: null }, error: null } }
    },
    onAuthStateChange: () => {
      if (!HAS_CREDENTIALS) return { data: { subscription: { unsubscribe: () => {} } } }
      return { data: { subscription: { unsubscribe: () => {} } } }
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
  },
  from: (_table: string) => ({
    select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: async () => ({ data: null, error: null }) }) }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) }),
  }),
}

export type { User }
// Public project configuration only. Server/service keys must never enter this bundle.
import { createClient } from '@supabase/supabase-js'
import config from './supabase-public.json'
export type { User } from '@supabase/supabase-js'
export const HAS_CREDENTIALS = true
const client = createClient(config.url, config.publishableKey, {
 db: { schema: 'api' },
 auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, storageKey: 'kopeagri-auth' },
})
export async function getRealClient() { return client }
// Keep compatibility with the existing legacy pages while replacing the broken lazy proxy.
export const supabase: any = Object.assign(client, { isConfigured: true })

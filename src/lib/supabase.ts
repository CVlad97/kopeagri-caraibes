import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: SupabaseClient

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  // Mock client pour mode démo — tous les appels retournent null
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: { persistSession: false },
  })
}

export { supabase }
// ===== SUPABASE SERVICE — Backend Pro avec fallback localStorage =====
// Si Supabase est configuré: toutes les opérations vont en BDD
// Si pas configuré: fallback transparent vers localStorage (mode démo)
import { supabase } from '../lib/supabase'

const HAS_SB = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

// ===== HELPER =====
async function sb(): Promise<any> {
  if (!HAS_SB) return null
  return supabase
}

// ===== PRODUCTEURS =====
export async function fetchProducteurs() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_producers') || '[]')
  const { data, error } = await s.from('producteurs').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchProducteurs:', error); return JSON.parse(localStorage.getItem('kopeagri_producers') || '[]') }
  return data
}

export async function createProducteur(item: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_producers') || '[]')
    const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    store.push(newItem)
    localStorage.setItem('kopeagri_producers', JSON.stringify(store))
    return newItem
  }
  const { data, error } = await s.from('producteurs').insert(item).select().single()
  if (error) { console.error('createProducteur:', error); throw error }
  return data
}

export async function updateProducteur(id: string, updates: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_producers') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return null
    store[idx] = { ...store[idx], ...updates }
    localStorage.setItem('kopeagri_producers', JSON.stringify(store))
    return store[idx]
  }
  const { data, error } = await s.from('producteurs').update(updates).eq('id', id).select().single()
  if (error) { console.error('updateProducteur:', error); throw error }
  return data
}

export async function toggleProducteurActive(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_producers') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store[idx].active = !store[idx].active
    localStorage.setItem('kopeagri_producers', JSON.stringify(store))
    return store[idx].active
  }
  const { data: current } = await s.from('producteurs').select('active').eq('id', id).single()
  if (!current) return false
  const { data, error } = await s.from('producteurs').update({ active: !current.active }).eq('id', id).select().single()
  if (error) throw error
  return data.active
}

export async function deleteProducteur(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_producers') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store.splice(idx, 1)
    localStorage.setItem('kopeagri_producers', JSON.stringify(store))
    return true
  }
  const { error } = await s.from('producteurs').delete().eq('id', id)
  if (error) throw error
  return true
}

// ===== LOGISTICS =====
export async function fetchLogistics() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]')
  const { data, error } = await s.from('logistics_providers').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchLogistics:', error); return JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]') }
  return data
}

export async function createLogistics(item: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]')
    const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    store.push(newItem)
    localStorage.setItem('kopeagri_logistics', JSON.stringify(store))
    return newItem
  }
  const { data, error } = await s.from('logistics_providers').insert(item).select().single()
  if (error) throw error
  return data
}

export async function updateLogistics(id: string, updates: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return null
    store[idx] = { ...store[idx], ...updates }
    localStorage.setItem('kopeagri_logistics', JSON.stringify(store))
    return store[idx]
  }
  const { data, error } = await s.from('logistics_providers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function toggleLogisticsActive(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store[idx].active = !store[idx].active
    localStorage.setItem('kopeagri_logistics', JSON.stringify(store))
    return store[idx].active
  }
  const { data: current } = await s.from('logistics_providers').select('active').eq('id', id).single()
  if (!current) return false
  const { data, error } = await s.from('logistics_providers').update({ active: !current.active }).eq('id', id).select().single()
  if (error) throw error
  return data.active
}

export async function deleteLogistics(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_logistics') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store.splice(idx, 1)
    localStorage.setItem('kopeagri_logistics', JSON.stringify(store))
    return true
  }
  const { error } = await s.from('logistics_providers').delete().eq('id', id)
  if (error) throw error
  return true
}

// ===== DISTRIBUTORS =====
export async function fetchDistributors() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]')
  const { data, error } = await s.from('distributors').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchDistributors:', error); return JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]') }
  return data
}

export async function createDistributor(item: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]')
    const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    store.push(newItem)
    localStorage.setItem('kopeagri_distributors', JSON.stringify(store))
    return newItem
  }
  const { data, error } = await s.from('distributors').insert(item).select().single()
  if (error) throw error
  return data
}

export async function updateDistributor(id: string, updates: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return null
    store[idx] = { ...store[idx], ...updates }
    localStorage.setItem('kopeagri_distributors', JSON.stringify(store))
    return store[idx]
  }
  const { data, error } = await s.from('distributors').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function toggleDistributorActive(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store[idx].active = !store[idx].active
    localStorage.setItem('kopeagri_distributors', JSON.stringify(store))
    return store[idx].active
  }
  const { data: current } = await s.from('distributors').select('active').eq('id', id).single()
  if (!current) return false
  const { data, error } = await s.from('distributors').update({ active: !current.active }).eq('id', id).select().single()
  if (error) throw error
  return data.active
}

export async function deleteDistributor(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_distributors') || '[]')
    const idx = store.findIndex((e: any) => e.id === id)
    if (idx === -1) return false
    store.splice(idx, 1)
    localStorage.setItem('kopeagri_distributors', JSON.stringify(store))
    return true
  }
  const { error } = await s.from('distributors').delete().eq('id', id)
  if (error) throw error
  return true
}

// ===== RFQ =====
export async function fetchRFQs() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_rfq') || '[]')
  const { data, error } = await s.from('rfq').select('*, rfq_partners(*)').order('created_at', { ascending: false })
  if (error) { console.error('fetchRFQs:', error); return JSON.parse(localStorage.getItem('kopeagri_rfq') || '[]') }
  return data
}

export async function createRFQ(item: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_rfq') || '[]')
    const newItem = { ...item, id: crypto.randomUUID(), status: 'brouillon', partenaires: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    store.push(newItem)
    localStorage.setItem('kopeagri_rfq', JSON.stringify(store))
    return newItem
  }
  const { partenaires, ...rfqData } = item
  const { data, error } = await s.from('rfq').insert(rfqData).select().single()
  if (error) throw error
  // Insert partners if provided
  if (partenaires?.length) {
    const partners = partenaires.map((p: any) => ({ ...p, rfq_id: data.id }))
    await s.from('rfq_partners').insert(partners)
  }
  return data
}

// ===== BILLING DOCUMENTS =====
export async function fetchBillingDocs() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_documents') || '[]')
  const { data, error } = await s.from('billing_documents').select('*, billing_lines(*)').order('created_at', { ascending: false })
  if (error) { console.error('fetchBillingDocs:', error); return JSON.parse(localStorage.getItem('kopeagri_documents') || '[]') }
  return data
}

export async function createBillingDocument(doc: any) {
  const s = await sb()
  if (!s) {
    const newDoc = { ...doc, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const store = JSON.parse(localStorage.getItem('kopeagri_documents') || '[]')
    store.unshift(newDoc)
    localStorage.setItem('kopeagri_documents', JSON.stringify(store))
    return newDoc
  }
  // Get next reference from RPC
  const { data: ref } = await s.rpc('get_document_ref', { p_type: doc.type })
  const { lines, ...docData } = doc
  const { data, error } = await s.from('billing_documents').insert({
    ...docData,
    reference: ref,
  }).select().single()
  if (error) throw error
  // Insert lines
  if (lines?.length) {
    const dbLines = lines.map((l: any, i: number) => ({
      ...l,
      document_id: data.id,
      sort_order: i,
    }))
    await s.from('billing_lines').insert(dbLines)
  }
  return { ...data, lines: lines || [] }
}

export async function updateBillingDocument(id: string, updates: any) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_documents') || '[]')
    const idx = store.findIndex((d: any) => d.id === id)
    if (idx === -1) return
    store[idx] = { ...store[idx], ...updates }
    localStorage.setItem('kopeagri_documents', JSON.stringify(store))
    return
  }
  const { error } = await s.from('billing_documents').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteBillingDocument(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_documents') || '[]').filter((d: any) => d.id !== id)
    localStorage.setItem('kopeagri_documents', JSON.stringify(store))
    return
  }
  const { error } = await s.from('billing_documents').delete().eq('id', id)
  if (error) throw error
}

// ===== QONTO =====
export async function fetchQontoTransactions() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_qonto_tx') || '[]')
  const { data, error } = await s.from('qonto_transactions').select('*').order('date', { ascending: false })
  if (error) { console.error('fetchQonto:', error); return JSON.parse(localStorage.getItem('kopeagri_qonto_tx') || '[]') }
  return data
}

export async function getQontoBalance() {
  const s = await sb()
  if (!s) {
    const txs = JSON.parse(localStorage.getItem('kopeagri_qonto_tx') || '[]')
    const income = txs.filter((t: any) => t.amount > 0).reduce((s: number, t: any) => s + t.amount, 0)
    const expenses = Math.abs(txs.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + t.amount, 0))
    return { income: Math.round(income * 100) / 100, expenses: Math.round(expenses * 100) / 100, balance: Math.round((income - expenses) * 100) / 100 }
  }
  const { data, error } = await s.from('qonto_balance').select('*').eq('owner_id', (await s.auth.getUser())?.data?.user?.id).single()
  if (error) {
    // Fallback: compute from transactions
    const txs = await fetchQontoTransactions()
    const income = txs.filter((t: any) => t.amount > 0 && t.status === 'completed').reduce((s: number, t: any) => s + t.amount, 0)
    const expenses = Math.abs(txs.filter((t: any) => t.amount < 0 && t.status === 'completed').reduce((s: number, t: any) => s + t.amount, 0))
    return { income, expenses, balance: income - expenses }
  }
  return data
}

// ===== SUBSCRIPTIONS =====
export async function fetchSubscriptions() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_subscriptions_v1') || '[]')
  const { data, error } = await s.from('subscriptions').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchSubs:', error); return JSON.parse(localStorage.getItem('kopeagri_subscriptions_v1') || '[]') }
  return data
}

export async function createSubscription(sub: any) {
  const s = await sb()
  if (!s) {
    const newItem = { ...sub, id: crypto.randomUUID(), reference: `KPA-${Date.now().toString(36).toUpperCase()}` }
    const store = JSON.parse(localStorage.getItem('kopeagri_subscriptions_v1') || '[]')
    store.push(newItem)
    localStorage.setItem('kopeagri_subscriptions_v1', JSON.stringify(store))
    return newItem
  }
  const { data, error } = await s.from('subscriptions').insert(sub).select().single()
  if (error) throw error
  return data
}

// ===== COMMISSIONS =====
export async function fetchCommissions() {
  const s = await sb()
  if (!s) return JSON.parse(localStorage.getItem('kopeagri_commissions_v1') || '[]')
  const { data, error } = await s.from('commissions').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchCommissions:', error); return JSON.parse(localStorage.getItem('kopeagri_commissions_v1') || '[]') }
  return data
}

export async function markCommissionPaid(id: string) {
  const s = await sb()
  if (!s) {
    const store = JSON.parse(localStorage.getItem('kopeagri_commissions_v1') || '[]')
    const idx = store.findIndex((c: any) => c.id === id)
    if (idx >= 0) {
      store[idx].status = 'payee'
      store[idx].paid_at = new Date().toISOString()
      localStorage.setItem('kopeagri_commissions_v1', JSON.stringify(store))
    }
    return
  }
  const { error } = await s.from('commissions').update({ status: 'payee', paid_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

// ===== NOTIFICATIONS =====
export async function fetchNotifications() {
  const s = await sb()
  if (!s) return []
  const { data, error } = await s.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
  if (error) { console.error('fetchNotifs:', error); return [] }
  return data
}

export async function markNotificationRead(id: string) {
  const s = await sb()
  if (!s) return
  await s.from('notifications').update({ read_at: new Date().toISOString(), status: 'lue' }).eq('id', id)
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  const s = await sb()
  if (!s) return null
  const { data, error } = await s.rpc('get_dashboard_stats')
  if (error) { console.error('getDashboardStats:', error); return null }
  return data
}

// ===== REAL-TIME SUBSCRIPTIONS =====
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  if (!HAS_SB) return () => {}
  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
  return () => { channel.unsubscribe() }
}

// ===== STORAGE =====
export async function uploadFile(bucket: string, path: string, file: File) {
  const s = await sb()
  if (!s) return null
  const { data, error } = await s.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) { console.error('uploadFile:', error); return null }
  const { data: urlData } = s.storage.from(bucket).getPublicUrl(path)
  return urlData.publicUrl
}

export async function getPublicUrl(bucket: string, path: string) {
  const s = await sb()
  if (!s) return ''
  const { data } = s.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

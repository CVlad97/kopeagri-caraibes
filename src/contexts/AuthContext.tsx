import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'
import { autoSyncOnLogin, hasCredentials, syncToSupabase } from '../services/syncService'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, fullName: string, role: string, commune: string, phone: string) => Promise<string | null>
  signOut: () => Promise<void>
  useDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USERS: Record<string, Profile & { password: string }> = {
  'producteur@demo.fr': {
    id: 'demo-prod-1',
    email: 'producteur@demo.fr',
    full_name: 'Jean-Marie Larcher',
    role: 'producteur',
    commune: 'Le Morne-Rouge',
    phone: '0696 12 34 56',
    avatar_url: null,
    bio: 'Producteur de bananes et fruits tropicaux depuis 15 ans',
    created_at: new Date().toISOString(),
    password: 'demo1234',
  },
  'cooperative@demo.fr': {
    id: 'demo-coop-1',
    email: 'cooperative@demo.fr',
    full_name: 'Coopérative Nord Atlantique',
    role: 'cooperative',
    commune: 'Sainte-Marie',
    phone: '0596 87 65 43',
    avatar_url: null,
    bio: 'Coopérative regroupant 45 producteurs du nord Martinique',
    created_at: new Date().toISOString(),
    password: 'demo1234',
  },
  'acheteur@demo.fr': {
    id: 'demo-buy-1',
    email: 'acheteur@demo.fr',
    full_name: 'Sophie Galbas',
    role: 'acheteur_b2b',
    commune: 'Fort-de-France',
    phone: '0696 98 76 54',
    avatar_url: null,
    bio: "Chef d'achat pour un groupe hôtelier",
    created_at: new Date().toISOString(),
    password: 'demo1234',
  },
  'transporteur@demo.fr': {
    id: 'demo-trans-1',
    email: 'transporteur@demo.fr',
    full_name: 'Marc Férand',
    role: 'transporteur',
    commune: 'Le Lamentin',
    phone: '0696 55 44 33',
    avatar_url: null,
    bio: 'Transporteur frigorifique, tournées Nord et Sud',
    created_at: new Date().toISOString(),
    password: 'demo1234',
  },
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await (supabase.from('profiles') as any).select('*').eq('id', userId).single()
      if (data) setProfile(data as Profile)
    } catch {
      // No Supabase — ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then((result: any) => {
      const session = result?.data?.session
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: { subscription } } = supabase.auth.onAuthStateChange()
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    // Check demo accounts first
    if (DEMO_USERS[email] && password === DEMO_USERS[email].password) {
      setUser({ id: DEMO_USERS[email].id, email: DEMO_USERS[email].email })
      setProfile({
        id: DEMO_USERS[email].id,
        email: DEMO_USERS[email].email,
        full_name: DEMO_USERS[email].full_name,
        role: DEMO_USERS[email].role as Profile['role'],
        commune: DEMO_USERS[email].commune,
        phone: DEMO_USERS[email].phone,
        avatar_url: null,
        bio: DEMO_USERS[email].bio,
        created_at: DEMO_USERS[email].created_at,
      })
      setIsDemo(true)
      // Auto-sync on login if Supabase is configured
      if (hasCredentials()) autoSyncOnLogin()
      return null
    }

    // Try real Supabase
    const result: any = await (supabase.auth as any).signInWithPassword({ email, password })
    if (!result?.error && result?.data?.user) {
      // Auto-sync on login after real Supabase auth
      if (hasCredentials()) autoSyncOnLogin()
    }
    return result?.error?.message || null
  }

  const signUp = async (email: string, password: string, fullName: string, role: string, commune: string, phone: string): Promise<string | null> => {
    const result: any = await (supabase.auth as any).signUp({
      email, password,
      options: { data: { full_name: fullName, role, commune, phone } },
    })
    if (result?.error) return result.error.message || 'Erreur'
    // Push new profile data to Supabase after successful signup
    if (hasCredentials()) syncToSupabase()
    return null
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setIsDemo(false)
    await supabase.auth.signOut()
  }

  const useDemoMode = () => {
    setUser({ id: 'demo-prod-1', email: 'producteur@demo.fr' })
    setProfile(DEMO_USERS['producteur@demo.fr'])
    setIsDemo(true)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, signIn, signUp, signOut, useDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
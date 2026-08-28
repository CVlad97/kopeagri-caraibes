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
  demoEnabled: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, fullName: string, role: string, commune: string, phone: string) => Promise<string | null>
  requestMagicLink: (email: string, fullName?: string, role?: string, commune?: string, phone?: string) => Promise<string | null>
  signOut: () => Promise<void>
  useDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const isDemoExplicitlyEnabled = () => {
  if (typeof window === 'undefined') return false
  try {
    const qp = new URLSearchParams(window.location.search)
    if (qp.get('demo') === '1') {
      localStorage.setItem('kopeagri_demo_enabled', '1')
      return true
    }
    return localStorage.getItem('kopeagri_demo_enabled') === '1'
  } catch {
    return false
  }
}

const DEMO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true' || isDemoExplicitlyEnabled()

const makeDemoProfile = (profile: Omit<Profile, 'siret' | 'rib' | 'company_name' | 'address' | 'latitude' | 'longitude' | 'active' | 'onboarding_complete' | 'updated_at'> & { password: string }): Profile & { password: string } => ({
  ...profile,
  siret: null,
  rib: null,
  company_name: null,
  address: null,
  latitude: null,
  longitude: null,
  active: true,
  onboarding_complete: true,
  updated_at: profile.created_at,
})

const DEMO_USERS: Record<string, Profile & { password: string }> = {
  'producteur@demo.fr': makeDemoProfile({
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
  }),
  'gie@demo.fr': makeDemoProfile({
    id: 'demo-gie-1',
    email: 'gie@demo.fr',
    full_name: 'GIE Nord Atlantique',
    role: 'gie',
    commune: 'Sainte-Marie',
    phone: '0596 87 65 43',
    avatar_url: null,
    bio: 'GIE regroupant 45 producteurs du nord Martinique',
    created_at: new Date().toISOString(),
    password: 'demo1234',
  }),
  'acheteur@demo.fr': makeDemoProfile({
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
  }),
  'transporteur@demo.fr': makeDemoProfile({
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
  }),
  'pecheur@demo.fr': makeDemoProfile({
    id: 'demo-pech-1',
    email: 'pecheur@demo.fr',
    full_name: 'Patrick Létang',
    role: 'pecheur',
    commune: 'Le Marin',
    phone: '0696 77 88 99',
    avatar_url: null,
    bio: "Pêcheur artisanal, thazard et dorade, port du Marin, 25 ans d’expérience Caraïbes",
    created_at: new Date().toISOString(),
    password: 'demo1234',
  }),
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const fetchProfile = async (userId: string) => {
    try {
      const result = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (result.data) setProfile(result.data as Profile)
    } catch {
      // No Supabase configured or no profile row yet
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      const authSession = session as { user?: { id: string; email?: string | null } } | null
      if (authSession?.user) {
        setUser({ id: authSession.user.id, email: authSession.user.email || '' })
        fetchProfile(authSession.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (DEMO_ENABLED && DEMO_USERS[email] && password === DEMO_USERS[email].password) {
      setUser({ id: DEMO_USERS[email].id, email: DEMO_USERS[email].email })
      setProfile(DEMO_USERS[email])
      setIsDemo(true)
      if (hasCredentials()) autoSyncOnLogin()
      return null
    }

    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error && result.data.user && hasCredentials()) autoSyncOnLogin()
    return result.error?.message || null
  }

  const requestMagicLink = async (email: string, fullName?: string, role?: string, commune?: string, phone?: string): Promise<string | null> => {
    const metadata = {
      full_name: fullName || null,
      role: role || null,
      commune: commune || null,
      phone: phone || null,
    }
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: metadata,
      },
    })
    return result.error?.message || null
  }

  const signUp = async (email: string, password: string, fullName: string, role: string, commune: string, phone: string): Promise<string | null> => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, commune, phone } },
    })
    if (result.error) return result.error.message || 'Erreur'
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
    if (!DEMO_ENABLED) return
    setUser({ id: 'demo-prod-1', email: 'producteur@demo.fr' })
    setProfile(DEMO_USERS['producteur@demo.fr'])
    setIsDemo(true)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, demoEnabled: DEMO_ENABLED, signIn, signUp, requestMagicLink, signOut, useDemoMode }}>
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

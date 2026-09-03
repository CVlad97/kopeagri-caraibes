import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, profile, loading, demoEnabled, useDemoMode } = useAuth()

  // Accès démo public: si la démo est activée mais aucun user connecté,
  // on bascule automatiquement en mode démo au lieu de renvoyer au login.
  useEffect(() => {
    if (!loading && !user && demoEnabled) {
      useDemoMode()
    }
  }, [loading, user, demoEnabled, useDemoMode])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user && demoEnabled) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default ProtectedRoute

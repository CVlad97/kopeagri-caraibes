import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ALLOWED_DEMO_PATHS = new Set([
  '/dashboard', '/marketplace', '/seafood', '/qr-codes', '/plots', '/resources',
  '/logistics', '/producers', '/orders', '/sell-now', '/calendar', '/consolidation',
])

const DemoAccessPage: React.FC = () => {
  const { enterDemoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const requested = new URLSearchParams(location.search).get('next') || '/dashboard'
    const target = ALLOWED_DEMO_PATHS.has(requested) ? requested : '/dashboard'
    enterDemoMode()
    navigate(target, { replace: true })
  }, [enterDemoMode, location.search, navigate])

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: 16, color: '#555' }}>Ouverture de la démo…</p>
    </div>
  )
}

export default DemoAccessPage

import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DemoAccessPage: React.FC = () => {
  const { demoEnabled, useDemoMode: enterDemoMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!demoEnabled) return
    enterDemoMode()
    navigate('/dashboard', { replace: true })
  }, [demoEnabled, enterDemoMode, navigate])

  if (!demoEnabled) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Démo</h1>
          <p>La démo n’est pas activée sur cette session.</p>
          <p>
            Ouvrez: <code>/demo?demo=1</code>
          </p>
          <Link to="/login?demo=1" className="btn btn-primary btn-full">Activer la démo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )
}

export default DemoAccessPage

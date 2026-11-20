import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DemoAccessPage: React.FC = () => {
  const { enterDemoMode } = useAuth()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    // Active la démo (localStorage + state) puis connecte le profil démo
    if (started.current) return
    started.current = true
    enterDemoMode()
    const next = new URLSearchParams(window.location.search).get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') && next !== '/demo' ? next : '/dashboard'
    navigate(safeNext, { replace: true })
  }, [enterDemoMode, navigate])

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: 16, color: '#555' }}>Chargement de la démo…</p>
    </div>
  )
}

export default DemoAccessPage

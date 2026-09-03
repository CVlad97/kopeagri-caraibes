import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DemoAccessPage: React.FC = () => {
  const { useDemoMode: enterDemoMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Active la démo (localStorage + state) puis connecte le profil démo
    enterDemoMode()
    navigate('/dashboard', { replace: true })
  }, [enterDemoMode, navigate])

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: 16, color: '#555' }}>Chargement de la démo…</p>
    </div>
  )
}

export default DemoAccessPage

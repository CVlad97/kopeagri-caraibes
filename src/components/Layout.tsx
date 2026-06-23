import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Leaf, Home, Map, Package, Truck, BarChart3, LogOut, Menu, X, ShoppingCart, Grid, QrCode, Bell
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Tableau de bord', icon: Home, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/plots', label: 'Parcelles', icon: Map, roles: ['producteur', 'proprietaire', 'cooperative'] },
  { path: '/resources', label: 'Ressources', icon: Grid, roles: ['producteur', 'proprietaire', 'cooperative', 'transporteur'] },
  { path: '/lots', label: 'Lots', icon: Package, roles: ['producteur', 'cooperative', 'acheteur_b2b'] },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart, roles: ['producteur', 'cooperative', 'acheteur_b2b'] },
  { path: '/logistics', label: 'Logistique', icon: Truck, roles: ['transporteur', 'cooperative', 'producteur'] },
  { path: '/qr-codes', label: 'QR Codes', icon: QrCode, roles: ['producteur', 'cooperative'] },
  { path: '/admin', label: 'Admin', icon: BarChart3, roles: ['cooperative', 'institution'] },
]

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut, isDemo } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const roleLabel: Record<string, string> = {
    producteur: 'Producteur',
    proprietaire: 'Propriétaire terrain',
    cooperative: 'Coopérative / Admin',
    acheteur_b2b: 'Acheteur B2B',
    transporteur: 'Transporteur',
    institution: 'Institution',
  }
  const roleColor: Record<string, string> = {
    producteur: 'badge-green',
    proprietaire: 'badge-blue',
    cooperative: 'badge-gold',
    acheteur_b2b: 'badge-purple',
    transporteur: 'badge-orange',
    institution: 'badge-teal',
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-left">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="logo">
            <Leaf size={28} className="logo-icon" />
            <span className="logo-text">KopéAgri</span>
          </Link>
        </div>
        <div className="topbar-right">
          {profile && (
            <div className="topbar-user">
              <Bell size={20} className="icon-muted" />
              <div className="user-info">
                <span className="user-name">{profile.full_name}</span>
                <span className={`badge ${roleColor[profile.role] || 'badge-green'}`}>{roleLabel[profile.role] || profile.role}</span>
              </div>
              <div className="avatar">{profile.full_name.charAt(0).toUpperCase()}</div>
            </div>
          )}
        </div>
      </header>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Leaf size={24} className="logo-icon" />
          <span className="logo-text">KopéAgri</span>
        </div>
        {isDemo && <div className="demo-banner">🧪 Mode démo</div>}
        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(item => item.roles.includes(profile?.role || '')).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item clickable" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
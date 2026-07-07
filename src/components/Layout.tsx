import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Leaf, Home, LogOut, Menu, X, Bell, Users, Truck, ShoppingCart,
  BarChart3, MessageCircle, Send, Star, FileText, MapPin, Wrench, Package, QrCode, Globe, CalendarDays
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Tableau de bord', icon: Home, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/producers', label: 'Producteurs', icon: Users, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'institution'] },
  { path: '/plots', label: 'Parcelles', icon: MapPin, roles: ['producteur', 'proprietaire', 'cooperative', 'institution'] },
  { path: '/resources', label: 'Ressources', icon: Wrench, roles: ['producteur', 'proprietaire', 'cooperative', 'transporteur', 'institution'] },
  { path: '/lots', label: 'Lots & Marché', icon: Package, roles: ['producteur', 'cooperative', 'acheteur_b2b', 'institution'] },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart, roles: ['producteur', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/logistics', label: 'Transporteurs', icon: Truck, roles: ['producteur', 'proprietaire', 'cooperative', 'transporteur', 'institution'] },
  { path: '/distributors', label: 'Distributeurs', icon: ShoppingCart, roles: ['producteur', 'cooperative', 'acheteur_b2b', 'institution'] },
  { path: '/appels-offre', label: 'Appels d\'Offre', icon: Send, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/qr-codes', label: 'Traçabilité QR', icon: QrCode, roles: ['producteur', 'cooperative', 'acheteur_b2b', 'institution'] },
  { path: '/export', label: 'Export', icon: Globe, roles: ['producteur', 'cooperative', 'acheteur_b2b', 'institution'] },
  { path: '/calendar', label: 'Calendrier saisonnier', icon: CalendarDays, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/adhesion', label: 'Adhésion', icon: Star, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
  { path: '/facturation', label: 'Facturation', icon: FileText, roles: ['producteur', 'proprietaire', 'cooperative', 'acheteur_b2b', 'transporteur', 'institution'] },
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

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(profile?.role || ''))

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
          {visibleItems.map(item => (
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
          <a
            href="https://wa.me/596696000000?text=Bonjour%20KopéAgri%2C%20j%27ai%20besoin%20d%27aide"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ color: '#25D366' }}
          >
            <MessageCircle size={20} />
            <span>Aide WhatsApp</span>
          </a>
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

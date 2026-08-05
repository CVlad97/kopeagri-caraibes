import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Leaf, Home, LogOut, Menu, X, Bell, Users, Truck, ShoppingCart,
  BarChart3, MessageCircle, Send, Star, FileText, MapPin, Wrench, Package, QrCode, Globe, CalendarDays, Layers, Download, Moon, Sun,
  Handshake, CreditCard, Store, Settings, FileCheck, Bot, Scale, Waves
} from 'lucide-react'
import { getUnreadCount } from '../pages/NotificationsPage'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Tableau de bord', icon: Home, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/producers', label: 'Producteurs', icon: Users, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/seafood', label: 'Marché de la Pêche', icon: Waves, roles: ['producteur', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/plots', label: 'Parcelles', icon: MapPin, roles: ['producteur', 'proprietaire', 'gie', 'institution', 'pecheur'] },
  { path: '/resources', label: 'Ressources', icon: Wrench, roles: ['producteur', 'proprietaire', 'gie', 'transporteur', 'institution', 'pecheur'] },
  { path: '/lots', label: 'Lots & Marché', icon: Package, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart, roles: ['producteur', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/logistics', label: 'Transporteurs', icon: Truck, roles: ['producteur', 'proprietaire', 'gie', 'transporteur', 'institution', 'pecheur'] },
  { path: '/distributors', label: 'Distributeurs', icon: ShoppingCart, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/appels-offre', label: 'Appels d\'Offre', icon: Send, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/qr-codes', label: 'Traçabilité QR', icon: QrCode, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/consolidation', label: 'Consolidation', icon: Layers, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/export', label: 'Export', icon: Globe, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/calendar', label: 'Calendrier saisonnier', icon: CalendarDays, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/adhesion', label: 'Adhésion', icon: Star, roles: ['producteur', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/facturation', label: 'Facturation', icon: FileText, roles: ['producteur', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/admin', label: 'Admin', icon: BarChart3, roles: ['gie', 'institution', 'pecheur'] },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/export-data', label: 'Export données', icon: Download, roles: ['gie', 'institution', 'pecheur'] },
  { path: '/partners', label: 'Partenaires', icon: Handshake, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/pricing', label: 'Tarification', icon: CreditCard, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/marketplace', label: 'Marketplace', icon: Store, roles: ['producteur', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
  { path: '/erp', label: 'ERP / CRM', icon: Settings, roles: ['gie', 'institution', 'pecheur'] },
  { path: '/e-invoicing', label: 'Fact. électronique', icon: FileCheck, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/ai-arbitrage', label: 'IA Arbitrage', icon: Bot, roles: ['producteur', 'gie', 'acheteur_b2b', 'institution', 'pecheur'] },
  { path: '/gie', label: 'GIE Juridique', icon: Scale, roles: ['producteur', 'proprietaire', 'gie', 'acheteur_b2b', 'transporteur', 'institution', 'pecheur'] },
]

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut, isDemo } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('kopeagri_dark') === 'true')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [dark])

  useEffect(() => {
    setUnread(getUnreadCount())
    const interval = setInterval(() => setUnread(getUnreadCount()), 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('kopeagri_dark', String(next))
    if (next) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const roleLabel: Record<string, string> = {
    producteur: 'Producteur',
    proprietaire: 'Propriétaire terrain',
    gie: 'GIE / Admin',
    acheteur_b2b: 'Acheteur B2B',
    transporteur: 'Transporteur',
    institution: 'Institution',
    pecheur: 'Pêcheur / Seafood',
  }
  const roleColor: Record<string, string> = {
    producteur: 'badge-green',
    proprietaire: 'badge-blue',
    gie: 'badge-gold',
    acheteur_b2b: 'badge-purple',
    transporteur: 'badge-orange',
    institution: 'badge-teal',
    pecheur: 'badge-blue',
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
              <button
                className="topbar-bell"
                onClick={() => navigate('/notifications')}
                title="Notifications"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </button>
              <button
                className="topbar-dark-toggle"
                onClick={toggleDark}
                title={dark ? 'Mode clair' : 'Mode sombre'}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
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

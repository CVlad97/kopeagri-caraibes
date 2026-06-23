import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PlotsPage from './pages/PlotsPage'
import ResourcesPage from './pages/ResourcesPage'
import LotsPage from './pages/LotsPage'
import OrdersPage from './pages/OrdersPage'
import LogisticsPage from './pages/LogisticsPage'
import QRCodesPage from './pages/QRCodesPage'
import AdminPage from './pages/AdminPage'

const routerBasename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

const ProtectedLayout: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/plots" element={<ProtectedLayout roles={['producteur', 'proprietaire', 'cooperative']}><PlotsPage /></ProtectedLayout>} />
          <Route path="/resources" element={<ProtectedLayout roles={['producteur', 'proprietaire', 'cooperative', 'transporteur']}><ResourcesPage /></ProtectedLayout>} />
          <Route path="/lots" element={<ProtectedLayout roles={['producteur', 'cooperative', 'acheteur_b2b']}><LotsPage /></ProtectedLayout>} />
          <Route path="/orders" element={<ProtectedLayout roles={['producteur', 'cooperative', 'acheteur_b2b']}><OrdersPage /></ProtectedLayout>} />
          <Route path="/logistics" element={<ProtectedLayout roles={['transporteur', 'cooperative', 'producteur']}><LogisticsPage /></ProtectedLayout>} />
          <Route path="/qr-codes" element={<ProtectedLayout roles={['producteur', 'cooperative']}><QRCodesPage /></ProtectedLayout>} />
          <Route path="/admin" element={<ProtectedLayout roles={['cooperative', 'institution']}><AdminPage /></ProtectedLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

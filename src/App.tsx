import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import OnboardingPage from './pages/OnboardingPage'
import AppelOffrePage from './pages/AppelOffrePage'
import AdhesionPage from './pages/AdhesionPage'
import Dashboard from './pages/Dashboard'
import ProducersPage from './pages/ProducersPage'
import LogisticsPage from './pages/LogisticsPage'
import DistributorsPage from './pages/DistributorsPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/producers" element={<ProtectedRoute><Layout><ProducersPage /></Layout></ProtectedRoute>} />
          <Route path="/logistics" element={<ProtectedRoute><Layout><LogisticsPage /></Layout></ProtectedRoute>} />
          <Route path="/distributors" element={<ProtectedRoute><Layout><DistributorsPage /></Layout></ProtectedRoute>} />
          <Route path="/appels-offre" element={<ProtectedRoute><Layout><AppelOffrePage /></Layout></ProtectedRoute>} />
          <Route path="/adhesion" element={<ProtectedRoute><Layout><AdhesionPage /></Layout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

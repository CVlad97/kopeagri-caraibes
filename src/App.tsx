import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

/* Lazy load all non-critical pages — reduces initial bundle for slow rural connections */
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProducersPage = lazy(() => import('./pages/ProducersPage'))
const LogisticsPage = lazy(() => import('./pages/LogisticsPage'))
const DistributorsPage = lazy(() => import('./pages/DistributorsPage'))
const AppelOffrePage = lazy(() => import('./pages/AppelOffrePage'))
const AdhesionPage = lazy(() => import('./pages/AdhesionPage'))
const FacturationPage = lazy(() => import('./pages/FacturationPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ExportPage = lazy(() => import('./pages/ExportPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

/* Skeleton fallback — gives instant perceived speed */
function PageSkeleton() {
  return (
    <div className="page" style={{ padding: '28px 18px' }}>
      <div className="skeleton skeleton-text" style={{ width: '200px', height: '28px', marginBottom: '20px' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '10px' }} />
      <div className="skeleton skeleton-text short" style={{ marginBottom: '28px' }} />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <AuthProvider>
        <Suspense fallback={<PageSkeleton />}>
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
            <Route path="/facturation" element={<ProtectedRoute><Layout><FacturationPage /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><Layout><ExportPage /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

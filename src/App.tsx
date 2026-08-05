import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import NotificationsPage from './pages/NotificationsPage'

/* Lazy load all non-critical pages — reduces initial bundle for slow rural connections */
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProducersPage = lazy(() => import('./pages/ProducersPage'))
const LogisticsPage = lazy(() => import('./pages/LogisticsPage'))
const DistributorsPage = lazy(() => import('./pages/DistributorsPage'))
const PlotsPage = lazy(() => import('./pages/PlotsPage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const LotsPage = lazy(() => import('./pages/LotsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AppelOffrePage = lazy(() => import('./pages/AppelOffrePage'))
const AdhesionPage = lazy(() => import('./pages/AdhesionPage'))
const FacturationPage = lazy(() => import('./pages/FacturationPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ExportPage = lazy(() => import('./pages/ExportPage'))
const SeasonalCalendarPage = lazy(() => import('./pages/SeasonalCalendarPage'))
const QRCodesPage = lazy(() => import('./pages/QRCodesPage'))
const ConsolidationPage = lazy(() => import('./pages/ConsolidationPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const GiePage = lazy(() => import('./pages/GiePage'))
// NotificationsPage is statically imported by Layout.tsx (getUnreadCount) — no lazy split possible
const ExportDataPage = lazy(() => import('./pages/ExportDataPage'))
const AiArbitragePage = lazy(() => import('./pages/AiArbitragePage'))
const PartnersPage = lazy(() => import('./pages/PartnersPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const ErpPage = lazy(() => import('./pages/ErpPage'))
const EInvoicingPage = lazy(() => import('./pages/EInvoicingPage'))

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
            <Route path="/plots" element={<ProtectedRoute><Layout><PlotsPage /></Layout></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Layout><ResourcesPage /></Layout></ProtectedRoute>} />
            <Route path="/lots" element={<ProtectedRoute><Layout><LotsPage /></Layout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
            <Route path="/appels-offre" element={<ProtectedRoute><Layout><AppelOffrePage /></Layout></ProtectedRoute>} />
            <Route path="/adhesion" element={<ProtectedRoute><Layout><AdhesionPage /></Layout></ProtectedRoute>} />
            <Route path="/facturation" element={<ProtectedRoute><Layout><FacturationPage /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><Layout><ExportPage /></Layout></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Layout><SeasonalCalendarPage /></Layout></ProtectedRoute>} />
            <Route path="/qr-codes" element={<ProtectedRoute><Layout><QRCodesPage /></Layout></ProtectedRoute>} />
            <Route path="/consolidation" element={<ProtectedRoute><Layout><ConsolidationPage /></Layout></ProtectedRoute>} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
            <Route path="/export-data" element={<ProtectedRoute><Layout><ExportDataPage /></Layout></ProtectedRoute>} />
            <Route path="/ai-arbitrage" element={<ProtectedRoute><Layout><AiArbitragePage /></Layout></ProtectedRoute>} />
            <Route path="/partners" element={<ProtectedRoute><Layout><PartnersPage /></Layout></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Layout><PricingPage /></Layout></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Layout><MarketplacePage /></Layout></ProtectedRoute>} />
            <Route path="/erp" element={<ProtectedRoute><Layout><ErpPage /></Layout></ProtectedRoute>} />
            <Route path="/e-invoicing" element={<ProtectedRoute><Layout><EInvoicingPage /></Layout></ProtectedRoute>} />
            <Route path="/gie" element={<ProtectedRoute><Layout><GiePage /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ScrollToTop } from './components/ScrollToTop'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import PlayersPage from './pages/PlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import VisitsPage from './pages/VisitsPage'
import NewVisitPage from './pages/NewVisitPage'
import CertificatesPage from './pages/CertificatesPage'
import CertificateDetailPage from './pages/CertificateDetailPage'
import SettingsPage from './pages/SettingsPage'
import PCMAPage from './pages/modules/PCMAPage'
import ImpedancePage from './pages/modules/ImpedancePage'
import GPSPage from './pages/modules/GPSPage'
import InjuriesPage from './pages/modules/InjuriesPage'
import NutritionPage from './pages/modules/NutritionPage'
import CarePage from './pages/modules/CarePage'
import ExamenMedicalPage from './pages/modules/ExamenMedicalPage'
import SoinsPage from './pages/modules/SoinsPage'
import ReportsPage from './pages/ReportsPage'
import PlansNutritionPage from './pages/PlansNutritionPage'
import GestionRepasPage from './pages/GestionRepasPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/players"
        element={
          <ProtectedRoute>
            <PlayersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/players/:id"
        element={
          <ProtectedRoute>
            <PlayerDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visits"
        element={
          <ProtectedRoute>
            <VisitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/visits/new"
        element={
          <ProtectedRoute>
            <NewVisitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <CertificatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/:id"
        element={
          <ProtectedRoute>
            <CertificateDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans-nutrition"
        element={
          <ProtectedRoute>
            <PlansNutritionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion-repas"
        element={
          <ProtectedRoute>
            <GestionRepasPage />
          </ProtectedRoute>
        }
      />

      {/* Module Routes */}
      <Route
        path="/modules/pcma"
        element={
          <ProtectedRoute>
            <PCMAPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/impedance"
        element={
          <ProtectedRoute>
            <ImpedancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/gps"
        element={
          <ProtectedRoute>
            <GPSPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/injuries"
        element={
          <ProtectedRoute>
            <InjuriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/nutrition"
        element={
          <ProtectedRoute>
            <NutritionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/care"
        element={
          <ProtectedRoute>
            <CarePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/examen_medical"
        element={
          <ProtectedRoute>
            <ExamenMedicalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules/soins"
        element={
          <ProtectedRoute>
            <SoinsPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect all unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App


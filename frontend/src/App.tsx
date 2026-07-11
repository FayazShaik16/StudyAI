import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { AppProvider } from "@/context/AppContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import GuestRoute from "@/components/auth/GuestRoute"
import MainLayout from "@/components/layouts/MainLayout"
import DashboardLayout from "@/components/layouts/DashboardLayout"

// Lazy loaded pages for performance
const LandingPage = lazy(() => import("@/pages/Landing"))
const LoginPage = lazy(() => import("@/pages/Login"))
const SignupPage = lazy(() => import("@/pages/Signup"))
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPassword"))
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"))
const HomePage = lazy(() => import("@/pages/Home"))
const DashboardPage = lazy(() => import("@/pages/Dashboard"))
const UploadPage = lazy(() => import("@/pages/Upload"))
const MaterialsPage = lazy(() => import("@/pages/Materials"))
const SummaryPage = lazy(() => import("@/pages/Summary"))
const FlashcardsPage = lazy(() => import("@/pages/Flashcards"))
const QuizPage = lazy(() => import("@/pages/Quiz"))
const SchedulePage = lazy(() => import("@/pages/Schedule"))
const AnalyticsPage = lazy(() => import("@/pages/Analytics"))
const SettingsPage = lazy(() => import("@/pages/Settings"))
const NotFoundPage = lazy(() => import("@/pages/NotFound"))
const MaterialDetailPage = lazy(() => import("@/pages/MaterialDetail"))

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-[calc(100vh-100px)]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes without guards */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/app" replace />} />
                </Route>

                {/* Guest Routes (redirect to app if logged in) */}
                <Route element={<GuestRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Protected Routes (Dashboard) */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/app" element={<HomePage />} />
                    <Route path="/app/dashboard" element={<DashboardPage />} />
                    <Route path="/app/upload" element={<UploadPage />} />
                    <Route path="/app/materials" element={<MaterialsPage />} />
                    <Route path="/app/materials/:id" element={<MaterialDetailPage />} />
                    <Route path="/app/materials/:id/summary" element={<SummaryPage />} />
                    <Route path="/app/materials/:id/flashcards" element={<FlashcardsPage />} />
                    <Route path="/app/materials/:id/quiz" element={<QuizPage />} />
                    <Route path="/app/summary" element={<SummaryPage />} />
                    <Route path="/app/flashcards" element={<FlashcardsPage />} />
                    <Route path="/app/quiz" element={<QuizPage />} />
                    <Route path="/app/schedule" element={<SchedulePage />} />
                    <Route path="/app/analytics" element={<AnalyticsPage />} />
                    <Route path="/app/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App

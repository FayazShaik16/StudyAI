import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  
  if (user) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

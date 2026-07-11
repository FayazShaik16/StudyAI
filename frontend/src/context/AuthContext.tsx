import React, { createContext, useContext, useState, useEffect } from "react"
import api from "@/services/api"

export interface User {
  uid: string
  name: string
  email: string
  role: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("token")
      if (token) {
        try {
          const res = await api.get("/auth/me")
          setUser(res.data.user)
        } catch (error) {
          sessionStorage.removeItem("token")
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = (token: string, user: User) => {
    sessionStorage.setItem("token", token)
    setUser(user)
  }

  const logout = async () => {
    try {
        await api.post("/auth/logout")
    } catch (e) {}
    sessionStorage.removeItem("token")
    setUser(null)
  }

  const updateUser = (user: User) => setUser(user)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

import React, { createContext, useContext, useState } from "react"
import { useAuth } from "./AuthContext"

interface AppContextType {
  materialId: string | null
  setMaterialId: (id: string | null) => void
  userId: string | null
  weakTopics: string[]
  setWeakTopics: (topics: string[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [materialId, setMaterialId] = useState<string | null>(null)
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  const userId = user?.uid || null

  return (
    <AppContext.Provider value={{ materialId, setMaterialId, userId, weakTopics, setWeakTopics }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}

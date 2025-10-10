"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType } from "@/lib/types"
import { clientesService } from "@/services/ClienteService"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ID fixo do usuário que você quer carregar
  const FIXED_USER_ID = 16 // substitua pelo ID desejado

  const fetchUser = async () => {
    try {
      const fetchedUser = await clientesService.get(FIXED_USER_ID)
      setUser(fetchedUser)
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    // aqui você pode implementar login real, ou deixar como mock
    return false
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedUserData,
        data_atualizacao: new Date(),
      }
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be usado dentro de um AuthProvider")
  return context
}

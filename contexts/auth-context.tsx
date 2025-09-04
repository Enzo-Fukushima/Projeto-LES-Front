"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { User, AuthContextType } from "@/lib/types"
import { validatePassword, generateCustomerCode } from "@/lib/utils/password"
import { mockUsers } from "@/lib/mock-data"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("bookstore_user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)

    if (userData.senha_hash) {
      const validation = validatePassword(userData.senha_hash)
      if (!validation.isValid) {
        setIsLoading(false)
        return false
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      codigo_cliente: generateCustomerCode(),
      nome: userData.nome || "",
      email: userData.email || "",
      senha_hash: "hashed_" + userData.senha_hash,
      telefone: userData.telefone,
      data_nascimento: userData.data_nascimento,
      ativo: true,
      data_criacao: new Date(),
      data_atualizacao: new Date(),
    }

    setUser(newUser)
    localStorage.setItem("bookstore_user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bookstore_user")
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedUserData,
        data_atualizacao: new Date(),
      }
      setUser(updatedUser)
      localStorage.setItem("bookstore_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

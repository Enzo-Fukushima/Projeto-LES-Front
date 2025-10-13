"use client";

<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, AuthContextType, ClienteUpdateDTO } from "@/lib/types";
import { validatePassword, generateCustomerCode } from "@/lib/utils/password";
import { clientesService } from "@/services/ClienteService";
=======
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType } from "@/lib/types"
import { clientesService } from "@/services/ClienteService"
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega o usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("bookstore_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Login via API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await clientesService.login({ email, senha: password });
      if (response) {
        setUser(response);
        localStorage.setItem("bookstore_user", JSON.stringify(response));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao logar:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Registro via API
  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);

    if (!userData.senha_hash) {
      console.error("Senha é obrigatória para registro");
      setIsLoading(false);
      return false;
    }

    const validation = validatePassword(userData.senha_hash);
    if (!validation.isValid) {
      setIsLoading(false);
      return false;
    }

    try {
      const newUserPayload = {
        ...userData,
        codigo_cliente: generateCustomerCode(),
        senha: userData.senha_hash, // Criar o campo obrigatório para API
      };
=======
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
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f

      const response = await clientesService.create(newUserPayload);
      setUser(response);
      localStorage.setItem("bookstore_user", JSON.stringify(response));
      return true;
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
<<<<<<< HEAD
    setUser(null);
    localStorage.removeItem("bookstore_user");
  };

  // Atualiza dados do usuário
  const updateUser = async (updatedUserData: Partial<User>) => {
    if (!user?.id) {
      console.error("ID do usuário não definido. Update cancelado.");
      return;
=======
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
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
    }

    setIsLoading(true);
    try {
      // Criar payload do tipo ClienteUpdateDTO
      const payload: ClienteUpdateDTO = {
        id: user.id, // garantido como number
        nome: updatedUserData.nome ?? user.nome,
        cpf: updatedUserData.cpf ?? user.cpf,
        email: updatedUserData.email ?? user.email,
        tipoTelefone: updatedUserData.tipoTelefone ?? user.tipoTelefone,
        ddd: updatedUserData.ddd ?? user.ddd,
        numeroTelefone: updatedUserData.numeroTelefone ?? user.numeroTelefone,
        ativo: updatedUserData.ativo ?? user.ativo ?? false,
        ranking: updatedUserData.ranking ?? user.ranking,
        senha: updatedUserData.senha_hash, // se quiser atualizar senha
        
      };

      const response = await clientesService.update(user.id, payload);
      setUser(response);
      localStorage.setItem("bookstore_user", JSON.stringify(response));
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isLoading }}
    >
=======
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acesso ao contexto
export function useAuth() {
<<<<<<< HEAD
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
=======
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be usado dentro de um AuthProvider")
  return context
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, AuthContextType, ClienteUpdateDTO } from "@/lib/types";
import { validatePassword, generateCustomerCode } from "@/lib/utils/password";
import { clientesService } from "@/services/ClienteService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    setUser(null);
    localStorage.removeItem("bookstore_user");
  };

  // Atualiza dados do usuário
  const updateUser = async (updatedUserData: Partial<User>) => {
    if (!user?.id) {
      console.error("ID do usuário não definido. Update cancelado.");
      return;
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
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acesso ao contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

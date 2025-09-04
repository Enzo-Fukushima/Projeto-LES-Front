"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@/lib/types"

interface PersonalInfoFormProps {
  user: User
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState({
    nome: user.nome,
    email: user.email,
    telefone: user.telefone || "",
    cpf: user.cpf,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { updateUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user in context
      updateUser({ ...user, ...formData })

      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" value={formData.cpf} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">CPF não pode ser alterado</p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  )
}

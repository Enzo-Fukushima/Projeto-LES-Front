"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { clientesService } from "@/services/ClienteService";
import type { User, ClienteUpdateDTO, TipoTelefone } from "@/lib/types";

interface PersonalInfoFormProps {
  user: User;
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<
    Omit<ClienteUpdateDTO, "id" | "ativo" | "ranking" | "senha">
  >({
    nome: user.nome || "",
    email: user.email || "",
    tipoTelefone: "CELULAR" as TipoTelefone, // ou outro padrão
    ddd: user.ddd || "",
    numeroTelefone: user.numeroTelefone || "",
    cpf: user.cpf || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário inválido. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 🔹 Chamada real à API
      const updatedUser = await clientesService.update(user.id, {
        id: user.id, // necessário
        ativo: user.ativo ?? true, // necessário
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        tipoTelefone: formData.tipoTelefone,
        ddd: formData.ddd.trim(),
        numeroTelefone: formData.numeroTelefone.trim(),
        cpf: formData.cpf,
      });

      // 🔹 Atualiza contexto global e localStorage
      updateUser(updatedUser);

      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar informações:", error);
      toast({
        title: "Erro ao atualizar",
        description:
          error?.response?.data?.message ||
          "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        {/* DDD */}
        <div className="space-y-2">
          <Label htmlFor="ddd">DDD</Label>
          <Input
            id="ddd"
            value={formData.ddd}
            onChange={(e) => setFormData({ ...formData, ddd: e.target.value })}
            placeholder="11"
            maxLength={2}
            required
          />
        </div>

        {/* Número do telefone */}
        <div className="space-y-2">
          <Label htmlFor="numeroTelefone">Número do Telefone</Label>
          <Input
            id="numeroTelefone"
            value={formData.numeroTelefone}
            onChange={(e) =>
              setFormData({ ...formData, numeroTelefone: e.target.value })
            }
            placeholder="99999-9999"
            required
          />
        </div>

        {/* CPF (não editável) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" value={formData.cpf} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            O CPF não pode ser alterado.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}

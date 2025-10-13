"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { clientesService } from "@/services/ClienteService";
import { Eye, EyeOff } from "lucide-react";
import { validatePassword } from "@/lib/utils/password";

export function PasswordChangeForm({ userId }: { userId: number }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação de senha
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join(", "),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Monta o DTO esperado pelo backend
      const dto = {
        senhaAtual: formData.currentPassword,
        novaSenha: formData.newPassword,
        confirmaSenha: formData.confirmPassword,
      };

      // Chamada real à API
      await clientesService.changePassword(userId, dto);

      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Reset do formulário
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Senha Atual */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha Atual</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("current")}
          >
            {showPasswords.current ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova Senha</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("new")}
          >
            {showPasswords.new ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas,
          minúsculas e caracteres especiais.
        </p>
      </div>

      {/* Confirmar Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Alterando..." : "Alterar Senha"}
      </Button>
    </form>
  );
}

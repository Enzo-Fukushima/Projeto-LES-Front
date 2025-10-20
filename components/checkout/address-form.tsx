"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { EnderecoDTO } from "@/lib/types";
import { enderecoService } from "@/services/EnderecoService";
import { validateCEP, formatCEP } from "@/lib/utils/shipping";

interface AddressFormProps {
  address?: EnderecoDTO;
  userId: number;
  onSave?: (address: EnderecoDTO) => void;
  onCancel?: () => void;
  title?: string;
}

export function AddressForm({
  address,
  userId,
  onSave,
  onCancel,
  title = "Endereço",
}: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<CreateEnderecoDTO, "user_id">>({
    tipoEndereco: address?.tipoEndereco || "ENTREGA",
    tipoResidencia: address?.tipoResidencia || "CASA", // novo campo
    tipoLogradouro: address?.tipoLogradouro || "RUA", // movido para o topo
    logradouro: address?.logradouro || "",
    numero: address?.numero || "",
    apelido: address?.apelido || "",
    bairro: address?.bairro || "",
    cidade: address?.cidade || "",
    estado: address?.estado || "",
    cep: address?.cep || "",
    pais: address?.pais || "Brasil",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    handleChange("cep", formatted);

    if (validateCEP(formatted)) {
      // Mock: substitua por consulta real de CEP
      handleChange("logradouro", "Rua das Flores");
      handleChange("bairro", "Centro");
      handleChange("cidade", "São Paulo");
      handleChange("estado", "SP");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cep) newErrors.cep = "CEP é obrigatório";
    else if (!validateCEP(formData.cep)) newErrors.cep = "CEP inválido";

    if (!formData.logradouro) newErrors.logradouro = "Logradouro é obrigatório";
    if (!formData.numero) newErrors.numero = "Número é obrigatório";
    if (!formData.bairro) newErrors.bairro = "Bairro é obrigatório";
    if (!formData.cidade) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado) newErrors.estado = "Estado é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      let savedAddress: EnderecoDTO;

      if (address?.id) {
        // Atualiza endereço existente
        savedAddress = await enderecoService.update(address.id, {
          ...formData,
          clienteId: userId,
        });
      } else {
        // Cria novo endereço
        savedAddress = await enderecoService.create({
          ...formData,
          clienteId: userId,
        });
      }

      toast({ title: "Sucesso!", description: "Endereço salvo com sucesso." });
      onSave?.(savedAddress);
    } catch (error: any) {
      console.error("Erro ao salvar endereço:", error);
      toast({
        title: "Erro",
        description:
          error?.response?.data?.message ||
          "Não foi possível salvar o endereço.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo e CEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoEndereco">Tipo de Endereço</Label>
              <Select
                value={formData.tipoEndereco}
                onValueChange={(value: "entrega" | "cobranca") =>
                  handleChange("tipoEndereco", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTREGA">Entrega</SelectItem>
                  <SelectItem value="COBRANCA">Cobrança</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label htmlFor="endereco_entrega.tipoLogradouro">
                  Tipo Logradouro *
                </Label>
                <Select
                  data-testid="select-tipo-logradouro"
                  value={formData.tipoLogradouro}
                  onValueChange={(value) =>
                    handleChange("tipoLogradouro", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUA">RUA</SelectItem>
                    <SelectItem value="AVENIDA">AVENIDA</SelectItem>
                    <SelectItem value="ALAMEDA">ALAMEDA</SelectItem>
                    <SelectItem value="PRACA">PRAÇA</SelectItem>
                    <SelectItem value="TRAVESSA">TRAVESSA</SelectItem>
                    <SelectItem value="VIELA">VIELA</SelectItem>
                    <SelectItem value="RODOVIA">RODOVIA</SelectItem>
                    <SelectItem value="CAMINHO">CAMINHO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.cep && (
                <p className="text-sm text-destructive">{errors.cep}</p>
              )}
            </div>
          </div>

          {/* Logradouro, Número, Complemento */}

          <div className="space-y-2">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={formData.logradouro}
              onChange={(e) => handleChange("logradouro", e.target.value)}
              placeholder="Rua, Avenida, etc."
            />
            {errors.logradouro && (
              <p className="text-sm text-destructive">{errors.logradouro}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_cobranca.apelido">Apelido</Label>
            <Input
              id="endereco_cobranca.apelido"
              name="endereco_cobranca.apelido"
              value={formData.apelido}
              onChange={(e) => handleChange("apelido", e.target.value)}
              placeholder="Ex: Casa, Trabalho, etc."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                placeholder="123"
              />
              {errors.numero && (
                <p className="text-sm text-destructive">{errors.numero}</p>
              )}
            </div>
          </div>

          {/* Bairro e Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleChange("bairro", e.target.value)}
                placeholder="Centro"
              />
              {errors.bairro && (
                <p className="text-sm text-destructive">{errors.bairro}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="São Paulo"
              />
              {errors.cidade && (
                <p className="text-sm text-destructive">{errors.cidade}</p>
              )}
            </div>
          </div>

          {/* Estado e País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleChange("estado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-sm text-destructive">{errors.estado}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input id="pais" value={formData.pais} disabled />
            </div>
          </div>

          {/* Endereço principal */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="principal"
              checked={formData.principal}
              onCheckedChange={(checked) =>
                handleChange("principal", checked as boolean)
              }
            />
            <Label htmlFor="principal">Definir como endereço principal</Label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Endereço"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

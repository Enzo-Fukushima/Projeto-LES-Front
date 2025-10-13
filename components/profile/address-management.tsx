"use client";

<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import type React from "react";
import { useState, useEffect } from "react";
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { enderecoService } from "@/services/EnderecoService";
import type { EnderecoDTO } from "@/lib/types";

interface AddressManagementProps {
  userId: number;
  addresses: EnderecoDTO[];
}

const tipoLogradouroMap: Record<string, string> = {
  RUA: "Rua",
  AVENIDA: "Av.",
  TRAVESSA: "Trav.",
  ALAMEDA: "Al.",
  OUTRO: "Outro",
};

export function AddressManagement({ userId }: AddressManagementProps) {
  const [addresses, setAddresses] = useState<EnderecoDTO[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<
    Omit<EnderecoDTO, "id"> & { user_id: number }
  >({
    tipoEndereco: "ENTREGA",
    logradouro: "",
    numero: "",
    apelido: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "Brasil",
    principal: false,
    user_id: Number(userId),
  });

  const { toast } = useToast();

  // Carregar endereços do usuário
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const data = await enderecoService.listByUser(Number(userId));
        setAddresses(data);
      } catch (error) {
        console.error("Erro ao carregar endereços:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os endereços.",
          variant: "destructive",
        });
      }
    }
    fetchAddresses();
  }, [userId, toast]);

  const resetForm = () => {
    setFormData({
      tipoEndereco: "ENTREGA",
      logradouro: "",
      numero: "",
      apelido: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      pais: "Brasil",
      principal: false,
      user_id: Number(userId),
    });
    setIsEditing(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedAddress: EnderecoDTO;

      if (isEditing) {
        // Atualizar endereço existente
        savedAddress = await enderecoService.update(isEditing, formData);
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === savedAddress.id ? savedAddress : addr
          )
        );
        toast({
          title: "Sucesso!",
          description: "Endereço atualizado com sucesso.",
        });
      } else {
        // Criar novo endereço
        savedAddress = await enderecoService.create(formData);
        setAddresses((prev) => [...prev, savedAddress]);
        toast({
          title: "Sucesso!",
          description: "Novo endereço adicionado com sucesso.",
        });
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o endereço.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: EnderecoDTO) => {
    setFormData({
      tipoEndereco: address.tipoEndereco,
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento || "",
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      cep: address.cep,
      pais: address.pais || "Brasil",
      principal: address.principal,
      user_id: Number(userId),
    });
    setIsEditing(address.id!);
    setIsAdding(true);
  };

  const handleDelete = async (addressId: number) => {
    try {
      await enderecoService.delete(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      toast({
        title: "Sucesso!",
        description: "Endereço removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seus Endereços</h3>
        <Button onClick={() => setIsAdding(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Endereço
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Editar Endereço" : "Novo Endereço"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campos do formulário */}
                {/* Tipo de Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="tipoEndereco">Tipo</Label>
                  <select
                    id="tipoEndereco"
                    value={formData.tipoEndereco}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoEndereco: e.target.value as "ENTREGA" | "COBRANCA",
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="ENTREGA">Entrega</option>
                    <option value="COBRANCA">Cobrança</option>
                  </select>
                </div>

                {/* Tipo de Residência */}
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                    placeholder="00000-000"
                    required
                  >
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                  </select>
                </div>

                {/* Tipo de Logradouro */}
                <div className="space-y-2">
                  <Label htmlFor="tipoLogradouro">Tipo de Logradouro</Label>
                  <select
                    id="tipoLogradouro"
                    value={formData.tipoLogradouro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoLogradouro: e.target.value as
                          | "RUA"
                          | "AVENIDA"
                          | "TRAVESSA"
                          | "ALAMEDA"
                          | "OUTRO",
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="RUA">Rua</option>
                    <option value="AVENIDA">Avenida</option>
                    <option value="TRAVESSA">Travessa</option>
                    <option value="ALAMEDA">Alameda</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                {/* Demais campos */}
                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) =>
                      setFormData({ ...formData, logradouro: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    type="number"
                    value={formData.numero}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apelido">Apelido</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, complemento: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) =>
                      setFormData({ ...formData, bairro: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {isEditing ? "Atualizar" : "Adicionar"} Endereço
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          address.tipoEndereco === "COBRANCA"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {address.tipoEndereco === "COBRANCA"
                          ? "Cobrança"
                          : "Entrega"}
                      </Badge>
                    </div>
                    <p className="font-medium">
                      {tipoLogradouroMap[address.tipoLogradouro]} {address.logradouro},{" "}
                      {address.numero}
                      {address.apelido && `, ${address.apelido}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.bairro}, {address.cidade} - {address.estado}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CEP: {address.cep}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum endereço cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Adicione um endereço para facilitar suas compras.
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Endereço
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

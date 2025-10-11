"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { enderecosService } from "@/services/EnderecoService";
import type { Endereco } from "@/lib/types";

interface AddressManagementProps {
  userId: number;
}

const tipoLogradouroMap: Record<string, string> = {
  RUA: "Rua",
  AVENIDA: "Av.",
  TRAVESSA: "Trav.",
  ALAMEDA: "Al.",
  OUTRO: "Outro",
};

export function AddressManagement({ userId }: AddressManagementProps) {
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tipoEndereco: "ENTREGA" as "ENTREGA" | "COBRANCA",
    tipoResidencia: "CASA" as "CASA" | "APARTAMENTO",
    tipoLogradouro: "RUA" as "RUA" | "AVENIDA" | "TRAVESSA" | "ALAMEDA" | "OUTRO",
    logradouro: "",
    numero: "",
    apelido: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const fetchedAddresses: Endereco[] = await enderecosService.listByCliente(userId);
        setAddresses(fetchedAddresses);
      } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os endereços.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [userId, toast]);

  // Função para gerar payload no formato exato que o backend espera
  const prepareEnderecoPayload = (formData: typeof formData, userId: number) => {
    return {
      clienteId: userId,
      numero: Number(formData.numero),
      tipoEndereco: formData.tipoEndereco as "ENTREGA" | "COBRANCA",
      tipoResidencia: formData.tipoResidencia.toUpperCase() as "CASA" | "APARTAMENTO",
      tipoLogradouro: formData.tipoLogradouro.toUpperCase() as
        | "RUA"
        | "AVENIDA"
        | "TRAVESSA"
        | "ALAMEDA"
        | "OUTRO",
      estado: formData.estado.toUpperCase(),
      logradouro: formData.logradouro,
      bairro: formData.bairro,
      cidade: formData.cidade,
      cep: formData.cep,
      apelido: formData.apelido?.trim() || formData.logradouro,
      pais: formData.pais?.trim() || "Brasil",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = prepareEnderecoPayload(formData, userId);

      if (isEditing) {
        const updatedEndereco = await enderecosService.update(isEditing, payload);
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === isEditing ? { ...addr, ...updatedEndereco } : addr))
        );
        toast({
          title: "Sucesso!",
          description: "Endereço atualizado com sucesso.",
        });
      } else {
        const newEndereco = await enderecosService.create(payload);
        setAddresses((prev) => [...prev, newEndereco]);
        toast({
          title: "Sucesso!",
          description: "Novo endereço adicionado com sucesso.",
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o endereço.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Endereco) => {
    setFormData({
      tipoEndereco: address.tipoEndereco,
      tipoResidencia: address.tipoResidencia,
      tipoLogradouro: address.tipoLogradouro,
      logradouro: address.logradouro,
      numero: address.numero.toString(),
      apelido: address.apelido || "",
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      cep: address.cep,
      pais: address.pais || "",
    });
    setIsEditing(address.id);
    setIsAdding(true);
  };

  const handleDelete = async (addressId: number) => {
    try {
      await enderecosService.remove(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      toast({
        title: "Sucesso!",
        description: "Endereço removido com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o endereço.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      tipoEndereco: "ENTREGA",
      tipoResidencia: "CASA",
      tipoLogradouro: "RUA",
      logradouro: "",
      numero: "",
      apelido: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      pais: "",
    });
    setIsEditing(null);
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Carregando endereços...</p>
      </div>
    );
  }

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
            <CardTitle>{isEditing ? "Editar Endereço" : "Novo Endereço"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campos do formulário */}
                {/* Tipo de Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="tipoEndereco">Tipo de Endereço</Label>
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
                  <Label htmlFor="tipoResidencia">Tipo de Residência</Label>
                  <select
                    id="tipoResidencia"
                    value={formData.tipoResidencia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipoResidencia: e.target.value as "CASA" | "APARTAMENTO",
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
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
                    id="apelido"
                    value={formData.apelido}
                    onChange={(e) =>
                      setFormData({ ...formData, apelido: e.target.value })
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
                <Button type="submit">{isEditing ? "Atualizar" : "Adicionar"} Endereço</Button>
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
                        variant={address.tipoEndereco === "COBRANCA" ? "secondary" : "default"}
                      >
                        {address.tipoEndereco === "COBRANCA" ? "Cobrança" : "Entrega"}
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
                    <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(address.id)}>
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
            <h3 className="text-lg font-semibold mb-2">Nenhum endereço cadastrado</h3>
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

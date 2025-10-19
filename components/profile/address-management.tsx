"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { enderecoService } from "@/services/EnderecoService";
import type { EnderecoDTO } from "@/lib/types";
import { AddressForm } from "../checkout/address-form"; // importa o componente de cima

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
  const [addresses, setAddresses] = useState<EnderecoDTO[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EnderecoDTO | null>(null);
  const { toast } = useToast();

  // Carrega endereços do usuário
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

  const handleSave = (saved: EnderecoDTO) => {
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      if (exists) {
        // Atualiza
        return prev.map((a) => (a.id === saved.id ? saved : a));
      } else {
        // Adiciona
        return [...prev, saved];
      }
    });
    setIsAdding(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: EnderecoDTO) => {
    setEditingAddress(address);
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

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seus Endereços</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Endereço
          </Button>
        )}
      </div>

      {/* Formulário (reaproveitando AddressForm) */}
      {isAdding && (
        <AddressForm
          userId={userId}
          address={editingAddress || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          title={editingAddress ? "Editar Endereço" : "Novo Endereço"}
        />
      )}

      {/* Lista de endereços */}
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
                      {tipoLogradouroMap[address.tipoLogradouro]}{" "}
                      {address.logradouro}, {address.numero}
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

      {/* Mensagem caso não haja endereços */}
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

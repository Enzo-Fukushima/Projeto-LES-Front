"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import type { CartaoCreditoDTO } from "@/lib/types";
import { cartaoService } from "@/services/CartoesService";

interface PaymentManagementProps {
<<<<<<< HEAD
  userId: number;
  payments: CartaoCreditoDTO[];
=======
  userId: number 
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
}

export function PaymentManagement({
  userId,
  payments,
}: PaymentManagementProps) {
  const [cards, setCards] = useState<CartaoCreditoDTO[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<CartaoCreditoDTO, "id">>({
    numero: "",
    nomeTitular: "",
    validade: "",
    cvv: "",
    bandeira: "",
    clienteId: userId,
  });

  const { toast } = useToast();

  // 🔄 Carrega cartões do cliente
  useEffect(() => {
    async function fetchCards() {
      try {
        const data = await cartaoService.listByUser(userId);
        setCards(data);
      } catch (error) {
        console.error("Erro ao buscar cartões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os cartões.",
          variant: "destructive",
        });
      }
    }
    fetchCards();
  }, [userId, toast]);

  const maskCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const maskExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5);
  };

  const getCardBrand = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5")) return "Mastercard";
    if (clean.startsWith("3")) return "Amex";
    return "Outro";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const bandeira = getCardBrand(formData.numero);

      if (isEditing) {
        const updated = await cartaoService.update(Number(isEditing), {
          ...formData,
          bandeira,
        });
        setCards((prev) =>
          prev.map((card) => (card.id === updated.id ? updated : card))
        );
        toast({
          title: "Sucesso!",
          description: "Cartão atualizado com sucesso.",
        });
      } else {
        const created = await cartaoService.create({
          ...formData,
          bandeira,
        });
        setCards((prev) => [...prev, created]);
        toast({
          title: "Sucesso!",
          description: "Cartão adicionado com sucesso.",
        });
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cartão.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (card: CartaoCreditoDTO) => {
    setFormData({
      numero: card.numero,
      nomeTitular: card.nomeTitular,
      validade: card.validade,
      cvv: "",
      bandeira: card.bandeira,
      clienteId: Number(userId),
    });
    setIsEditing(card.id?.toString() ?? null);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await cartaoService.delete(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Sucesso!",
        description: "Cartão removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cartão.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      nomeTitular: "",
      validade: "",
      cvv: "",
      bandeira: "",
      clienteId: Number(userId),
    });
    setIsEditing(null);
    setIsAdding(false);
  };

  const maskCardForDisplay = (num: string) => {
    const clean = num.replace(/\D/g, "");
    return `**** **** **** ${clean.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seus Cartões</h3>
        <Button onClick={() => setIsAdding(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cartão
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Cartão" : "Novo Cartão"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={maskCardNumber(formData.numero)}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: e.target.value })
                    }
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="nomeTitular">Nome do Titular</Label>
                  <Input
                    id="nomeTitular"
                    value={formData.nomeTitular}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeTitular: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="NOME COMO NO CARTÃO"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validade">Validade</Label>
                  <Input
                    id="validade"
                    value={maskExpiry(formData.validade)}
                    onChange={(e) =>
                      setFormData({ ...formData, validade: e.target.value })
                    }
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) =>
                      setFormData({ ...formData, cvv: e.target.value })
                    }
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {isEditing ? "Atualizar" : "Adicionar"}
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
        {cards.map((card) => (
          <Card key={card.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {maskCardForDisplay(card.numero)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.nomeTitular}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.bandeira} • Válido até {card.validade}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(card.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Adicione um cartão para facilitar suas compras.
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

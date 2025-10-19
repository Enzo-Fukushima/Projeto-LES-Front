"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import type { CartaoCreditoDTO } from "@/lib/types";
import { cartaoService } from "@/services/CartoesService";
import { PaymentForm } from "../checkout/payment-form";

interface PaymentManagementProps {
  userId: number;
  payments: CartaoCreditoDTO[];
}

export function PaymentManagement({ userId }: PaymentManagementProps) {
  const [cards, setCards] = useState<CartaoCreditoDTO[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCard, setEditingCard] = useState<CartaoCreditoDTO | null>(null);
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

  const formatCardExpiry = (date?: string) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-based
    const year = String(d.getFullYear()).slice(-2);
    return `${month}/${year}`;
  };

  const handleSaveSuccess = (card: CartaoCreditoDTO) => {
    setCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      return exists
        ? prev.map((c) => (c.id === card.id ? card : c))
        : [...prev, card];
    });
    setIsAdding(false);
    setEditingCard(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCard(null);
  };

  const maskCardForDisplay = (num?: string) => {
    if (!num) return "**** **** **** ****";
    const clean = num.replace(/\D/g, "");

    if (clean.length < 4) return "**** **** **** ****";

    const last4 = clean.slice(-4);

    return `**** **** **** ${last4}`;
  };

  console.log("Rendered PaymentManagement with cards:", cards);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seus Cartões</h3>
        <Button
          onClick={() => {
            setEditingCard(null);
            setIsAdding(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cartão
        </Button>
      </div>

      {isAdding && (
        <PaymentForm
          key={editingCard?.id ?? "new"}
          userId={userId}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancel}
        />
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
                      {maskCardForDisplay(card.numeroCartao)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.nomeImpresso}
                    </p>
                    <p className="text-sm text-muted-foreground">
                  
                        {card.bandeira} • Válido até{" "}
                        {formatCardExpiry(card.validade)}
                      </p>
           
                  </div>
                </div>
                <div className="flex gap-2">
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
            <Button
              onClick={() => {
                setEditingCard(null);
                setIsAdding(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

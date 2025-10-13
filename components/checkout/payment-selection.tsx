"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cartaoService } from "@/services/CartoesService";
import type { CartaoCreditoDTO } from "@/lib/types";

interface PaymentSelectionProps {
  userId: number;
  selectedCardId: string | null;
  onCardSelect: (card: CartaoCreditoDTO) => void;
  onAddNew: () => void;
}

export function PaymentSelection({
  userId,
  selectedCardId,
  onCardSelect,
  onAddNew,
}: PaymentSelectionProps) {
  const [paymentCards, setPaymentCards] = useState<CartaoCreditoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCards() {
      setIsLoading(true);
      try {
        const cards = await cartaoService.listByUser(userId);
        // Filtra apenas cartões que têm id definido
        setPaymentCards(
          cards.filter(
            (c): c is CartaoCreditoDTO & { id: number } =>
              typeof c.id === "number"
          )
        );
      } catch (error) {
        console.error("Erro ao carregar cartões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os cartões.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, [userId, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Selecionar Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">
            Carregando cartões...
          </p>
        ) : paymentCards.length > 0 ? (
          <RadioGroup
            value={selectedCardId || ""}
            onValueChange={(value) => {
              const card = paymentCards.find((c) => c.id!.toString() === value);
              if (card) onCardSelect(card);
            }}
          >
            {paymentCards.map((card) => {
              if (!card.id) return null; // garante que não renderize cartões sem id
              return (
                <div
                  key={card.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value={card.id.toString()}
                    id={card.id.toString()}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={card.id.toString()}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{card.bandeira}</span>
                        <span className="text-muted-foreground">
                          {card.numero}
                        </span>
                        {paymentCards[0].id === card.id && (
                          <Badge variant="secondary" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {card.nomeTitular}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Válido até {card.validade}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cartão cadastrado</p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={onAddNew}
          className="w-full bg-transparent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Novo Cartão
        </Button>
      </CardContent>
    </Card>
  );
}

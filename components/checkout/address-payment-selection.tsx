"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { MapPin, CreditCard, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enderecoService } from "@/services/EnderecoService";
import { cartaoService } from "@/services/CartoesService";
import type { EnderecoDTO, CartaoCreditoDTO } from "@/lib/types";

interface PaymentCard {
  card: CartaoCreditoDTO;
  amount: number;
}

interface AddressPaymentSelectionProps {
  userId: number;
  totalAmount?: number; // Valor total da compra (opcional)
  onAddNewAddress: () => void;
  onAddNewCard: () => void;
  onContinue: (address: EnderecoDTO, payments: PaymentCard[]) => void;
}

export function AddressPaymentSelection({
  userId,
  totalAmount = 0, // Valor padrão
  onAddNewAddress,
  onAddNewCard,
  onContinue,
}: AddressPaymentSelectionProps) {
  const [addresses, setAddresses] = useState<EnderecoDTO[]>([]);
  const [cards, setCards] = useState<CartaoCreditoDTO[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  // Novo estado para múltiplos cartões
  const [selectedCards, setSelectedCards] = useState<PaymentCard[]>([]);
  const [useMultipleCards, setUseMultipleCards] = useState(false);

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const { toast } = useToast();

  // Carregar endereços
  useEffect(() => {
    if (!userId || userId === undefined) {
      console.warn("userId inválido:", userId);
      return;
    }

    async function fetchAddresses() {
      console.log("🔍 Buscando endereços para userId:", userId);
      setLoadingAddresses(true);
      try {
        const data = await enderecoService.listByUser(userId);
        console.log("✅ Endereços carregados:", data);
        setAddresses(data);
      } catch (error) {
        console.error("❌ Erro ao carregar endereços:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os endereços.",
          variant: "destructive",
        });
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [userId, toast]);

  // Carregar cartões
  useEffect(() => {
    if (!userId || userId === undefined) {
      console.warn("userId inválido:", userId);
      return;
    }

    async function fetchCards() {
      console.log("🔍 Buscando cartões para userId:", userId);
      setLoadingCards(true);
      try {
        const data = await cartaoService.listByUser(userId);
        console.log("✅ Cartões carregados:", data);
        setCards(data);
      } catch (error) {
        console.error("❌ Erro ao carregar cartões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os cartões.",
          variant: "destructive",
        });
      } finally {
        setLoadingCards(false);
      }
    }
    fetchCards();
  }, [userId, toast]);

  // Adicionar cartão à seleção
  const handleAddCard = (cardId: string) => {
    const card = cards.find((c) => c.id?.toString() === cardId);
    if (!card) return;

    // Verificar se o cartão já foi adicionado
    if (selectedCards.some((sc) => sc.card.id === card.id)) {
      toast({
        title: "Aviso",
        description: "Este cartão já foi adicionado.",
        variant: "destructive",
      });
      return;
    }

    // Limitar a 2 cartões
    if (selectedCards.length >= 2) {
      toast({
        title: "Limite atingido",
        description: "Você pode usar no máximo 2 cartões.",
        variant: "destructive",
      });
      return;
    }

    // Calcular valor restante
    const usedAmount = selectedCards.reduce((sum, sc) => sum + sc.amount, 0);
    const remainingAmount = totalAmount - usedAmount;

    setSelectedCards([...selectedCards, { card, amount: remainingAmount }]);
  };

  // Remover cartão da seleção
  const handleRemoveCard = (cardId: number | undefined) => {
    setSelectedCards(selectedCards.filter((sc) => sc.card.id !== cardId));
  };

  // Atualizar valor do cartão
  const handleUpdateAmount = (
    cardId: number | undefined,
    newAmount: number
  ) => {
    setSelectedCards(
      selectedCards.map((sc) =>
        sc.card.id === cardId ? { ...sc, amount: Math.max(0, newAmount) } : sc
      )
    );
  };

  // Constantes de validação
  const VALOR_MINIMO_POR_CARTAO = 10.0;

  // Verificar se todos os cartões têm valor mínimo
  const cartoesComValorInsuficiente = selectedCards.filter(
    (sc) => sc.amount < VALOR_MINIMO_POR_CARTAO && sc.amount > 0
  );

  const hasValorMinimoInvalido = cartoesComValorInsuficiente.length > 0;

  // Calcular totais
  const totalPaid = selectedCards.reduce((sum, sc) => sum + sc.amount, 0);
  const remainingAmount = totalAmount - totalPaid;
  const isAmountValid = Math.abs(remainingAmount) < 0.01; // Tolerância de 1 centavo

  const selectedAddress = addresses.find(
    (a) => a.id?.toString() === selectedAddressId
  );

  const canContinue =
    !!selectedAddress && selectedCards.length > 0 && isAmountValid;

  // Alternar entre 1 e 2 cartões
  const toggleMultipleCards = () => {
    if (useMultipleCards) {
      // Voltar para 1 cartão - manter apenas o primeiro
      setSelectedCards(
        selectedCards.slice(0, 1).map((sc) => ({
          ...sc,
          amount: totalAmount,
        }))
      );
    }
    setUseMultipleCards(!useMultipleCards);
  };

  return (
    <div className="space-y-6">
      {/* Address Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selecionar Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAddresses ? (
            <p className="text-center text-muted-foreground">
              Carregando endereços...
            </p>
          ) : addresses.length > 0 ? (
            <RadioGroup
              value={selectedAddressId || ""}
              onValueChange={(value) => setSelectedAddressId(value)}
            >
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={address.id?.toString() || ""}
                      id={`address-${address.id}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`address-${address.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.apelido}</span>
                          <Badge
                            variant={
                              address.tipoEndereco?.toLowerCase() === "cobranca"
                                ? "secondary"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {address.tipoEndereco}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.logradouro}, {address.numero}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.bairro}, {address.cidade} - {address.estado}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.cep}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum endereço cadastrado
            </p>
          )}

          <Separator className="my-4" />
          <Button
            variant="outline"
            onClick={onAddNewAddress}
            className="w-full bg-transparent"
            data-cy={"adicionarendereco"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Endereço
          </Button>
        </CardContent>
      </Card>

      {/* Payment Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Forma de Pagamento
            </CardTitle>
            <Button variant="outline" size="sm" onClick={toggleMultipleCards}>
              {useMultipleCards ? "Usar 1 Cartão" : "Usar 2 Cartões"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Valor Total */}
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Valor Total:</span>
              <span className="text-lg font-bold">
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>
            {selectedCards.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span>Valor Pago:</span>
                  <span
                    className={totalPaid > totalAmount ? "text-red-500" : ""}
                  >
                    R$ {totalPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Restante:</span>
                  <span
                    className={
                      remainingAmount > 0.01
                        ? "text-orange-500 font-medium"
                        : "text-green-500"
                    }
                  >
                    R$ {remainingAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Cartões Selecionados */}
          {selectedCards.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-sm">Cartões Selecionados:</h4>
              {selectedCards.map((payment, index) => (
                <div
                  key={payment.card.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {payment.card.bandeira}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {payment.card.numeroCartao.replace(
                            /\d{12}(\d{4})/,
                            "**** **** **** $1"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.card.nomeImpresso}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCard(payment.card.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`amount-${payment.card.id}`}
                      className="text-sm"
                    >
                      Valor:
                    </Label>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-sm">R$</span>
                      <Input
                        id={`amount-${payment.card.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max={totalAmount}
                        value={payment.amount}
                        onChange={(e) =>
                          handleUpdateAmount(
                            payment.card.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de Cartões Disponíveis */}
          {(!useMultipleCards || selectedCards.length < 2) && (
            <>
              {loadingCards ? (
                <p className="text-center text-muted-foreground">
                  Carregando cartões...
                </p>
              ) : cards.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">
                    {selectedCards.length > 0
                      ? "Adicionar outro cartão:"
                      : "Selecione um cartão:"}
                  </h4>
                  {cards
                    .filter(
                      (card) =>
                        !selectedCards.some((sc) => sc.card.id === card.id)
                    )
                    .map((card) => (
                      <div
                        key={card.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleAddCard(card.id?.toString() || "")}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{card.bandeira}</span>
                            <span className="text-sm text-muted-foreground">
                              {card.numeroCartao.replace(
                                /\d{12}(\d{4})/,
                                "**** **** **** $1"
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {card.nomeImpresso}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-cy={`cartao-${card.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Nenhum cartão cadastrado
                </p>
              )}
            </>
          )}

          <Separator className="my-4" />
          <Button
            variant="outline"
            onClick={onAddNewCard}
            className="w-full bg-transparent"
            data-cy={"adicionarcartao"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Cartão
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() =>
            selectedAddress && onContinue(selectedAddress, selectedCards)
          }
          disabled={!canContinue}
          size="lg"
          data-cy={"continuar"}
        >
          Continuar para Entrega
          {!isAmountValid && selectedCards.length > 0 && (
            <span className="ml-2 text-xs">(Ajuste os valores)</span>
          )}
        </Button>
      </div>
    </div>
  );
}

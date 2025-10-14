"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, CreditCard, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enderecoService } from "@/services/EnderecoService";
import { cartaoService } from "@/services/CartoesService";
import type { EnderecoDTO, CartaoCreditoDTO } from "@/lib/types";

interface AddressPaymentSelectionProps {
  userId: number;
  onAddNewAddress: () => void;
  onAddNewCard: () => void;
  onContinue: (address: EnderecoDTO, card: CartaoCreditoDTO) => void;
}

export function AddressPaymentSelection({
  userId,
  onAddNewAddress,
  onAddNewCard,
  onContinue,
}: AddressPaymentSelectionProps) {
  const [addresses, setAddresses] = useState<EnderecoDTO[]>([]);
  const [cards, setCards] = useState<CartaoCreditoDTO[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const { toast } = useToast();

  // 🔄 Carregar endereços - COM VERIFICAÇÃO DE userId
  useEffect(() => {
    // ⚠️ CRITICAL: Só executa se userId for válido
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

  // 🔄 Carregar cartões - COM VERIFICAÇÃO DE userId
  useEffect(() => {
    // ⚠️ CRITICAL: Só executa se userId for válido
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

  const selectedAddress = addresses.find(
    (a) => a.id?.toString() === selectedAddressId
  );
  const selectedCard = cards.find((c) => c.id?.toString() === selectedCardId);
  const canContinue = !!selectedAddress && !!selectedCard;

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
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Endereço
          </Button>
        </CardContent>
      </Card>

      {/* Payment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Selecionar Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCards ? (
            <p className="text-center text-muted-foreground">
              Carregando cartões...
            </p>
          ) : cards.length > 0 ? (
            <RadioGroup
              value={selectedCardId || ""}
              onValueChange={(value) => setSelectedCardId(value)}
            >
              <div className="space-y-3">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={card.id?.toString() || ""}
                      id={`card-${card.id}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`card-${card.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum cartão cadastrado
            </p>
          )}

          <Separator className="my-4" />
          <Button
            variant="outline"
            onClick={onAddNewCard}
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Cartão
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() =>
            selectedAddress &&
            selectedCard &&
            onContinue(selectedAddress, selectedCard)
          }
          disabled={!canContinue}
          size="lg"
        >
          Continuar para Entrega
        </Button>
      </div>
    </div>
  );
}
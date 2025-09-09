"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Address, PaymentCard } from "@/lib/types"
import { MapPin, CreditCard, Plus } from "lucide-react"

interface AddressPaymentSelectionProps {
  addresses: Address[]
  paymentCards: PaymentCard[]
  selectedAddressId: string | null
  selectedCardId: string | null
  onAddressSelect: (address: Address) => void
  onCardSelect: (card: PaymentCard) => void
  onAddNewAddress: () => void
  onAddNewCard: () => void
  onContinue: () => void
}

export function AddressPaymentSelection({
  addresses,
  paymentCards,
  selectedAddressId,
  selectedCardId,
  onAddressSelect,
  onCardSelect,
  onAddNewAddress,
  onAddNewCard,
  onContinue,
}: AddressPaymentSelectionProps) {
  const [addressValue, setAddressValue] = useState(selectedAddressId || "")
  const [cardValue, setCardValue] = useState(selectedCardId || "")

  const handleAddressChange = (addressId: string) => {
    setAddressValue(addressId)
    const address = addresses.find((addr) => addr.id === addressId)
    if (address) {
      onAddressSelect(address)
    }
  }

  const handleCardChange = (cardId: string) => {
    setCardValue(cardId)
    const card = paymentCards.find((c) => c.id === cardId)
    if (card) {
      onCardSelect(card)
    }
  }

  const canContinue = addressValue && cardValue

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
          <RadioGroup value={addressValue} onValueChange={handleAddressChange}>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                  <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.apelido}</span>
                        <Badge variant={address.tipo === "entrega" ? "default" : "secondary"} className="text-xs">
                          {address.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.logradouro}, {address.numero}
                        {address.complemento && `, ${address.complemento}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.bairro}, {address.cidade} - {address.estado}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.cep}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <Separator className="my-4" />

          <Button variant="outline" onClick={onAddNewAddress} className="w-full bg-transparent">
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
          <RadioGroup value={cardValue} onValueChange={handleCardChange}>
            <div className="space-y-3">
              {paymentCards.map((card) => (
                <div key={card.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={card.id} id={`card-${card.id}`} className="mt-1" />
                  <Label htmlFor={`card-${card.id}`} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{card.bandeira}</span>
                        <span className="text-sm text-muted-foreground">{card.numero_mascarado}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{card.nome_titular}</p>
                      <p className="text-xs text-muted-foreground">
                        Válido até {(card.mes_vencimento || 0).toString().padStart(2, "0")}/
                        {card.ano_vencimento || "0000"}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <Separator className="my-4" />

          <Button variant="outline" onClick={onAddNewCard} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Cartão
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={!canContinue} size="lg">
          Continuar para Entrega
        </Button>
      </div>
    </div>
  )
}

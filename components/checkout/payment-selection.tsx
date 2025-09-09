"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard } from "lucide-react"
import type { PaymentCard } from "@/lib/types"

interface PaymentSelectionProps {
  paymentCards: PaymentCard[]
  selectedCardId: string | null
  onCardSelect: (card: PaymentCard) => void
  onAddNew: () => void
}

export function PaymentSelection({ paymentCards, selectedCardId, onCardSelect, onAddNew }: PaymentSelectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Selecionar Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentCards.length > 0 ? (
          <RadioGroup
            value={selectedCardId || ""}
            onValueChange={(value) => {
              const card = paymentCards.find((c) => c.id === value)
              if (card) onCardSelect(card)
            }}
          >
            {paymentCards.map((card) => (
              <div key={card.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={card.id} id={card.id} className="mt-1" />
                <Label htmlFor={card.id} className="flex-1 cursor-pointer">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{card.bandeira}</span>
                      <span className="text-muted-foreground">{card.numero_mascarado}</span>
                      {card.principal && (
                        <Badge variant="secondary" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{card.nome_titular}</p>
                    <p className="text-sm text-muted-foreground">Válido até {card.validade}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cartão cadastrado</p>
          </div>
        )}

        <Button variant="outline" onClick={onAddNew} className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Novo Cartão
        </Button>
      </CardContent>
    </Card>
  )
}

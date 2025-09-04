"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ShippingOption } from "@/lib/utils/shipping"
import { Truck } from "lucide-react"

interface ShippingOptionsProps {
  options: ShippingOption[]
  selectedOption: string
  onOptionChange: (optionId: string) => void
}

export function ShippingOptions({ options, selectedOption, onOptionChange }: ShippingOptionsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Opções de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedOption} onValueChange={onOptionChange}>
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                  </div>
                  <p className="font-semibold text-primary">
                    {option.price === 0 ? "Grátis" : formatPrice(option.price)}
                  </p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin } from "lucide-react"
import type { Address } from "@/lib/types"

interface AddressSelectionProps {
  addresses: Address[]
  selectedAddressId: string | null
  onAddressSelect: (address: Address) => void
  onAddNew: () => void
}

export function AddressSelection({ addresses, selectedAddressId, onAddressSelect, onAddNew }: AddressSelectionProps) {
  const deliveryAddresses = addresses.filter((addr) => addr.tipo === "entrega")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Selecionar Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deliveryAddresses.length > 0 ? (
          <RadioGroup
            value={selectedAddressId || ""}
            onValueChange={(value) => {
              const address = deliveryAddresses.find((addr) => addr.id === value)
              if (address) onAddressSelect(address)
            }}
          >
            {deliveryAddresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {address.logradouro}, {address.numero}
                      </span>
                      {address.principal && (
                        <Badge variant="secondary" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </div>
                    {address.complemento && <p className="text-sm text-muted-foreground">{address.complemento}</p>}
                    <p className="text-sm text-muted-foreground">
                      {address.bairro}, {address.cidade} - {address.estado}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.cep}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum endereço de entrega cadastrado</p>
          </div>
        )}

        <Button variant="outline" onClick={onAddNew} className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Novo Endereço
        </Button>
      </CardContent>
    </Card>
  )
}

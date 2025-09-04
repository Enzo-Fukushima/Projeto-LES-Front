"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { CreditCard } from "@/lib/types"
import { CreditCardIcon } from "lucide-react"

interface PaymentFormProps {
  onSave: (card: Omit<CreditCard, "id" | "user_id">) => void
  onCancel?: () => void
}

export function PaymentForm({ onSave, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    numero: "",
    nome_titular: "",
    validade: "",
    cvv: "",
    bandeira: "",
    principal: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCardNumberChange = (value: string) => {
    // Format card number and detect brand
    const cleanValue = value.replace(/\D/g, "")
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, "$1 ")

    handleChange("numero", formattedValue)

    // Detect card brand
    let bandeira = ""
    if (cleanValue.startsWith("4")) bandeira = "Visa"
    else if (cleanValue.startsWith("5")) bandeira = "Mastercard"
    else if (cleanValue.startsWith("3")) bandeira = "American Express"

    if (bandeira) handleChange("bandeira", bandeira)
  }

  const handleValidadeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const formattedValue = cleanValue.replace(/(\d{2})(\d{2})/, "$1/$2")
    handleChange("validade", formattedValue)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero) newErrors.numero = "Número do cartão é obrigatório"
    else if (formData.numero.replace(/\D/g, "").length < 13) newErrors.numero = "Número do cartão inválido"

    if (!formData.nome_titular) newErrors.nome_titular = "Nome do titular é obrigatório"
    if (!formData.validade) newErrors.validade = "Validade é obrigatória"
    else if (!/^\d{2}\/\d{2}$/.test(formData.validade)) newErrors.validade = "Validade inválida (MM/AA)"

    if (!formData.cvv) newErrors.cvv = "CVV é obrigatório"
    else if (formData.cvv.length < 3) newErrors.cvv = "CVV inválido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // Mask card number for security
      const maskedNumber = formData.numero.replace(/\d(?=\d{4})/g, "*")

      onSave({
        numero_mascarado: maskedNumber,
        nome_titular: formData.nome_titular,
        validade: formData.validade,
        bandeira: formData.bandeira,
        principal: formData.principal,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5" />
          Cartão de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número do Cartão *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
            {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
            {formData.bandeira && <p className="text-sm text-muted-foreground">Bandeira: {formData.bandeira}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_titular">Nome do Titular *</Label>
            <Input
              id="nome_titular"
              value={formData.nome_titular}
              onChange={(e) => handleChange("nome_titular", e.target.value.toUpperCase())}
              placeholder="NOME COMO NO CARTÃO"
            />
            {errors.nome_titular && <p className="text-sm text-destructive">{errors.nome_titular}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validade">Validade *</Label>
              <Input
                id="validade"
                value={formData.validade}
                onChange={(e) => handleValidadeChange(e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
              />
              {errors.validade && <p className="text-sm text-destructive">{errors.validade}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                type="password"
                value={formData.cvv}
                onChange={(e) => handleChange("cvv", e.target.value.replace(/\D/g, ""))}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="principal"
              checked={formData.principal}
              onCheckedChange={(checked) => handleChange("principal", checked as boolean)}
            />
            <Label htmlFor="principal">Definir como cartão principal</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Cartão
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

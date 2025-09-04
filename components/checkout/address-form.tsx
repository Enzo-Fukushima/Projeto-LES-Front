"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Address } from "@/lib/types"
import { validateCEP, formatCEP } from "@/lib/utils/shipping"

interface AddressFormProps {
  address?: Address
  onSave: (address: Omit<Address, "id" | "user_id">) => void
  onCancel?: () => void
  title?: string
}

export function AddressForm({ address, onSave, onCancel, title = "Endereço" }: AddressFormProps) {
  const [formData, setFormData] = useState({
    tipo: address?.tipo || ("entrega" as "entrega" | "cobranca"),
    cep: address?.cep || "",
    logradouro: address?.logradouro || "",
    numero: address?.numero || "",
    complemento: address?.complemento || "",
    bairro: address?.bairro || "",
    cidade: address?.cidade || "",
    estado: address?.estado || "",
    pais: address?.pais || "Brasil",
    principal: address?.principal || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value)
    handleChange("cep", formatted)

    // Mock CEP lookup - in real app, would call CEP API
    if (validateCEP(formatted)) {
      setFormData((prev) => ({
        ...prev,
        logradouro: "Rua das Flores",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
      }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cep) newErrors.cep = "CEP é obrigatório"
    else if (!validateCEP(formData.cep)) newErrors.cep = "CEP inválido"

    if (!formData.logradouro) newErrors.logradouro = "Logradouro é obrigatório"
    if (!formData.numero) newErrors.numero = "Número é obrigatório"
    if (!formData.bairro) newErrors.bairro = "Bairro é obrigatório"
    if (!formData.cidade) newErrors.cidade = "Cidade é obrigatória"
    if (!formData.estado) newErrors.estado = "Estado é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Endereço</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "entrega" | "cobranca") => handleChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="cobranca">Cobrança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.cep && <p className="text-sm text-destructive">{errors.cep}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={formData.logradouro}
              onChange={(e) => handleChange("logradouro", e.target.value)}
              placeholder="Rua, Avenida, etc."
            />
            {errors.logradouro && <p className="text-sm text-destructive">{errors.logradouro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                placeholder="123"
              />
              {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => handleChange("complemento", e.target.value)}
                placeholder="Apto, Bloco, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleChange("bairro", e.target.value)}
                placeholder="Centro"
              />
              {errors.bairro && <p className="text-sm text-destructive">{errors.bairro}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="São Paulo"
              />
              {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  {/* Add more states as needed */}
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input id="pais" value={formData.pais} onChange={(e) => handleChange("pais", e.target.value)} disabled />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="principal"
              checked={formData.principal}
              onCheckedChange={(checked) => handleChange("principal", checked as boolean)}
            />
            <Label htmlFor="principal">Definir como endereço principal</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Endereço
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

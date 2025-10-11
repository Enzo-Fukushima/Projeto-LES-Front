"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, CreditCard } from "lucide-react"
import { mockPaymentCards } from "@/lib/mock-data"
import type { PaymentCard } from "@/lib/types"

interface PaymentManagementProps {
  userId: number 
}

export function PaymentManagement({ userId }: PaymentManagementProps) {
  const [cards, setCards] = useState(mockPaymentCards.filter((card) => card.user_id === userId))
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    numero: "",
    nome_titular: "",
    validade: "",
    cvv: "",
    bandeira: "",
  })
  const { toast } = useToast()

  const maskCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim()
  }

  const maskExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5)
  }

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\D/g, "")
    if (cleanNumber.startsWith("4")) return "Visa"
    if (cleanNumber.startsWith("5")) return "Mastercard"
    if (cleanNumber.startsWith("3")) return "American Express"
    return "Outro"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const cardBrand = getCardBrand(formData.numero)

      if (isEditing) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === isEditing
              ? {
                  ...card,
                  numero: formData.numero,
                  nome_titular: formData.nome_titular,
                  validade: formData.validade,
                  bandeira: cardBrand,
                  updated_at: new Date(),
                }
              : card,
          ),
        )
        toast({
          title: "Sucesso!",
          description: "Cartão atualizado com sucesso.",
        })
      } else {
        const newCard: PaymentCard = {
          id: Date.now().toString(),
          user_id: userId,
          numero: formData.numero,
          nome_titular: formData.nome_titular,
          validade: formData.validade,
          cvv: formData.cvv,
          bandeira: cardBrand,
          created_at: new Date(),
          updated_at: new Date(),
        }
        setCards((prev) => [...prev, newCard])
        toast({
          title: "Sucesso!",
          description: "Novo cartão adicionado com sucesso.",
        })
      }

      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cartão.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (card: PaymentCard) => {
    setFormData({
      numero: card.numero,
      nome_titular: card.nome_titular,
      validade: card.validade,
      cvv: "***", // Don't show real CVV
      bandeira: card.bandeira,
    })
    setIsEditing(card.id)
    setIsAdding(true)
  }

  const handleDelete = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId))
    toast({
      title: "Sucesso!",
      description: "Cartão removido com sucesso.",
    })
  }

  const resetForm = () => {
    setFormData({
      numero: "",
      nome_titular: "",
      validade: "",
      cvv: "",
      bandeira: "",
    })
    setIsEditing(null)
    setIsAdding(false)
  }

  const maskCardForDisplay = (number: string) => {
    const cleanNumber = number.replace(/\D/g, "")
    return `**** **** **** ${cleanNumber.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seus Cartões</h3>
        <Button onClick={() => setIsAdding(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cartão
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Cartão" : "Novo Cartão"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="numero">Número do Cartão</Label>
                  <Input
                    id="numero"
                    value={maskCardNumber(formData.numero)}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome_titular">Nome do Titular</Label>
                  <Input
                    id="nome_titular"
                    value={formData.nome_titular}
                    onChange={(e) => setFormData({ ...formData, nome_titular: e.target.value.toUpperCase() })}
                    placeholder="NOME COMO NO CARTÃO"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validade">Validade</Label>
                  <Input
                    id="validade"
                    value={maskExpiry(formData.validade)}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{isEditing ? "Atualizar" : "Adicionar"} Cartão</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {cards.map((card) => (
          <Card key={card.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{maskCardForDisplay(card.numero)}</p>
                    <p className="text-sm text-muted-foreground">{card.nome_titular}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.bandeira} • Válido até {card.validade}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(card)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(card.id)}>
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
            <h3 className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground mb-4">Adicione um cartão para facilitar suas compras.</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

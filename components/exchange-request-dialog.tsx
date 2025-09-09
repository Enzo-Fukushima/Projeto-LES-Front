"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { mockOrderItems, getBookById } from "@/lib/mock-data"
import { RefreshCw, X } from "lucide-react"

interface ExchangeRequestDialogProps {
  orderId: string
  onClose: () => void
}

export function ExchangeRequestDialog({ orderId, onClose }: ExchangeRequestDialogProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [exchangeReason, setExchangeReason] = useState("")
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const orderItems = mockOrderItems.filter((item) => item.order_id === orderId)

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleItemReasonChange = (itemId: string, reason: string) => {
    setItemReasons((prev) => ({ ...prev, [itemId]: reason }))
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || !exchangeReason.trim()) {
      alert("Por favor, selecione pelo menos um item e informe o motivo da troca.")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert("Solicitação de troca enviada com sucesso! Você receberá um e-mail com as instruções.")
    setIsSubmitting(false)
    onClose()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Solicitar Troca de Itens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Selecione os itens para troca:</Label>
            <div className="space-y-3 mt-3">
              {orderItems.map((item) => {
                const book = getBookById(item.book_id)
                const isSelected = selectedItems.includes(item.id)

                return (
                  <Card key={item.id} className={isSelected ? "ring-2 ring-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => handleItemToggle(item.id)} />
                        <div className="flex items-center gap-3 flex-1">
                          {book && (
                            <img
                              src={book.imagem_url || "/placeholder.svg"}
                              alt={book.titulo}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{book?.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantidade} • {formatPrice(item.preco_total)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pl-8">
                          <Label htmlFor={`reason-${item.id}`} className="text-sm">
                            Motivo específico para este item:
                          </Label>
                          <Textarea
                            id={`reason-${item.id}`}
                            placeholder="Ex: Produto danificado, tamanho incorreto, não atendeu expectativas..."
                            value={itemReasons[item.id] || ""}
                            onChange={(e) => handleItemReasonChange(item.id, e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="general-reason" className="text-base font-semibold">
              Motivo geral da troca: *
            </Label>
            <Textarea
              id="general-reason"
              placeholder="Descreva o motivo principal da solicitação de troca..."
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              className="mt-2"
              rows={3}
              required
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Informações importantes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Você tem até 30 dias após a entrega para solicitar trocas</li>
              <li>• Os itens devem estar em perfeito estado e na embalagem original</li>
              <li>• Após aprovação, você receberá instruções para envio</li>
              <li>• Um cupom será gerado após recebermos os itens</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || selectedItems.length === 0} className="flex-1">
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Solicitar Troca
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

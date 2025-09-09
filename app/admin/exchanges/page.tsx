"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, Check, X, Package, Gift, AlertTriangle, TrendingUp } from "lucide-react"
import type { ExchangeRequest, ExchangeStatus } from "@/lib/types"
import { updateStockQuantity, getStockImpactForExchange } from "@/lib/mock-data"

// Mock exchange requests data
const mockExchangeRequests: ExchangeRequest[] = [
  {
    id: "EX001",
    orderId: "ORD001",
    customerId: "CUST001",
    customerName: "João Silva",
    customerEmail: "joao@email.com",
    items: [
      {
        productId: "1",
        productName: "Dom Casmurro",
        quantity: 1,
        reason: "Produto danificado",
        description: "Livro chegou com páginas rasgadas",
      },
    ],
    status: "SOLICITADA",
    requestDate: "2024-01-15",
    totalValue: 29.9,
  },
  {
    id: "EX002",
    orderId: "ORD002",
    customerId: "CUST002",
    customerName: "Maria Santos",
    customerEmail: "maria@email.com",
    items: [
      {
        productId: "2",
        productName: "O Cortiço",
        quantity: 1,
        reason: "Produto errado",
        description: "Recebi edição diferente da solicitada",
      },
    ],
    status: "AUTORIZADA",
    requestDate: "2024-01-14",
    totalValue: 24.9,
    authorizationDate: "2024-01-15",
    adminNotes: "Troca autorizada - cliente pode enviar o produto",
  },
  {
    id: "EX003",
    orderId: "ORD003",
    customerId: "CUST003",
    customerName: "Pedro Costa",
    customerEmail: "pedro@email.com",
    items: [
      {
        productId: "3",
        productName: "Memórias Póstumas",
        quantity: 1,
        reason: "Não gostei",
        description: "Não era o que esperava",
      },
    ],
    status: "EM_TROCA",
    requestDate: "2024-01-12",
    totalValue: 32.9,
    authorizationDate: "2024-01-13",
    adminNotes: "Produto em trânsito para nossa loja",
  },
]

const statusColors: Record<ExchangeStatus, string> = {
  SOLICITADA: "bg-yellow-100 text-yellow-800",
  AUTORIZADA: "bg-blue-100 text-blue-800",
  EM_TROCA: "bg-purple-100 text-purple-800",
  RECEBIDA: "bg-green-100 text-green-800",
  CUPOM_GERADO: "bg-emerald-100 text-emerald-800",
  REJEITADA: "bg-red-100 text-red-800",
}

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>(mockExchangeRequests)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [newStatus, setNewStatus] = useState<ExchangeStatus>("AUTORIZADA")
  const [isProcessing, setIsProcessing] = useState(false)
  const [returnToInventory, setReturnToInventory] = useState<Record<string, boolean>>({})
  const [stockImpact, setStockImpact] = useState<
    Array<{
      productId: string
      productName: string
      quantity: number
      currentStock: number
      newStock: number
      canReturn: boolean
    }>
  >([])

  const handleStatusUpdate = async (exchangeId: string, status: ExchangeStatus, notes?: string) => {
    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const exchange = exchanges.find((e) => e.id === exchangeId)

    if (status === "RECEBIDA" && exchange) {
      // Calculate stock impact for this exchange
      const impact = getStockImpactForExchange(
        exchange.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      )
      setStockImpact(impact)

      // Initialize return to inventory checkboxes (default to true for good condition items)
      const initialReturnState: Record<string, boolean> = {}
      exchange.items.forEach((item) => {
        initialReturnState[item.productId] = true // Default to returning to inventory
      })
      setReturnToInventory(initialReturnState)
    }

    setExchanges((prev) =>
      prev.map((exchange) =>
        exchange.id === exchangeId
          ? {
              ...exchange,
              status,
              adminNotes: notes || exchange.adminNotes,
              authorizationDate:
                status === "AUTORIZADA" ? new Date().toISOString().split("T")[0] : exchange.authorizationDate,
              receivedDate: status === "RECEBIDA" ? new Date().toISOString().split("T")[0] : exchange.receivedDate,
              couponCode: status === "CUPOM_GERADO" ? `TROCA${exchangeId}${Date.now()}` : exchange.couponCode,
            }
          : exchange,
      ),
    )

    setIsProcessing(false)
    if (status !== "RECEBIDA") {
      setSelectedExchange(null)
      setAdminNotes("")
    }
  }

  const handleInventoryReturn = async (exchangeId: string) => {
    const exchange = exchanges.find((e) => e.id === exchangeId)
    if (!exchange) return

    setIsProcessing(true)

    // Update inventory for items marked to return
    let inventoryUpdated = false
    exchange.items.forEach((item) => {
      if (returnToInventory[item.productId]) {
        const success = updateStockQuantity(item.productId, item.quantity)
        if (success) {
          inventoryUpdated = true
        }
      }
    })

    // Generate coupon after inventory processing
    const couponCode = `TROCA${exchangeId}${Date.now()}`

    setExchanges((prev) =>
      prev.map((ex) =>
        ex.id === exchangeId
          ? {
              ...ex,
              status: "CUPOM_GERADO" as ExchangeStatus,
              couponCode,
              adminNotes: `${ex.adminNotes || ""}\nItens processados: ${inventoryUpdated ? "Alguns itens retornaram ao estoque" : "Nenhum item retornou ao estoque"}`,
            }
          : ex,
      ),
    )

    setIsProcessing(false)
    setSelectedExchange(null)
    setStockImpact([])
    setReturnToInventory({})
  }

  const handleGenerateCoupon = async (exchangeId: string) => {
    const exchange = exchanges.find((e) => e.id === exchangeId)
    if (!exchange) return

    const couponCode = `TROCA${exchangeId}${Date.now()}`
    await handleStatusUpdate(exchangeId, "CUPOM_GERADO", `Cupom gerado: ${couponCode}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Trocas</h1>
        <p className="text-muted-foreground">Visualize e gerencie todas as solicitações de troca dos clientes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchanges.filter((e) => e.status === "SOLICITADA").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchanges.filter((e) => e.status === "AUTORIZADA").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Troca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchanges.filter((e) => e.status === "EM_TROCA").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchanges.filter((e) => e.status === "CUPOM_GERADO").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Troca</CardTitle>
          <CardDescription>Lista de todas as solicitações de troca dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Troca</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchanges.map((exchange) => (
                <TableRow key={exchange.id}>
                  <TableCell className="font-medium">{exchange.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exchange.customerName}</div>
                      <div className="text-sm text-muted-foreground">{exchange.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{exchange.orderId}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {exchange.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.productName} (x{item.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[exchange.status]}>{exchange.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>{exchange.requestDate}</TableCell>
                  <TableCell>R$ {exchange.totalValue.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedExchange(exchange)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Troca - {exchange.id}</DialogTitle>
                            <DialogDescription>Gerencie a solicitação de troca do cliente</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Cliente</Label>
                                <p>{exchange.customerName}</p>
                                <p className="text-sm text-muted-foreground">{exchange.customerEmail}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Pedido</Label>
                                <p>{exchange.orderId}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Produtos para Troca</Label>
                              <div className="space-y-2 mt-2">
                                {exchange.items.map((item, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-sm text-muted-foreground">Quantidade: {item.quantity}</div>
                                    <div className="text-sm">
                                      <strong>Motivo:</strong> {item.reason}
                                    </div>
                                    <div className="text-sm">
                                      <strong>Descrição:</strong> {item.description}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {exchange.adminNotes && (
                              <div>
                                <Label className="text-sm font-medium">Observações do Admin</Label>
                                <p className="text-sm mt-1">{exchange.adminNotes}</p>
                              </div>
                            )}

                            {exchange.status === "SOLICITADA" && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="notes">Observações (opcional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Adicione observações sobre a autorização..."
                                  />
                                </div>
                              </div>
                            )}

                            {exchange.status === "AUTORIZADA" && (
                              <div>
                                <Label htmlFor="status">Atualizar Status</Label>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value) => setNewStatus(value as ExchangeStatus)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="EM_TROCA">Em Troca</SelectItem>
                                    <SelectItem value="RECEBIDA">Recebida</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {exchange.status === "RECEBIDA" && !exchange.couponCode && (
                              <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                    <h4 className="font-medium text-green-800">Produtos Recebidos</h4>
                                  </div>
                                  <p className="text-sm text-green-700">
                                    Selecione quais itens devem retornar ao estoque e gere o cupom para o cliente.
                                  </p>
                                </div>

                                {stockImpact.length > 0 && (
                                  <div className="space-y-3">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4" />
                                      Impacto no Estoque
                                    </Label>

                                    {stockImpact.map((impact) => (
                                      <div key={impact.productId} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Checkbox
                                              id={`return-${impact.productId}`}
                                              checked={returnToInventory[impact.productId] || false}
                                              onCheckedChange={(checked) =>
                                                setReturnToInventory((prev) => ({
                                                  ...prev,
                                                  [impact.productId]: checked as boolean,
                                                }))
                                              }
                                            />
                                            <div>
                                              <Label
                                                htmlFor={`return-${impact.productId}`}
                                                className="font-medium cursor-pointer"
                                              >
                                                {impact.productName}
                                              </Label>
                                              <p className="text-sm text-muted-foreground">
                                                Quantidade: {impact.quantity} unidade(s)
                                              </p>
                                            </div>
                                          </div>

                                          <div className="text-right">
                                            <div className="text-sm">
                                              <span className="text-muted-foreground">Estoque atual: </span>
                                              <span className="font-medium">{impact.currentStock}</span>
                                            </div>
                                            {returnToInventory[impact.productId] && (
                                              <div className="text-sm text-green-600">
                                                <span>Novo estoque: </span>
                                                <span className="font-medium">{impact.newStock}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {!impact.canReturn && (
                                          <div className="flex items-center gap-2 text-amber-600 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Item em condição inadequada para retorno ao estoque</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    <Separator />

                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-sm text-blue-800">
                                        <strong>Resumo:</strong>{" "}
                                        {Object.values(returnToInventory).filter(Boolean).length} de{" "}
                                        {stockImpact.length} itens retornarão ao estoque.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {exchange.couponCode && (
                              <div className="bg-emerald-50 p-4 rounded-lg">
                                <Label className="text-sm font-medium text-emerald-800">Cupom Gerado</Label>
                                <p className="font-mono text-lg text-emerald-900">{exchange.couponCode}</p>
                              </div>
                            )}
                          </div>

                          <DialogFooter className="gap-2">
                            {exchange.status === "SOLICITADA" && (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(exchange.id, "REJEITADA", adminNotes || "Troca rejeitada")
                                  }
                                  disabled={isProcessing}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(exchange.id, "AUTORIZADA", adminNotes || "Troca autorizada")
                                  }
                                  disabled={isProcessing}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Autorizar
                                </Button>
                              </>
                            )}

                            {exchange.status === "AUTORIZADA" && (
                              <Button
                                onClick={() => handleStatusUpdate(exchange.id, newStatus)}
                                disabled={isProcessing}
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Atualizar Status
                              </Button>
                            )}

                            {exchange.status === "RECEBIDA" && !exchange.couponCode && (
                              <Button onClick={() => handleInventoryReturn(exchange.id)} disabled={isProcessing}>
                                <Gift className="h-4 w-4 mr-2" />
                                {isProcessing ? "Processando..." : "Processar Estoque e Gerar Cupom"}
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

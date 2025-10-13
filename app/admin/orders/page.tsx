"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Eye, ShoppingCart, Package, MoreHorizontal, CheckCircle, Clock, Truck, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState(mockOrders)
  const { toast } = useToast()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.codigo_pedido.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus as any }

          if (newStatus === "enviado" && !order.codigo_rastreamento) {
            updatedOrder.codigo_rastreamento = `BR${Math.random().toString().slice(2, 11)}`
            updatedOrder.data_envio = new Date()
          }

          if (newStatus === "entregue" && !order.data_entrega) {
            updatedOrder.data_entrega = new Date()
          }

          return updatedOrder
        }
        return order
      }),
    )

    toast({
      title: "Status do pedido atualizado",
      description: `O pedido foi marcado como ${getStatusLabel(newStatus).toLowerCase()}.`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregue":
        return "default"
      case "enviado":
        return "secondary"
      case "processando":
        return "outline"
      case "cancelado":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "entregue":
        return "Entregue"
      case "enviado":
        return "Enviado"
      case "processando":
        return "Processando"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">Gerencie todos os pedidos da loja</p>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Rastreamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.codigo_pedido}</p>
                        <p className="text-sm text-muted-foreground">Cliente: João Silva</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(order.data_pedido)}</p>
                        {order.data_entrega && (
                          <p className="text-sm text-muted-foreground">Entregue: {formatDate(order.data_entrega)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">
                            <Badge variant="outline">Pendente</Badge>
                          </SelectItem>
                          <SelectItem value="processando">
                            <Badge variant="outline">Processando</Badge>
                          </SelectItem>
                          <SelectItem value="enviado">
                            <Badge variant="secondary">Enviado</Badge>
                          </SelectItem>
                          <SelectItem value="entregue">
                            <Badge variant="default">Entregue</Badge>
                          </SelectItem>
                          <SelectItem value="cancelado">
                            <Badge variant="destructive">Cancelado</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatPrice(order.valor_total)}</TableCell>
                    <TableCell>
                      {order.codigo_rastreamento ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">{order.codigo_rastreamento}</code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "processando")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Marcar como Processando
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "enviado")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Marcar como Enviado
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "entregue")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Entregue
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelado")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                          </DropdownMenuItem>
                          {order.status === "enviado" && !order.codigo_rastreamento && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "enviado")}>
                              <Package className="mr-2 h-4 w-4" />
                              Gerar Código de Rastreamento
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

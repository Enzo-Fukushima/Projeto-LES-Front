"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { mockOrders, mockOrderItems, getBookById } from "@/lib/mock-data"
import { ArrowLeft, Package } from "lucide-react"

export default function OrdersPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar logado para ver seus pedidos.</p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filter orders for current user
  const userOrders = mockOrders.filter((order) => order.user_id === user.id)

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

  const getOrderItems = (orderId: string) => {
    return mockOrderItems.filter((item) => item.order_id === orderId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Loja
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus pedidos</p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-4">Você ainda não fez nenhum pedido.</p>
            <Button asChild>
              <Link href="/">Começar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => {
            const orderItems = getOrderItems(order.id)

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Pedido {order.codigo_pedido}
                    </CardTitle>
                    <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Pedido em: {formatDate(order.data_pedido)}</span>
                    {order.data_entrega && <span>Entregue em: {formatDate(order.data_entrega)}</span>}
                    <span>Total: {formatPrice(order.valor_total)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                      <div className="space-y-2">
                        {orderItems.map((item) => {
                          const book = getBookById(item.book_id)
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 border-b last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                {book && (
                                  <img
                                    src={book.imagem_url || "/placeholder.svg"}
                                    alt={book.titulo}
                                    className="w-12 h-16 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{book?.titulo}</p>
                                  <p className="text-sm text-muted-foreground">Quantidade: {item.quantidade}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(item.preco_total)}</p>
                                <p className="text-sm text-muted-foreground">{formatPrice(item.preco_unitario)} cada</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {order.codigo_rastreamento && (
                      <div>
                        <h4 className="font-semibold mb-2">Rastreamento</h4>
                        <code className="text-sm bg-muted px-3 py-2 rounded">{order.codigo_rastreamento}</code>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        <p>Subtotal: {formatPrice(order.subtotal)}</p>
                        <p>Frete: {formatPrice(order.valor_frete)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">Total: {formatPrice(order.valor_total)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

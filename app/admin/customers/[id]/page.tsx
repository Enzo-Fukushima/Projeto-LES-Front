"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserById, mockOrders, mockOrderItems, getBookById } from "@/lib/mock-data"
import { ArrowLeft, User, Package, Phone, Mail, Calendar } from "lucide-react"

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string

  const customer = getUserById(customerId)
  const customerOrders = mockOrders.filter((order) => order.user_id === customerId)

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cliente não encontrado</h2>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date))
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

  const totalSpent = customerOrders.reduce((sum, order) => sum + order.valor_total, 0)
  const totalOrders = customerOrders.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Cliente</h2>
          <p className="text-muted-foreground">Informações completas e histórico de transações</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Nome Completo</span>
                </div>
                <p className="text-lg">{customer.nome}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Código Cliente</span>
                </div>
                <p className="font-mono text-lg">{customer.codigo_cliente}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p>{customer.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Telefone</span>
                </div>
                <p>{customer.telefone || "Não informado"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data de Nascimento</span>
                </div>
                <p>
                  {customer.data_nascimento
                    ? new Intl.DateTimeFormat("pt-BR").format(new Date(customer.data_nascimento))
                    : "Não informado"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant={customer.ativo ? "default" : "secondary"}>{customer.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Cadastrado em</span>
                </div>
                <p>{formatDate(customer.data_criacao)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Última atualização</span>
                </div>
                <p>{formatDate(customer.data_atualizacao)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Compras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {totalOrders > 0 ? formatPrice(totalSpent / totalOrders) : formatPrice(0)}
                </div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">Este cliente ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {customerOrders.map((order) => {
                const orderItems = getOrderItems(order.id)

                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Pedido {order.codigo_pedido}</h4>
                        <p className="text-sm text-muted-foreground">{formatDate(order.data_pedido)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                        <p className="text-lg font-bold mt-1">{formatPrice(order.valor_total)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Itens do Pedido:</h5>
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
                                  className="w-8 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{book?.titulo}</p>
                                <p className="text-xs text-muted-foreground">Qtd: {item.quantidade}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatPrice(item.preco_total)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {order.codigo_rastreamento && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Código de rastreamento:
                          <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">{order.codigo_rastreamento}</code>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

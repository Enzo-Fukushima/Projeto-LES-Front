import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
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
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{order.codigo_pedido}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.data_pedido)}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-medium">{formatPrice(order.valor_total)}</p>
                <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ExchangeRequestDialog } from "@/components/exchange-request-dialog";
import { pedidosService } from "@/services/PedidosService";
import type { PedidoDTO } from "@/lib/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PedidoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // Supondo que exista endpoint GET /pedidos?clienteId=...
        const response = await pedidosService.listByUser(user.id);
        setOrders(response);
        console.log(response);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const formatDate = (date?: string) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(new Date(date)) : "-";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregue":
        return "default";
      case "enviado":
        return "secondary";
      case "processando":
        return "outline";
      case "cancelado":
        return "destructive";
      case "em_troca":
        return "outline";
      case "troca_autorizada":
        return "secondary";
      case "troca_recebida":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "entregue":
        return "Entregue";
      case "enviado":
        return "Enviado";
      case "processando":
        return "Processando";
      case "cancelado":
        return "Cancelado";
      case "em_troca":
        return "Em Troca";
      case "troca_autorizada":
        return "Troca Autorizada";
      case "troca_recebida":
        return "Troca Recebida";
      default:
        return status;
    }
  };

  const canRequestExchange = (order: PedidoDTO) => {
    if (!order.dataEntrega) return false;
    return (
      order.status === "entregue" &&
      new Date().getTime() - new Date(order.dataEntrega).getTime() <=
        30 * 24 * 60 * 60 * 1000
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você precisa estar logado para ver seus pedidos.
          </p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Loja
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos
          </p>
        </div>
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não fez nenhum pedido.
            </p>
            <Button asChild>
              <Link href="/">Começar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} data-testid="pedido-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Pedido {order.id}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    {canRequestExchange(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderForExchange(order.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" /> Solicitar Troca
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Pedido em: {formatDate(order.dataPedido)}</span>
                  {order.dataEntrega && (
                    <span>Entregue em: {formatDate(order.dataEntrega)}</span>
                  )}
                  <span>Total: {formatPrice(order.valorTotal || 0)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.itens.map((item) => (
                        <div
                          key={item.livroId}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src="/placeholder.svg"
                              alt={item.titulo}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{item.titulo}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantidade: {item.quantidade}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.subtotal)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.precoUnitario)} cada
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.codigoRastreamento && (
                    <div>
                      <h4 className="font-semibold mb-2">Rastreamento</h4>
                      <code className="text-sm bg-muted px-3 py-2 rounded">
                        {order.codigoRastreamento}
                      </code>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Subtotal: {formatPrice(order.valorTotal || 0)}</p>
                      <p>Frete: {formatPrice(order.valorFrete || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Total: {formatPrice(order.valorTotal || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrderForExchange && (
        <ExchangeRequestDialog
          orderId={selectedOrderForExchange}
          onClose={() => setSelectedOrderForExchange(null)}
        />
      )}
    </div>
  );
}

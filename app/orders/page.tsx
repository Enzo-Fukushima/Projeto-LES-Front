"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ExchangeRequestDialog } from "@/components/orders/exchange-request-dialog";
import { pedidosService } from "@/services/PedidosService";
import { trocasService } from "@/services/TrocaService";
import type { PedidoDTO } from "@/lib/types";
import type { TrocaDTO } from "@/services/TrocaService";

interface PedidoComTroca extends PedidoDTO {
  troca?: TrocaDTO;
  statusExibicao?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PedidoComTroca[]>([]);
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
        
        // Busca pedidos e trocas do cliente
        const [pedidosData, trocasData] = await Promise.all([
          pedidosService.listByUser(user.id),
          trocasService.listarTrocasCliente(user.id),
        ]);

        // Mapeia as trocas por pedidoId
        const trocasPorPedido = new Map<number, TrocaDTO>();
        trocasData.forEach((troca) => {
          // Armazena apenas a troca mais recente por pedido
          const trocaExistente = trocasPorPedido.get(troca.pedidoId);
          if (!trocaExistente || new Date(troca.dataSolicitacao) > new Date(trocaExistente.dataSolicitacao)) {
            trocasPorPedido.set(troca.pedidoId, troca);
          }
        });

        // Enriquece os pedidos com informações de troca
        const pedidosEnriquecidos: PedidoComTroca[] = pedidosData.map((pedido) => {
          const troca = trocasPorPedido.get(pedido.id);
          return {
            ...pedido,
            troca,
            statusExibicao: troca ? troca.status : pedido.status,
          };
        });

        setOrders(pedidosEnriquecidos);
        console.log("Pedidos com trocas:", pedidosEnriquecidos);
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
      // Status de troca
      case "pendente":
        return "outline";
      case "autorizada":
        return "secondary";
      case "em_transito":
        return "secondary";
      case "recebida":
        return "default";
      case "concluida":
        return "default";
      case "negada":
        return "destructive";
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
      // Status de troca
      case "pendente":
        return "Troca Pendente";
      case "autorizada":
        return "Troca Autorizada";
      case "em_transito":
        return "Devolvendo Item";
      case "recebida":
        return "Troca Recebida";
      case "concluida":
        return "Troca Concluída";
      case "negada":
        return "Troca Negada";
      default:
        return status;
    }
  };

  const canRequestExchange = (order: PedidoComTroca) => {
    // Não pode solicitar troca se já existe uma troca ativa
    if (order.troca && !["concluida", "negada"].includes(order.troca.status)) {
      return false;
    }
    
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
                    {order.troca && (
                      <span className="text-sm font-normal text-muted-foreground">
                        (Troca #{order.troca.id})
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(order.statusExibicao || order.status)}>
                      {getStatusLabel(order.statusExibicao || order.status)}
                    </Badge>
                    {canRequestExchange(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderForExchange(order.id)}
                        data-cy={`troca-${order.id}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" /> Solicitar Troca
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Pedido em: {formatDate(order.dataCriacao)}</span>
                  {order.dataEntrega && (
                    <span>Entregue em: {formatDate(order.dataEntrega)}</span>
                  )}
                  {order.troca && (
                    <span>Troca solicitada em: {formatDate(order.troca.dataSolicitacao)}</span>
                  )}
                  <span>Total: {formatPrice(order.valorTotal || 0)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Informações da troca */}
                  {order.troca && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          Informações da Troca
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Status:</strong> {getStatusLabel(order.troca.status)}</p>
                        <p><strong>Motivo:</strong> {order.troca.motivoTroca}</p>
                        {order.troca.observacaoAdmin && (
                          <p><strong>Observação:</strong> {order.troca.observacaoAdmin}</p>
                        )}
                        {order.troca.codigoCupom && (
                          <p>
                            <strong>Cupom gerado:</strong>{" "}
                            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
                              {order.troca.codigoCupom}
                            </code>
                          </p>
                        )}
                        <p><strong>Valor da troca:</strong> {formatPrice(order.troca.valorTotalTroca)}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.itens.map((item) => {
                        // Verifica se este item está em processo de troca
                        const itemEmTroca = order.troca?.itens.find(
                          (ti) => ti.pedidoItemId === item.id
                        );

                        return (
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
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{item.titulo}</p>
                                  {itemEmTroca && (
                                    <Badge variant="outline" className="text-xs">
                                      Em troca
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Quantidade: {item.quantidade}
                                </p>
                                {itemEmTroca && (
                                  <p className="text-xs text-blue-600">
                                    Qtd. em troca: {itemEmTroca.quantidade}
                                  </p>
                                )}
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
                        );
                      })}
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
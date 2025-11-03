"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pedidosService } from "@/services/PedidosService";
import { trocasService } from "@/services/TrocaService";
import type { PedidoDTO } from "@/lib/types";
import type { TrocaDTO } from "@/services/TrocaService";

interface PedidoComTroca extends PedidoDTO {
  troca?: TrocaDTO;
  statusExibicao?: string;
}

//  Funções utilitárias
const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

const formatDate = (date?: string | Date) =>
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
      return "Troca em Trânsito";
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<PedidoComTroca[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // 🔄 Busca inicial de pedidos e trocas
  useEffect(() => {
    (async () => {
      try {
        const [pedidosData, trocasData] = await Promise.all([
          pedidosService.getAll(),
          trocasService.listarTodasTrocas(),
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
        console.log("Pedidos carregados:", pedidosEnriquecidos);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  //  Filtro e busca otimizados com useMemo
  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(query) ||
        order.clienteNome?.toLowerCase().includes(query) ||
        order.codigoRastreamento?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || order.statusExibicao === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  //  Atualiza status no backend e localmente
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    
    // Se o pedido tem troca ativa, não permite alterar o status do pedido
    if (order?.troca && !["concluida", "negada"].includes(order.troca.status)) {
      toast({
        title: "Pedido em processo de troca",
        description: "Não é possível alterar o status de pedidos com troca ativa. Gerencie pela seção de trocas.",
        variant: "destructive",
      });
      return;
    }

    // Não permite alterar status de pedidos já entregues
    if (order?.status === "entregue") {
      toast({
        title: "Pedido já entregue",
        description: "Não é possível alterar o status de pedidos que já foram entregues.",
        variant: "destructive",
      });
      return;
    }

    // Não permite marcar como entregue sem antes estar enviado
    if (newStatus === "entregue" && order?.status !== "enviado") {
      toast({
        title: "Pedido não foi enviado",
        description: "Um pedido só pode ser marcado como entregue depois de ser enviado.",
        variant: "destructive",
      });
      return;
    }

    try {
      await pedidosService.updateStatus(orderId.toString(), newStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus as PedidoDTO["status"],
                statusExibicao: newStatus,
                codigoRastreamento:
                  newStatus === "enviado" && !o.codigoRastreamento
                    ? `BR${Math.random().toString().slice(2, 11)}`
                    : o.codigoRastreamento,
                dataEnvio:
                  newStatus === "enviado"
                    ? new Date().toISOString()
                    : o.dataEnvio,
                dataEntrega:
                  newStatus === "entregue"
                    ? new Date().toISOString()
                    : o.dataEntrega,
              }
            : o
        )
      );

      toast({
        title: "Status atualizado",
        description: `Pedido #${orderId} marcado como ${getStatusLabel(newStatus)}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // 🧱 Renderização principal
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">
          Gerencie todos os pedidos da loja
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* 🔎 Filtros */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, cliente ou rastreamento..."
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
                <SelectItem value="pendente">Troca Pendente</SelectItem>
                <SelectItem value="autorizada">Troca Autorizada</SelectItem>
                <SelectItem value="em_transito">Troca em Trânsito</SelectItem>
                <SelectItem value="recebida">Troca Recebida</SelectItem>
                <SelectItem value="concluida">Troca Concluída</SelectItem>
                <SelectItem value="negada">Troca Negada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 📦 Tabela de pedidos */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Rastreamento</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    // Verifica se o pedido tem troca ativa (não concluída/negada)
                    const temTrocaAtiva = order.troca && !["concluida", "negada"].includes(order.troca.status);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {order.clienteNome ?? "Desconhecido"}
                            </p>
                            {order.troca && (
                              <div className="flex items-center gap-1 mt-1">
                                <RefreshCw className="h-3 w-3 text-blue-500" />
                                <p className="text-xs text-blue-600">
                                  Troca #{order.troca.id}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <p>{formatDate(order.dataCriacao)}</p>
                          {order.troca && (
                            <p className="text-sm text-muted-foreground">
                              Troca: {formatDate(order.troca.dataSolicitacao)}
                            </p>
                          )}
                          {order.dataEntrega && !order.troca && (
                            <p className="text-sm text-muted-foreground">
                              Entregue: {formatDate(order.dataEntrega)}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          {temTrocaAtiva || order.status === "entregue" ? (
                            // Badge imutável para pedidos com troca ativa ou já entregues
                            <Badge variant={getStatusColor(order.statusExibicao!)}>
                              {getStatusLabel(order.statusExibicao!)}
                            </Badge>
                          ) : (
                            // Select editável para pedidos sem troca ativa e não entregues
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) =>
                                handleStatusChange(order.id, newStatus)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge variant={getStatusColor(order.status)}>
                                    {getStatusLabel(order.status)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
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
                          )}
                        </TableCell>

                        <TableCell>
                          {formatPrice(order.valorTotal)}
                          {order.troca && (
                            <p className="text-xs text-muted-foreground">
                              Troca: {formatPrice(order.troca.valorTotalTroca)}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          {order.codigoRastreamento ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {order.codigoRastreamento}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
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
import { ShoppingCart, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pedidosService } from "@/services/PedidosService";
import type { PedidoDTO } from "@/lib/types";

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
    default:
      return status;
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<PedidoDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // 🔄 Busca inicial de pedidos
  useEffect(() => {
    (async () => {
      try {
        const data = await pedidosService.getAll();
        setOrders(data);
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
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  //  Atualiza status no backend e localmente
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await pedidosService.updateStatus(orderId, newStatus);

      setOrders((prev) =>
  prev.map((o) =>
    o.id === Number(orderId)
      ? {
          ...o,
          status: newStatus as PedidoDTO["status"],
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
        description: `Pedido #${orderId} marcado como ${getStatusLabel(
          newStatus
        )}.`,
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
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Cliente: {order.clienteNome ?? "Desconhecido"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <p>{formatDate(order.dataPedido)}</p>
                        {order.dataEntrega && (
                          <p className="text-sm text-muted-foreground">
                            Entregue: {formatDate(order.dataEntrega)}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
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
                      </TableCell>

                      <TableCell>{formatPrice(order.valorTotal)}</TableCell>

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
                  ))
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

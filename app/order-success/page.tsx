"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Truck } from "lucide-react";
import Link from "next/link";
import { pedidosService } from "@/services/PedidosService";
import type { PedidoDTO } from "@/lib/types";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState<PedidoDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderIdParam) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const fetchedOrder = await pedidosService.getById(Number(orderIdParam));
        setOrder(fetchedOrder);
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
        setError("Não foi possível carregar os detalhes do pedido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdParam]);

  if (!orderIdParam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Número do pedido não informado.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />

          <h1 className="text-3xl font-bold mb-4">
            Pedido Realizado com Sucesso!
          </h1>

          <p className="text-muted-foreground mb-8">
            Seu pedido foi processado e você receberá um email de confirmação em
            breve.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Número do Pedido</h3>
                  <p className="text-2xl font-mono text-primary">{order.id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-semibold">Processamento</p>
                      <p className="text-sm text-muted-foreground">
                        {order.tempoProcessamento || "1-2 dias úteis"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-semibold">Entrega</p>
                      <p className="text-sm text-muted-foreground">
                        {order.tipoEntrega || "Conforme opção selecionada"}
                      </p>
                    </div>
                  </div>
                </div>

                {order.itens && order.itens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                    <ul className="space-y-2 text-sm">
                      {order.itens.map((item) => (
                        <li key={item.livroId} className="flex justify-between">
                          <span>
                            {item.titulo} x {item.quantidade}
                          </span>
                          <span>R$ {item.preco_total.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/orders">Ver Meus Pedidos</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

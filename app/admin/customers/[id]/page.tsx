"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Home, CreditCard, Calendar } from "lucide-react";
import { clientesService } from "@/services/ClienteService";
import type { ClienteDetalhadoDTO } from "@/lib/types";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<
    (ClienteDetalhadoDTO & { telefone?: string }) | null
  >(null);
  const [orders, setOrders] = useState<any[]>([]); // mock temporário
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await clientesService.get(customerId);
        setCustomer({
          ...data,
          telefone:
            data.ddd && data.numeroTelefone
              ? `(${data.ddd}) ${data.numeroTelefone}`
              : "-",
        });
        setOrders([]); // mock temporário
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const formatDate = (date?: string | Date) => {
    if (!date) return "Não informado";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold tracking-tight">
              Cliente não encontrado
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Detalhes do Cliente
          </h2>
          <p className="text-muted-foreground">
            Informações completas e histórico de transações
          </p>
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
                <p className="text-sm font-medium">Nome Completo</p>
                <p className="text-lg">{customer.nome}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Código Cliente</p>
                <p className="font-mono text-lg">{customer.id}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p>{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p>{customer.telefone || "Não informado"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Data de Nascimento</p>
                <p>{formatDate(customer.dataNascimento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Gênero</p>
                <p>{customer.genero}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={customer.ativo ? "default" : "secondary"}>
                  {customer.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Ranking</p>
                <p>{customer.ranking}</p>
              </div>
            </div>

            {/* Endereços */}
            {(customer.enderecos?.length ?? 0) > 0 && (
              <>
                <Separator />
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="h-4 w-4" />
                  Endereços
                </CardTitle>
                <div className="space-y-2">
                  {customer.enderecos.map((endereco) => (
                    <div key={endereco.id} className="p-2 border rounded">
                      <p>
                        {endereco.logradouro}, {endereco.numero} -{" "}
                        {endereco.bairro}
                      </p>
                      <p>
                        {endereco.cidade} / {endereco.estado} - {endereco.cep}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Cartões */}
            {(customer.cartoes?.length ?? 0) > 0 && (
              <>
                <Separator />
                <CardTitle className="flex items-center gap-2 text-base">
                  Cartões de Crédito
                </CardTitle>
                {customer.cartoes?.map((cartao) => (
                  <p key={cartao.id}>
                    {cartao.numero} - {cartao.nomeTitular}
                  </p>
                ))}
              </>
            )}
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
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-sm text-muted-foreground">
                  Total de Pedidos
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatPrice(
                    orders.reduce((sum, o) => sum + o.valor_total, 0)
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {orders.length > 0
                    ? formatPrice(
                        orders.reduce((sum, o) => sum + o.valor_total, 0) /
                          orders.length
                      )
                    : formatPrice(0)}
                </div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

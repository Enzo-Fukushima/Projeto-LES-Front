"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  Check,
  X,
  Package,
  Gift,
  AlertTriangle,
  TrendingUp,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  trocasService,
  TrocaDTO,
  ItemRecebimentoDTO,
} from "@/services/TrocaService";

const statusColors: Record<string, string> = {
  EM_TROCA: "bg-yellow-100 text-yellow-800",
  TROCA_AUTORIZADA: "bg-blue-100 text-blue-800",
  TROCA_RECEBIDA: "bg-green-100 text-green-800",
  TROCA_CONCLUIDA: "bg-emerald-100 text-emerald-800",
  TROCA_NEGADA: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  EM_TROCA: "Em Troca",
  TROCA_AUTORIZADA: "Autorizada",
  TROCA_RECEBIDA: "Recebida",
  TROCA_CONCLUIDA: "Concluída",
  TROCA_NEGADA: "Negada",
};

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<TrocaDTO[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<TrocaDTO | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [returnToInventory, setReturnToInventory] = useState<
    Record<number, boolean>
  >({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadExchanges();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  const loadExchanges = async () => {
    try {
      setIsLoading(true);
      const data = await trocasService.listarTodasTrocas();
      setExchanges(data);
    } catch (error) {
      showNotification(
        "error",
        "Não foi possível carregar as solicitações de troca."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeExchange = async (
    trocaId: number,
    autorizada: boolean
  ) => {
    setIsProcessing(true);
    try {
      await trocasService.autorizarTroca({
        trocaId,
        autorizada,
        observacao: adminNotes || undefined,
      });

      showNotification(
        "success",
        autorizada ? "Troca autorizada com sucesso." : "Troca negada."
      );

      await loadExchanges();
      setIsDialogOpen(false);
      setSelectedExchange(null);
      setAdminNotes("");
    } catch (error) {
      showNotification("error", "Não foi possível processar a autorização.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async (trocaId: number) => {
    setIsProcessing(true);
    try {
      const exchange = exchanges.find((e) => e.id === trocaId);
      if (!exchange) return;

      const itens: ItemRecebimentoDTO[] = exchange.itens.map((item) => ({
        trocaItemId: item.id!,
        retornarEstoque: returnToInventory[item.id!] ?? true,
      }));

      await trocasService.confirmarRecebimento({
        trocaId,
        observacao: adminNotes || undefined,
        itens,
      });

      showNotification(
        "success",
        "Recebimento confirmado, estoque processado e cupom gerado com sucesso!"
      );

      await loadExchanges();
      setIsDialogOpen(false);
      setSelectedExchange(null);
      setAdminNotes("");
      setReturnToInventory({});
    } catch (error) {
      showNotification("error", "Não foi possível confirmar o recebimento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusCount = (status: string) => {
    return exchanges.filter((e) => e.status === status).length;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Alert
          className={
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                notification.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {notification.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold">Gerenciar Trocas</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as solicitações de troca dos clientes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Troca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusCount("EM_TROCA")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusCount("TROCA_AUTORIZADA")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusCount("TROCA_RECEBIDA")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusCount("TROCA_CONCLUIDA")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Troca</CardTitle>
          <CardDescription>
            Lista de todas as solicitações de troca dos clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchanges.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma solicitação de troca encontrada
                  </TableCell>
                </TableRow>
              ) : (
                exchanges.map((exchange) => (
                  <TableRow key={exchange.id}>
                    <TableCell className="font-medium">
                      #{exchange.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {exchange.nomeCliente}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {exchange.clienteId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>#{exchange.pedidoId}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {exchange.itens.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.tituloLivro || `Livro #${item.livroId}`} (x
                            {item.quantidade})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[exchange.status]}>
                        {statusLabels[exchange.status] || exchange.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(exchange.dataSolicitacao)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(exchange.valorTotalTroca)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={
                            isDialogOpen && selectedExchange?.id === exchange.id
                          }
                          onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) {
                              setSelectedExchange(null);
                              setAdminNotes("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedExchange(exchange);
                                setIsDialogOpen(true);
                                setAdminNotes("");
                                const initialState: Record<number, boolean> =
                                  {};
                                exchange.itens.forEach((item) => {
                                  if (item.id) {
                                    initialState[item.id] = true;
                                  }
                                });
                                setReturnToInventory(initialState);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            {selectedExchange && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>
                                    Detalhes da Troca - #{selectedExchange.id}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Gerencie a solicitação de troca do cliente
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Cliente
                                      </Label>
                                      <p>{selectedExchange.nomeCliente}</p>
                                      <p className="text-sm text-muted-foreground">
                                        ID: {selectedExchange.clienteId}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Pedido
                                      </Label>
                                      <p>#{selectedExchange.pedidoId}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">
                                      Motivo da Troca
                                    </Label>
                                    <p className="text-sm mt-1">
                                      {selectedExchange.motivoTroca}
                                    </p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">
                                      Produtos para Troca
                                    </Label>
                                    <div className="space-y-2 mt-2">
                                      {selectedExchange.itens.map(
                                        (item, index) => (
                                          <div
                                            key={index}
                                            className="border rounded p-3"
                                          >
                                            <div className="font-medium">
                                              {item.tituloLivro ||
                                                `Livro #${item.livroId}`}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              Quantidade: {item.quantidade}
                                            </div>
                                            {item.valorUnitario && (
                                              <div className="text-sm">
                                                Valor unitário:{" "}
                                                {formatCurrency(
                                                  item.valorUnitario
                                                )}
                                              </div>
                                            )}
                                            <div className="text-sm">
                                              <strong>Motivo:</strong>{" "}
                                              {item.motivo}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {selectedExchange.observacaoAdmin && (
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Observações do Admin
                                      </Label>
                                      <p className="text-sm mt-1 whitespace-pre-wrap">
                                        {selectedExchange.observacaoAdmin}
                                      </p>
                                    </div>
                                  )}

                                  {selectedExchange.status === "EM_TROCA" && (
                                    <div className="space-y-4">
                                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                          <h4 className="font-medium text-yellow-800">
                                            Troca Solicitada - Aguardando
                                            Análise
                                          </h4>
                                        </div>
                                        <p className="text-sm text-yellow-700">
                                          Analise a solicitação e decida se
                                          autoriza ou nega a troca.
                                        </p>
                                      </div>

                                      <div>
                                        <Label htmlFor="notes">
                                          Observações (opcional)
                                        </Label>
                                        <Textarea
                                          id="notes"
                                          value={adminNotes}
                                          onChange={(e) =>
                                            setAdminNotes(e.target.value)
                                          }
                                          placeholder="Adicione observações sobre a autorização ou negação..."
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {exchange.status === "TROCA_AUTORIZADA" && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-medium text-blue-800">
                                          Troca Autorizada - Aguardando
                                          Recebimento
                                        </h4>
                                      </div>
                                      <p className="text-sm text-blue-700 mb-2">
                                        A troca foi autorizada em{" "}
                                        {formatDate(exchange.dataAutorizacao)}.
                                      </p>
                                      <p className="text-sm text-blue-700">
                                        Quando os produtos chegarem, confirme o
                                        recebimento para processar o estoque e
                                        gerar o cupom.
                                      </p>
                                    </div>
                                  )}

                                  {exchange.status === "TROCA_RECEBIDA" &&
                                    !exchange.codigoCupom && (
                                      <div className="space-y-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Package className="h-5 w-5 text-green-600" />
                                            <h4 className="font-medium text-green-800">
                                              Produtos Recebidos
                                            </h4>
                                          </div>
                                          <p className="text-sm text-green-700">
                                            Selecione quais itens devem retornar
                                            ao estoque e confirme o recebimento.
                                          </p>
                                        </div>

                                        <div className="space-y-3">
                                          <Label className="text-sm font-medium flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Retorno ao Estoque
                                          </Label>

                                          {exchange.itens.map((item) => (
                                            <div
                                              key={item.id}
                                              className="border rounded-lg p-3 space-y-2"
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <Checkbox
                                                    id={`return-${item.id}`}
                                                    checked={
                                                      returnToInventory[
                                                        item.id!
                                                      ] ?? true
                                                    }
                                                    onCheckedChange={(
                                                      checked
                                                    ) =>
                                                      setReturnToInventory(
                                                        (prev) => ({
                                                          ...prev,
                                                          [item.id!]:
                                                            checked as boolean,
                                                        })
                                                      )
                                                    }
                                                  />
                                                  <div>
                                                    <Label
                                                      htmlFor={`return-${item.id}`}
                                                      className="font-medium cursor-pointer"
                                                    >
                                                      {item.tituloLivro ||
                                                        `Livro #${item.livroId}`}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                      Quantidade:{" "}
                                                      {item.quantidade}{" "}
                                                      unidade(s)
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}

                                          <Separator />

                                          <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                              <strong>Resumo:</strong>{" "}
                                              {
                                                Object.values(
                                                  returnToInventory
                                                ).filter(Boolean).length
                                              }{" "}
                                              de {exchange.itens.length} itens
                                              retornarão ao estoque.
                                            </p>
                                          </div>
                                        </div>

                                        <div>
                                          <Label htmlFor="receipt-notes">
                                            Observações (opcional)
                                          </Label>
                                          <Textarea
                                            id="receipt-notes"
                                            value={adminNotes}
                                            onChange={(e) =>
                                              setAdminNotes(e.target.value)
                                            }
                                            placeholder="Adicione observações sobre o recebimento..."
                                          />
                                        </div>
                                      </div>
                                    )}

                                  {selectedExchange.codigoCupom && (
                                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <Label className="text-sm font-medium text-emerald-800">
                                          Troca Concluída com Sucesso
                                        </Label>
                                      </div>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-emerald-700 mb-1">
                                            Cupom Gerado (Uso Único):
                                          </p>
                                          <p className="font-mono text-xl font-bold text-emerald-900 bg-white px-3 py-2 rounded border border-emerald-300">
                                            {selectedExchange.codigoCupom}
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <p className="text-emerald-700">
                                              Valor do cupom:
                                            </p>
                                            <p className="font-semibold text-emerald-900">
                                              {formatCurrency(
                                                selectedExchange.valorTotalTroca
                                              )}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-emerald-700">
                                              Concluída em:
                                            </p>
                                            <p className="font-semibold text-emerald-900">
                                              {formatDate(
                                                selectedExchange.dataConclusao
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                        <p className="text-xs text-emerald-600 mt-2">
                                          ✓ Cupom válido por 6 meses • Uso único
                                          • Cliente:{" "}
                                          {selectedExchange.nomeCliente}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedExchange.status ===
                                    "TROCA_NEGADA" && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <Label className="text-sm font-medium text-red-800">
                                          Troca Negada
                                        </Label>
                                      </div>
                                      <p className="text-sm text-red-700">
                                        Esta solicitação de troca foi negada em{" "}
                                        {formatDate(
                                          selectedExchange.dataAutorizacao
                                        )}
                                        .
                                      </p>
                                      {selectedExchange.observacaoAdmin && (
                                        <div className="mt-2 pt-2 border-t border-red-200">
                                          <p className="text-xs text-red-600 font-medium">
                                            Motivo:
                                          </p>
                                          <p className="text-sm text-red-700">
                                            {selectedExchange.observacaoAdmin}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <DialogFooter className="gap-2">
                                  {selectedExchange.status === "EM_TROCA" && (
                                    <>
                                      <Button
                                        variant="destructive"
                                        onClick={() =>
                                          handleAuthorizeExchange(
                                            selectedExchange.id,
                                            false
                                          )
                                        }
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4 mr-2" />
                                        )}
                                        Negar Troca
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleAuthorizeExchange(
                                            selectedExchange.id,
                                            true
                                          )
                                        }
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4 mr-2" />
                                        )}
                                        Autorizar Troca
                                      </Button>
                                    </>
                                  )}

                                  {selectedExchange.status ===
                                    "TROCA_AUTORIZADA" && (
                                    <Button
                                      onClick={() =>
                                        handleConfirmReceipt(
                                          selectedExchange.id
                                        )
                                      }
                                      disabled={isProcessing}
                                      className="w-full"
                                      data-cy={`confirmarRecebimento-${exchange.id}`}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Gift className="h-4 w-4 mr-2" />
                                      )}
                                      {isProcessing
                                        ? "Processando recebimento, estoque e gerando cupom..."
                                        : "Confirmar Recebimento e Gerar Cupom"}
                                    </Button>
                                  )}
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>

                        {exchange.status === "EM_TROCA" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAuthorizeExchange(exchange.id, false)
                              }
                              disabled={isProcessing}
                              title="Negar troca"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAuthorizeExchange(exchange.id, true)
                              }
                              disabled={isProcessing}
                              title="Autorizar troca"
                              data-cy={`troca-${exchange.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {exchange.status === "TROCA_AUTORIZADA" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedExchange(exchange);
                              setIsDialogOpen(true);
                              const initialState: Record<number, boolean> = {};
                              exchange.itens.forEach((item) => {
                                if (item.id) {
                                  initialState[item.id] = true;
                                }
                              });
                              setReturnToInventory(initialState);
                            }}
                            disabled={isProcessing}
                            title="Confirmar recebimento"
                            data-cy={`confirmaTroca-${exchange.id}`}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

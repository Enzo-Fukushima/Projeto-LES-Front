"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { pedidosService } from "@/services/PedidosService";
import { livrosService } from "@/services/livrosService";
import { trocasService, TrocaItemDTO } from "@/services/TrocaService";
import type { PedidoDTO } from "@/lib/types";

interface ExchangeRequestDialogProps {
  orderId: number;
  onClose: () => void;
}

interface ItemSelection {
  pedidoItemId: number;
  livroId: number;
  quantidade: number;
  quantidadeMaxima: number;
  motivo: string;
  selected: boolean;
}

export function ExchangeRequestDialog({
  orderId,
  onClose,
}: ExchangeRequestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<PedidoDTO | null>(null);
  const [books, setBooks] = useState<Record<number, any>>({});
  const [itemsSelection, setItemsSelection] = useState<
    Record<number, ItemSelection>
  >({});
  const [exchangeReason, setExchangeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // Buscar pedido
        const orderData = await pedidosService.getById(orderId);
        console.log("Dados do pedido:", orderData);
        setOrder(orderData);

        // Verificar se há itens
        if (!orderData.itens || orderData.itens.length === 0) {
          throw new Error("Pedido não possui itens");
        }

        // Buscar dados dos livros
        const bookPromises = orderData.itens.map((item: any) =>
          livrosService.getById(item.livroId || item.livro?.id)
        );
        const booksData = await Promise.all(bookPromises);
        const booksMap: Record<number, any> = {};
        booksData.forEach((book) => (booksMap[book.id] = book));
        setBooks(booksMap);

        // Inicializar seleção de itens
        const initialSelection: Record<number, ItemSelection> = {};
        orderData.itens.forEach((item: any) => {
          const itemId = item.id;
          const livroId = item.livroId || item.livro?.id;
          
          initialSelection[itemId] = {
            pedidoItemId: itemId,
            livroId: livroId,
            quantidade: item.quantidade,
            quantidadeMaxima: item.quantidade,
            motivo: "",
            selected: false,
          };
        });
        setItemsSelection(initialSelection);
      } catch (err: any) {
        console.error("Erro ao carregar dados do pedido:", err);
        const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido";
        toast({
          title: "Erro ao carregar pedido",
          description: errorMessage,
          variant: "destructive",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, onClose, toast]);

  const handleItemToggle = (pedidoItemId: number) => {
    setItemsSelection((prev) => ({
      ...prev,
      [pedidoItemId]: {
        ...prev[pedidoItemId],
        selected: !prev[pedidoItemId].selected,
      },
    }));
  };

  const handleQuantidadeChange = (pedidoItemId: number, quantidade: number) => {
    const item = itemsSelection[pedidoItemId];
    if (quantidade < 1 || quantidade > item.quantidadeMaxima) return;

    setItemsSelection((prev) => ({
      ...prev,
      [pedidoItemId]: {
        ...prev[pedidoItemId],
        quantidade,
      },
    }));
  };

  const handleItemReasonChange = (pedidoItemId: number, motivo: string) => {
    setItemsSelection((prev) => ({
      ...prev,
      [pedidoItemId]: {
        ...prev[pedidoItemId],
        motivo,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user || !order) return;

    // Validar itens selecionados
    const selectedItems = Object.values(itemsSelection).filter(
      (item) => item.selected
    );

    if (selectedItems.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um item para troca.",
        variant: "destructive",
      });
      return;
    }

    // Validar motivo geral
    if (!exchangeReason.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, informe o motivo geral da troca.",
        variant: "destructive",
      });
      return;
    }

    // Validar motivo de cada item
    for (const item of selectedItems) {
      if (!item.motivo.trim()) {
        toast({
          title: "Atenção",
          description: "Informe o motivo específico para cada item selecionado.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Preparar itens para troca
      const itens: TrocaItemDTO[] = selectedItems.map((item) => ({
        pedidoItemId: item.pedidoItemId,
        quantidade: item.quantidade,
        motivo: item.motivo,
      }));

      // Enviar solicitação
      await trocasService.solicitarTroca({
        pedidoId: orderId,
        clienteId: user.id,
        motivoTroca: exchangeReason,
        itens,
      });

      toast({
        title: "Troca solicitada!",
        description:
          "Sua solicitação de troca foi enviada com sucesso. Você será notificado sobre o andamento.",
      });

      onClose();
      // Recarregar página para atualizar status
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Erro ao solicitar troca:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Não foi possível solicitar a troca. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando dados do pedido...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const selectedCount = Object.values(itemsSelection).filter(
    (item) => item.selected
  ).length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Solicitar Troca - Pedido #{orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de itens */}
          <div>
            <Label className="text-base font-semibold">
              Selecione os itens para troca:
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount > 0
                ? `${selectedCount} ${
                    selectedCount === 1 ? "item selecionado" : "itens selecionados"
                  }`
                : "Nenhum item selecionado"}
            </p>
            <div className="space-y-3 mt-3">
              {order.itens.map((pedidoItem) => {
                const item = itemsSelection[pedidoItem.id];
                if (!item) return null;

                const livroId = pedidoItem.livroId || pedidoItem.livro?.id;
                const book = books[livroId];
                const isSelected = item.selected;
                const titulo = pedidoItem.titulo || book?.titulo || "Título não disponível";
                const subtotal = pedidoItem.subtotal || pedidoItem.preco_total || 0;

                return (
                  <Card
                    key={pedidoItem.id}
                    className={isSelected ? "ring-2 ring-primary" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          data-cy={`item-${pedidoItem.id}`}
                          onCheckedChange={() =>
                            handleItemToggle(pedidoItem.id)
                            
                          }
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {book && (
                            <img
                              src={book.imagem_url || "/placeholder.svg"}
                              alt={titulo}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade disponível: {item.quantidadeMaxima} •{" "}
                              {formatPrice(subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-4 pl-8 space-y-3">
                          {/* Quantidade */}
                          <div>
                            <Label
                              htmlFor={`qty-${pedidoItem.id}`}
                              className="text-sm"
                            >
                              Quantidade a trocar:
                            </Label>
                            <input
                              id={`qty-${pedidoItem.id}`}
                              type="number"
                              min="1"
                              max={item.quantidadeMaxima}
                              value={item.quantidade}
                              onChange={(e) =>
                                handleQuantidadeChange(
                                  pedidoItem.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 border rounded-md mt-1"
                            />
                          </div>

                          {/* Motivo específico */}
                          <div>
                            <Label
                              htmlFor={`reason-${pedidoItem.id}`}
                              className="text-sm"
                            >
                              Motivo específico para este item: *
                            </Label>
                            <Textarea
                              id={`reason-${pedidoItem.id}`}
                              placeholder="Ex: Produto danificado, páginas rasgadas, capa amassada..."
                              value={item.motivo}
                              onChange={(e) =>
                                handleItemReasonChange(
                                  pedidoItem.id,
                                  e.target.value
                                )
                              }
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Motivo geral */}
          <div>
            <Label htmlFor="general-reason" className="text-base font-semibold">
              Motivo geral da troca: *
            </Label>
            <Textarea
              id="general-reason"
              placeholder="Descreva o motivo principal da solicitação de troca..."
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              className="mt-2"
              rows={3}
              required
            />
          </div>

          {/* Informações */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Informações importantes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Você tem até 30 dias após a entrega para solicitar trocas
              </li>
              <li>
                • Os itens devem estar em perfeito estado e na embalagem
                original
              </li>
              <li>• Após aprovação, você receberá instruções para envio</li>
              <li>• Um cupom será gerado após recebermos os itens</li>
            </ul>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCount === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" /> Solicitar Troca
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
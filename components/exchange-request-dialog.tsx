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

import { pedidosService } from "@/services/PedidosService";
import { livrosService } from "@/services/livrosService";

interface ExchangeRequestDialogProps {
  orderId: number;
  onClose: () => void;
}

// Tipo do item que o componente irá usar
interface OrderItem {
  id: string;
  livroId: number;
  quantidade: number;
  preco_total: number;
}

export function ExchangeRequestDialog({
  orderId,
  onClose,
}: ExchangeRequestDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [books, setBooks] = useState<Record<number, any>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({});
  const [exchangeReason, setExchangeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar itens do pedido e mapear para OrderItem[]
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const order = await pedidosService.getById(orderId);

        // Mapear OrderItemDTO para OrderItem
        const mappedItems: OrderItem[] = order.itens.map((item: any) => ({
          id: item.id.toString(),
          livroId: item.livro.id,
          quantidade: item.quantidade,
          preco_total: item.preco_total,
        }));

        setOrderItems(mappedItems);

        // Buscar dados dos livros
        const bookPromises = mappedItems.map((item) =>
          livrosService.getById(item.livroId)
        );
        const booksData = await Promise.all(bookPromises);
        const booksMap: Record<number, any> = {};
        booksData.forEach((book) => (booksMap[book.id] = book));
        setBooks(booksMap);
      } catch (err) {
        console.error("Erro ao carregar itens do pedido:", err);
      }
    };

    fetchOrderItems();
  }, [orderId]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemReasonChange = (itemId: string, reason: string) => {
    setItemReasons((prev) => ({ ...prev, [itemId]: reason }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || !exchangeReason.trim()) {
      alert(
        "Por favor, selecione pelo menos um item e informe o motivo da troca."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await pedidosService.requestExchange({
        pedidoId: orderId,
        motivoGeral: exchangeReason,
        itens: selectedItems.map((itemId) => ({
          itemId,
          motivo: itemReasons[itemId] || exchangeReason,
        })),
      });

      alert(
        "Solicitação de troca enviada com sucesso! Você receberá um e-mail com as instruções."
      );
      onClose();
    } catch (err) {
      console.error("Erro ao enviar solicitação de troca:", err);
      alert("Ocorreu um erro ao enviar a solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Solicitar Troca de Itens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de itens */}
          <div>
            <Label className="text-base font-semibold">
              Selecione os itens para troca:
            </Label>
            <div className="space-y-3 mt-3">
              {orderItems.map((item) => {
                const book = books[item.livroId];
                const isSelected = selectedItems.includes(item.id);

                return (
                  <Card
                    key={item.id}
                    className={isSelected ? "ring-2 ring-primary" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleItemToggle(item.id)}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {book && (
                            <img
                              src={book.imagem_url || "/placeholder.svg"}
                              alt={book.titulo}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{book?.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantidade} •{" "}
                              {formatPrice(item.preco_total)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pl-8">
                          <Label
                            htmlFor={`reason-${item.id}`}
                            className="text-sm"
                          >
                            Motivo específico para este item:
                          </Label>
                          <Textarea
                            id={`reason-${item.id}`}
                            placeholder="Ex: Produto danificado, tamanho incorreto..."
                            value={itemReasons[item.id] || ""}
                            onChange={(e) =>
                              handleItemReasonChange(item.id, e.target.value)
                            }
                            className="mt-1"
                            rows={2}
                          />
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
              className="flex-1 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedItems.length === 0}
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

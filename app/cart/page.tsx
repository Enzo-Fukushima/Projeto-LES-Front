"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { CartItemComponent } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { carrinhoService } from "@/services/CarrinhoService";
import { livrosService } from "@/services/LivroService"; // serviço usado na homepage
import type { CarrinhoItemDTO, Livro } from "@/lib/types";

export default function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cartId, setCartId] = useState<number | null>(null);
  const [items, setItems] = useState<(CarrinhoItemDTO & { livro?: Livro })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshCart = async () => {
    if (!user?.id) return;
    try {
      const cart = await carrinhoService.getByCliente(user.id);
      setCartId(cart.id);

      // Busca cada livro completo
      const itensComLivros = await Promise.all(
        (cart.itens ?? []).map(async (item: { livroId: number; }) => {
          try {
            const livro = await livrosService.getById(item.livroId);
            console.log("Livro buscado:", livro); // log pra debug
            return { ...item, livro };
          } catch (err) {
            console.error(`Erro ao buscar livro ${item.livroId}:`, err);
            return { ...item };
          }
        })
      );

      setItems(itensComLivros);
    } catch (err) {
      console.error("Erro ao atualizar carrinho:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o carrinho.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    refreshCart().finally(() => setIsLoading(false));
  }, [user]);

  const handleUpdateQuantity = async (livroId: number, quantidade: number) => {
    if (!cartId) return;
    try {
      setIsProcessing(true);
      await carrinhoService.updateItem(cartId, { livroId, quantidade });
      await refreshCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = async (livroId: number) => {
    if (!cartId) return;
    try {
      setIsProcessing(true);
      await carrinhoService.removeItem(cartId, livroId);
      await refreshCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = async () => {
    if (!cartId) return;
    try {
      setIsProcessing(true);
      await Promise.all(
        items.map((item) => carrinhoService.removeItem(cartId, item.livroId))
      );
      setItems([]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <p>Carregando carrinho...</p>;

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Adicione alguns livros ao seu carrinho para continuar
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Carrinho de Compras</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"} no seu
              carrinho
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            disabled={isProcessing}
          >
            Limpar Carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemComponent
                key={item.livroId}
                item={item}
                livro={item.livro}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                disabled={isProcessing}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

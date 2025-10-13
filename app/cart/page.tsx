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

// Serviços da API
import { carrinhoService } from "@/services/carrinhoService";
import type { CarrinhoItemDTO } from "@/lib/types";

export default function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cartId, setCartId] = useState<number | null>(null);
  const [items, setItems] = useState<CarrinhoItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Buscar itens do carrinho
  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const cart = await carrinhoService.getByCliente(user.id);
        setCartId(cart.id);
        setItems(cart.itens || []);
      } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os itens do carrinho.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, toast]);

  // ✅ Atualizar quantidade
  const handleUpdateQuantity = async (livroId: number, quantidade: number) => {
    if (!cartId || quantidade < 1) return;

    try {
      setIsProcessing(true);
      const updatedItem = await carrinhoService.updateItem(cartId, {
        livroId,
        quantidade,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.livroId === livroId
            ? { ...item, quantidade: updatedItem.quantidade, preco_total: updatedItem.preco_total }
            : item
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Remover item
  const handleRemoveItem = async (livroId: number) => {
    if (!cartId) return;

    try {
      setIsProcessing(true);
      await carrinhoService.removeItem(cartId, livroId);
      setItems((prev) => prev.filter((item) => item.livroId !== livroId));
    } catch (err) {
      console.error("Erro ao remover item:", err);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item do carrinho.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Limpar carrinho
  const handleClearCart = async () => {
    if (!cartId) return;

    try {
      setIsProcessing(true);
      await Promise.all(items.map((item) => carrinhoService.removeItem(cartId, item.livroId)));
      setItems([]);
    } catch (err) {
      console.error("Erro ao limpar carrinho:", err);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o carrinho.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Carrinho de Compras</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"} no seu carrinho
            </p>
          </div>

          <Button variant="outline" onClick={handleClearCart} disabled={isProcessing}>
            Limpar Carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemComponent
                key={item.livroId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

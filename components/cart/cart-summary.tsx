"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CartSummary() {
  const { getTotal, getItemCount } = useCart();

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;
  const itemCount = getItemCount();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Resumo do Pedido
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subtotal e Frete */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Frete</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? "Grátis" : formatPrice(shipping)}
            </span>
          </div>

          {subtotal < 100 && subtotal > 0 && (
            <p className="text-xs text-muted-foreground">
              Frete grátis em compras acima de R$ 100,00
            </p>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        {/* Ações */}
        <Button className="w-full" size="lg" disabled={itemCount === 0} asChild>
          <Link href="/checkout">Finalizar Compra</Link>
        </Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/">Continuar Comprando</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
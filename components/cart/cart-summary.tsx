"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { ShoppingBag, Tag, Check, X } from "lucide-react";
import Link from "next/link";
import { cupomService } from "@/services/CupomService";

interface AppliedCoupon {
  code: string;
  discount: number;
}

export function CartSummary() {
  const { getTotal, getItemCount } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = getTotal();
  const couponDiscount = appliedCoupon?.discount || 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const shipping = subtotalAfterCoupon > 100 ? 0 : 15;
  const total = subtotalAfterCoupon + shipping;
  const itemCount = getItemCount();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  // Validar cupom via API
  const validateCoupon = async (code: string) => {
    if (!code.trim()) return;
    setIsValidating(true);
    setCouponError("");

    try {
      const coupon = await cupomService.validate(code);

      if (!coupon?.valid) {
        setCouponError("Cupom inválido ou expirado");
        return;
      }

      const discountValue =
        coupon.type === "percentage" ? (subtotal * coupon.discount) / 100 : coupon.discount;

      setAppliedCoupon({ code: coupon.code, discount: discountValue });
      setCouponCode("");
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setCouponError("Erro ao validar o cupom");
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

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

          {appliedCoupon && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Cupom {appliedCoupon.code}
              </span>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Frete</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? "Grátis" : formatPrice(shipping)}
            </span>
          </div>

          {subtotalAfterCoupon < 100 && subtotalAfterCoupon > 0 && (
            <p className="text-xs text-muted-foreground">
              Frete grátis em compras acima de R$ 100,00
            </p>
          )}
        </div>

        <Separator />

        {/* Cupom */}
        {!appliedCoupon ? (
          <div className="space-y-2">
            <Label htmlFor="coupon" className="text-sm font-medium">
              Cupom de Desconto
            </Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                placeholder="Digite seu cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => validateCoupon(couponCode)}
                disabled={!couponCode.trim() || isValidating}
              >
                {isValidating ? "..." : "Aplicar"}
              </Button>
            </div>
            {couponError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <X className="h-3 w-3" /> {couponError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Check className="h-4 w-4" /> <span>Cupom {appliedCoupon.code} aplicado</span>
            </div>
            <Button variant="ghost" size="sm" onClick={removeCoupon}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

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

// src/app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { AddressForm } from "@/components/checkout/address-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { AddressPaymentSelection } from "@/components/checkout/address-payment-selection";
import { CouponApplication } from "@/components/checkout/coupon-application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { pedidosService } from "@/services/PedidosService";
import { carrinhoService } from "@/services/CarrinhoService";
import type { CouponDTO } from "@/lib/types";

import { ArrowLeft, Truck } from "lucide-react";

// ✅ Configuração do frete
const FIXED_SHIPPING_COST = 10.0; // R$ 10,00
const FREE_SHIPPING_THRESHOLD = 100.0; // Frete grátis acima de R$ 100,00

export default function CheckoutPage() {
  const { items, getTotal, reloadCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"select" | "address" | "payment" | "review">(
    "select"
  );
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [paymentCards, setPaymentCards] = useState<any[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<CouponDTO[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log("🔄 Cupons aplicados atualizados:", appliedCoupons);
  }, [appliedCoupons]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSelectionContinue = (address: any, payments: any[]) => {
    setDeliveryAddress(address);
    setPaymentCards(payments);
    setStep("review"); // ✅ Vai direto para review, sem step de shipping
  };

  const handleAddressSave = (addressData: any) => {
    setDeliveryAddress(addressData);
    setStep("select");
    toast({ title: "Sucesso", description: "Endereço salvo com sucesso!" });
  };

  const handlePaymentSave = (cardData: any) => {
    setStep("select");
    toast({ title: "Sucesso", description: "Cartão salvo com sucesso!" });
  };

  const handleCouponsChange = (coupons: CouponDTO[]) => {
    setAppliedCoupons(coupons);
  };

  const calculateCouponDiscount = (
    coupon: CouponDTO,
    subtotal: number
  ): number => {
    if (coupon.percentual) {
      return (subtotal * coupon.valor) / 100;
    }
    return coupon.valor;
  };

  // ✅ Calcular frete baseado no subtotal
  const subtotal = getTotal();
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FIXED_SHIPPING_COST;

  const handlePlaceOrder = async () => {
    if (!user || !deliveryAddress || paymentCards.length === 0) {
      toast({
        title: "Erro",
        description: "Dados incompletos para finalizar o pedido.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const carrinho = await carrinhoService.getByCliente(user.id);

      const totalCouponDiscount = appliedCoupons.reduce(
        (sum, coupon) => sum + calculateCouponDiscount(coupon, subtotal),
        0
      );

      const total = subtotal + shippingCost - totalCouponDiscount;

      const payload = {
        clienteId: user.id,
        enderecoEntregaId: deliveryAddress.id,
        freteId: null, // ✅ Não tem mais ID de frete
        carrinhoId: carrinho.id,
        itens: carrinho.itens.map((i: any) => ({
          livroId: i.livroId ?? i.livro?.id,
          quantidade: i.quantidade,
        })),
        cartoesPagamento: paymentCards.map((payment) => ({
          cartaoId: payment.card.id,
          valor: payment.amount,
          parcelas: payment.card.parcelas ?? 1,
        })),
        valorTotal: total,
        valorPago: total,
        cupons: appliedCoupons,
      };

      await pedidosService.checkout(payload);
      await reloadCart();

      toast({
        title: "Sucesso",
        description: "Pedido finalizado com sucesso!",
      });
      router.push("/");
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o pedido.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const totalCouponDiscount = appliedCoupons.reduce(
    (sum, coupon) => sum + calculateCouponDiscount(coupon, subtotal),
    0
  );

  const total = subtotal + shippingCost - totalCouponDiscount;

  if (!user || !user.id || items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Carrinho
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "select" && (
              <AddressPaymentSelection
                userId={user.id}
                totalAmount={total}
                onAddNewAddress={() => setStep("address")}
                onAddNewCard={() => setStep("payment")}
                onContinue={handleSelectionContinue}
              />
            )}

            {step === "address" && (
              <AddressForm
                userId={user.id}
                onSave={handleAddressSave}
                onCancel={() => setStep("select")}
              />
            )}

            {step === "payment" && (
              <PaymentForm
                userId={user.id}
                onSaveSuccess={handlePaymentSave}
                onCancel={() => setStep("select")}
              />
            )}

            {step === "review" && (
              <div className="space-y-4">
                {/* ✅ Card de Informação do Frete */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Informações de Frete
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                            <>
                              🎉 <strong>Frete Grátis!</strong> Seu pedido
                              atingiu o valor mínimo de{" "}
                              {formatPrice(FREE_SHIPPING_THRESHOLD)}
                            </>
                          ) : (
                            <>
                              Frete fixo de {formatPrice(FIXED_SHIPPING_COST)}.
                              Faltam apenas{" "}
                              {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                              para frete grátis!
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ Componente de Cupons */}
                <CouponApplication
                  totalAmount={subtotal}
                  onCouponsChange={handleCouponsChange}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">
                        Endereço de Entrega
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress?.logradouro}, {deliveryAddress?.numero}
                        {deliveryAddress?.complemento &&
                          ` - ${deliveryAddress.complemento}`}
                        <br />
                        {deliveryAddress?.bairro} - {deliveryAddress?.cidade}/
                        {deliveryAddress?.estado}
                        <br />
                        CEP: {deliveryAddress?.cep}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                      {paymentCards.map((payment, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground mb-2"
                        >
                          {payment.card.bandeira} ••••{" "}
                          {payment.card.numeroCartao?.slice(-4)}
                          <br />
                          {payment.card.nomeImpresso} -{" "}
                          {formatPrice(payment.amount)}
                        </div>
                      ))}
                    </div>

                    {appliedCoupons.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">
                            Cupons Aplicados
                          </h3>
                          {appliedCoupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="text-sm text-muted-foreground mb-2"
                            >
                              {coupon.codigo} -{" "}
                              {formatPrice(
                                calculateCouponDiscount(coupon, subtotal)
                              )}{" "}
                              de desconto
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                  data-cy={"finalizar"}
                >
                  {isProcessing ? "Processando..." : "Finalizar Compra"}
                </Button>
              </div>
            )}
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.titulo} x{item.quantidade}
                      </span>
                      <span>
                        {formatPrice((item.precoUnitario ?? 0) * item.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {/* ✅ Frete sempre visível */}
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Grátis 🎉
                      </span>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>

                  {/* ✅ Indicador de progresso para frete grátis */}
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso para frete grátis:</span>
                        <span>
                          {((subtotal / FREE_SHIPPING_THRESHOLD) * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Faltam {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                        para frete grátis
                      </p>
                    </div>
                  )}

                  {totalCouponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descontos:</span>
                      <span>-{formatPrice(totalCouponDiscount)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

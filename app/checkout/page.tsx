"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { AddressForm } from "@/components/checkout/address-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { AddressPaymentSelection } from "@/components/checkout/address-payment-selection";
import { ShippingOptions } from "@/components/checkout/shipping-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
const { items, getTotal, clearCart, reloadCart } = useCart();

import { livrosService } from "@/services/livrosService";
import { pedidosService } from "@/services/PedidosService";
import type { ShippingOption } from "@/lib/types";

import { ArrowLeft } from "lucide-react";
import { carrinhoService } from "@/services/CarrinhoService";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"select" | "address" | "payment" | "shipping" | "review">("select");
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [paymentCard, setPaymentCard] = useState<any>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // ✅ Seleção de endereço e cartão
  const handleSelectionContinue = (address: any, card: any) => {
    setDeliveryAddress(address);
    setPaymentCard(card);
    setStep("shipping");
  };

  const handleAddressSave = async (addressData: any) => {
    setDeliveryAddress(addressData);
    setStep("select");
    toast({ title: "Sucesso", description: "Endereço salvo com sucesso!" });
  };

  const handlePaymentSave = async (cardData: any) => {
    setPaymentCard(cardData);
    setStep("select");
    toast({ title: "Sucesso", description: "Cartão salvo com sucesso!" });
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setShippingOption(option);
  };

  const handleShippingNext = () => {
    if (shippingOption) {
      setStep("review");
    }
  };

  const handlePlaceOrder = async () => {
  try {
    if (!user || !deliveryAddress || !paymentCard || !shippingOption) {
      console.error("❌ Dados incompletos para finalizar pedido");
      return;
    }

    // 🛒 Busca o carrinho atualizado do cliente
    const carrinho = await carrinhoService.getByCliente(user.id);
    console.log("🧺 Carrinho atual:", carrinho);

    // 💰 Calcula total do pedido no frontend
    const subtotal = getTotal(); // função que soma os preços dos itens
    const shippingCost = shippingOption?.price || 0;
    const total = subtotal + shippingCost;

    console.log("💵 Subtotal:", subtotal);
    console.log("🚚 Frete:", shippingCost);
    console.log("💰 Total final:", total);

    // ⚙️ Monta payload conforme esperado pelo backend
    const payload = {
      clienteId: user.id,
      enderecoEntregaId: deliveryAddress.id,
      freteId: shippingOption.id,
      carrinhoId: carrinho.id,
      itens: carrinho.itens.map((i: any) => ({
        livroId: i.livroId ?? i.livro?.id, // compatível com ambos formatos
        quantidade: i.quantidade,
      })),

      // 💳 Obrigatório para o backend validar pagamento
      cartoesPagamento: [
        {
          cartaoId: paymentCard.id,
          valor: total, // o valor pago
          parcelas: paymentCard.parcelas ?? 1,
        },
      ],

      // opcional (backend recalcula, mas ajuda no log)
      valorTotal: total,
      valorPago: total,
    };

    console.log("📦 Payload enviado ao backend:", payload);

    // 📤 Envia para o backend
    const response = await pedidosService.checkout(payload);

    console.log("✅ Pedido criado com sucesso:", response);
    await reloadCart(); // atualiza carrinho globalmente  
    // (opcional) Redirecionar para página de confirmação
    router.push(`/`);

  } catch (error: any) {
  } finally {

  }
};

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const subtotal = getTotal();
  const shippingCost = shippingOption?.price || 0;
  const total = subtotal + shippingCost;

  // Verificar se tem dados necessários antes de renderizar
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
          {/* Seleção de endereço/cartão e etapas */}
          <div className="lg:col-span-2 space-y-6">
            {step === "select" && (
              <AddressPaymentSelection
                userId={user.id}
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

            {step === "shipping" && (
              <div className="space-y-4">
                <ShippingOptions 
                  selectedOptionId={shippingOption?.id || null}
                  onOptionSelect={handleShippingSelect}
                />
                <Button onClick={handleShippingNext} disabled={!shippingOption}>
                  Continuar para Revisão
                </Button>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress?.logradouro}, {deliveryAddress?.numero}
                        {deliveryAddress?.complemento && ` - ${deliveryAddress.complemento}`}
                        <br />
                        {deliveryAddress?.bairro} - {deliveryAddress?.cidade}/{deliveryAddress?.estado}
                        <br />
                        CEP: {deliveryAddress?.cep}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentCard?.bandeira} •••• {paymentCard?.numero?.slice(-4)}
                        <br />
                        {paymentCard?.nomeTitular}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Frete</h3>
                      <p className="text-sm text-muted-foreground">
                        {shippingOption?.label} - {formatPrice(shippingCost)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handlePlaceOrder} disabled={isProcessing} size="lg" className="w-full">
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
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.titulo} x{item.quantidade}</span>
                      <span>{formatPrice(item.precoUnitario * item.quantidade)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>{formatPrice(shippingCost)}</span>
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
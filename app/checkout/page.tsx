"use client";

import { useState, useEffect, useCallback } from "react";
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

import { livrosService } from "@/services/livrosService";
import { clientesService } from "@/services/ClienteService";
import { pedidosService } from "@/services/PedidosService";
import type { Endereco, CartaoCredito, ShippingOption } from "@/lib/types";

import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"select" | "address" | "payment" | "shipping" | "review">("select");
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [cards, setCards] = useState<CartaoCredito[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<Endereco | null>(null);
  const [paymentCard, setPaymentCard] = useState<CartaoCredito | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Carregar dados do cliente
  const fetchClientData = useCallback(async () => {
    if (!user) return router.push("/login");
    try {
      const cliente = await clientesService.getById(user.id);
      setAddresses(cliente.enderecos || []);
      setCards(cliente.cartoes || []);
    } catch (err) {
      console.error("Erro ao buscar dados do cliente:", err);
      toast({ title: "Erro", description: "Não foi possível carregar os dados do cliente.", variant: "destructive" });
    }
  }, [user, router, toast]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  // ✅ Recalcular frete ao alterar endereço ou itens
  useEffect(() => {
    if (!deliveryAddress || items.length === 0) return;

    const calculateShippingOptions = async () => {
      let totalWeight = 0;

      for (const item of items) {
        try {
          const book = await livrosService.getById(item.book_id);
          totalWeight += book.peso * item.quantidade;
        } catch (err) {
          console.error("Erro ao buscar livro:", err);
        }
      }

      const subtotal = getTotal();
      const options: ShippingOption[] = [
        { id: "standard", label: "Padrão", price: subtotal * 0.05 },
        { id: "express", label: "Expresso", price: subtotal * 0.1 },
      ];

      setShippingOptions(options);
      setSelectedShipping(options[0]?.id || "");
    };

    calculateShippingOptions();
  }, [deliveryAddress, items, getTotal]);

  // ✅ Seleção e salvamento
  const handleAddressSelect = (address: Endereco) => setDeliveryAddress(address);
  const handlePaymentSelect = (card: CartaoCredito) => setPaymentCard(card);
  const handleSelectionContinue = () => deliveryAddress && paymentCard && setStep("shipping");

  const handleAddressSave = async (addressData: Omit<Endereco, "id" | "user_id">) => {
    if (!user) return;
    try {
      const updated = await clientesService.update(user.id, { novoEndereco: addressData });
      setAddresses(updated.enderecos);
      setDeliveryAddress(updated.enderecos.at(-1) || null);
      setStep("select");
    } catch (err) {
      console.error("Erro ao salvar endereço:", err);
    }
  };

  const handlePaymentSave = async (cardData: Omit<CartaoCredito, "id" | "user_id">) => {
    if (!user) return;
    try {
      const updated = await clientesService.update(user.id, { novoCartao: cardData });
      setCards(updated.cartoes);
      setPaymentCard(updated.cartoes.at(-1) || null);
      setStep("select");
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
    }
  };

  const handleShippingNext = () => selectedShipping && setStep("review");

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !paymentCard || !user) return;

    setIsProcessing(true);
    try {
      const payload = {
        clienteId: user.id,
        enderecoEntregaId: deliveryAddress.id,
        cartaoId: paymentCard.id,
        freteId: selectedShipping,
        itens: items.map(i => ({ livroId: i.book_id, quantidade: i.quantidade })),
      };

      const pedido = await pedidosService.checkout(payload);
      clearCart();

      toast({ title: "Pedido realizado!", description: "Seu pedido foi criado com sucesso." });
      router.push(`/order-success?orderId=${pedido.pedidoId}`);
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível finalizar o pedido.", variant: "destructive" });
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const subtotal = getTotal();
  const shippingCost = shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0;
  const total = subtotal + shippingCost;

  if (!user || items.length === 0) return null;

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
                addresses={addresses}
                paymentCards={cards}
                selectedAddressId={deliveryAddress?.id || null}
                selectedCardId={paymentCard?.id || null}
                onAddressSelect={handleAddressSelect}
                onCardSelect={handlePaymentSelect}
                onAddNewAddress={() => setStep("address")}
                onAddNewCard={() => setStep("payment")}
                onContinue={handleSelectionContinue}
              />
            )}

            {step === "address" && (
              <AddressForm title="Novo Endereço" onSave={handleAddressSave} onCancel={() => setStep("select")} />
            )}

            {step === "payment" && (
              <PaymentForm onSave={handlePaymentSave} onCancel={() => setStep("select")} />
            )}

            {step === "shipping" && (
              <div className="space-y-4">
                <ShippingOptions options={shippingOptions} selectedOption={selectedShipping} onOptionChange={setSelectedShipping} />
                <Button onClick={handleShippingNext} disabled={!selectedShipping}>
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
                  <CardContent>
                    <p>Endereço: {deliveryAddress?.logradouro}</p>
                    <p>Pagamento: {paymentCard?.bandeira} {paymentCard?.numero_mascarado}</p>
                    <p>Frete: {shippingOptions.find(s => s.id === selectedShipping)?.label}</p>
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
              <CardContent>
                {items.map(item => (
                  <p key={item.id}>Livro {item.book_id} x{item.quantidade}</p>
                ))}
                <Separator />
                <p>Subtotal: {formatPrice(subtotal)}</p>
                <p>Frete: {formatPrice(shippingCost)}</p>
                <p className="font-bold">Total: {formatPrice(total)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

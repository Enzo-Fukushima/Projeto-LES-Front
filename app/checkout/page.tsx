"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { getBookById } from "@/lib/mock-data"
import { calculateShipping } from "@/lib/utils/shipping"
import type { Address, CreditCard, ShippingOption } from "@/lib/types"
import { ArrowLeft, Package, MapPin } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<"address" | "payment" | "shipping" | "review">("address")
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null)
  const [paymentCard, setPaymentCard] = useState<CreditCard | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
      return
    }
    if (!user) {
      router.push("/login")
      return
    }
  }, [items, user, router])

  // Calculate shipping when address is set
  useEffect(() => {
    if (deliveryAddress) {
      const totalWeight = items.reduce((weight, item) => {
        const book = getBookById(item.book_id)
        return weight + (book ? book.peso * item.quantidade : 0)
      }, 0)

      const subtotal = getTotal()
      const options = calculateShipping(deliveryAddress.cep, totalWeight, subtotal)
      setShippingOptions(options)
      setSelectedShipping(options[0]?.id || "")
    }
  }, [deliveryAddress, items, getTotal])

  const handleAddressSave = (addressData: Omit<Address, "id" | "user_id">) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      user_id: user!.id,
      ...addressData,
    }
    setDeliveryAddress(newAddress)
    setStep("payment")
  }

  const handlePaymentSave = (cardData: Omit<CreditCard, "id" | "user_id">) => {
    const newCard: CreditCard = {
      id: Date.now().toString(),
      user_id: user!.id,
      ...cardData,
    }
    setPaymentCard(newCard)
    setStep("shipping")
  }

  const handleShippingNext = () => {
    if (selectedShipping) {
      setStep("review")
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create order (in real app, would call API)
    const orderId = `PED${Date.now()}`

    // Clear cart and redirect to success
    clearCart()
    router.push(`/order-success?orderId=${orderId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const subtotal = getTotal()
  const shippingCost = shippingOptions.find((opt) => opt.id === selectedShipping)?.price || 0
  const total = subtotal + shippingCost

  if (items.length === 0 || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Carrinho
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Badge variant={step === "address" ? "default" : deliveryAddress ? "secondary" : "outline"}>
                1. Endereço
              </Badge>
              <Badge variant={step === "payment" ? "default" : paymentCard ? "secondary" : "outline"}>
                2. Pagamento
              </Badge>
              <Badge variant={step === "shipping" ? "default" : selectedShipping ? "secondary" : "outline"}>
                3. Entrega
              </Badge>
              <Badge variant={step === "review" ? "default" : "outline"}>4. Revisão</Badge>
            </div>

            {/* Address Step */}
            {step === "address" && <AddressForm title="Endereço de Entrega" onSave={handleAddressSave} />}

            {/* Payment Step */}
            {step === "payment" && (
              <div className="space-y-4">
                {deliveryAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Endereço de Entrega
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {deliveryAddress.logradouro}, {deliveryAddress.numero}
                        {deliveryAddress.complemento && `, ${deliveryAddress.complemento}`}
                      </p>
                      <p className="text-sm">
                        {deliveryAddress.bairro}, {deliveryAddress.cidade} - {deliveryAddress.estado}
                      </p>
                      <p className="text-sm">{deliveryAddress.cep}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => setStep("address")}
                      >
                        Alterar Endereço
                      </Button>
                    </CardContent>
                  </Card>
                )}
                <PaymentForm onSave={handlePaymentSave} />
              </div>
            )}

            {/* Shipping Step */}
            {step === "shipping" && (
              <div className="space-y-4">
                <ShippingOptions
                  options={shippingOptions}
                  selectedOption={selectedShipping}
                  onOptionChange={setSelectedShipping}
                />
                <Button onClick={handleShippingNext} disabled={!selectedShipping}>
                  Continuar para Revisão
                </Button>
              </div>
            )}

            {/* Review Step */}
            {step === "review" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress?.logradouro}, {deliveryAddress?.numero}
                        <br />
                        {deliveryAddress?.bairro}, {deliveryAddress?.cidade} - {deliveryAddress?.estado}
                        <br />
                        {deliveryAddress?.cep}
                      </p>
                    </div>

                    <Separator />

                    {/* Payment Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Forma de Pagamento</h4>
                      <p className="text-sm text-muted-foreground">
                        {paymentCard?.bandeira} {paymentCard?.numero_mascarado}
                        <br />
                        {paymentCard?.nome_titular}
                      </p>
                    </div>

                    <Separator />

                    {/* Shipping Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Entrega</h4>
                      <p className="text-sm text-muted-foreground">
                        {shippingOptions.find((opt) => opt.id === selectedShipping)?.name}
                        <br />
                        {shippingOptions.find((opt) => opt.id === selectedShipping)?.estimatedDays}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handlePlaceOrder} disabled={isProcessing} size="lg" className="w-full">
                  {isProcessing ? "Processando Pedido..." : "Finalizar Compra"}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {items.map((item) => {
                    const book = getBookById(item.book_id)
                    if (!book) return null

                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {book.titulo} x{item.quantidade}
                        </span>
                        <span>{formatPrice(book.preco * item.quantidade)}</span>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

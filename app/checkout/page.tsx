"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { AddressPaymentSelection } from "@/components/checkout/address-payment-selection"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { getBookById, mockAddresses, mockPaymentCards, mockCoupons } from "@/lib/mock-data"
import { calculateShipping } from "@/lib/utils/shipping"
import type { Address, PaymentCard, ShippingOption, Coupon } from "@/lib/types"
import { ArrowLeft, Package, MapPin, CreditCard, Tag, Check, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<"select" | "address" | "payment" | "shipping" | "review">("select")
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null)
  const [paymentCard, setPaymentCard] = useState<PaymentCard | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)

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

  const handleAddressSelect = (address: Address) => {
    setDeliveryAddress(address)
    setSelectedAddressId(address.id)
  }

  const handlePaymentSelect = (card: PaymentCard) => {
    setPaymentCard(card)
    setSelectedCardId(card.id)
  }

  const handleSelectionContinue = () => {
    if (deliveryAddress && paymentCard) {
      setStep("shipping")
    }
  }

  const handleAddressSave = (addressData: Omit<Address, "id" | "user_id">) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      user_id: user?.id || "1",
      ...addressData,
    }
    setDeliveryAddress(newAddress)
    setStep("select")
  }

  const handlePaymentSave = (cardData: Omit<PaymentCard, "id" | "user_id">) => {
    const newCard: PaymentCard = {
      id: Date.now().toString(),
      user_id: user?.id || "1",
      ...cardData,
    }
    setPaymentCard(newCard)
    setStep("select")
  }

  const handleShippingNext = () => {
    if (selectedShipping) {
      setStep("review")
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const orderId = `PED${Date.now()}`

    clearCart()
    router.push(`/order-success?orderId=${orderId}`)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsCouponLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const coupon = mockCoupons.find(
      (c) =>
        c.codigo === couponCode.toUpperCase() &&
        c.ativo &&
        new Date() <= new Date(c.data_expiracao) &&
        (!c.usado || c.tipo === "PERCENTUAL"),
    )

    if (coupon) {
      setAppliedCoupon(coupon)
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${coupon.tipo === "PERCENTUAL" ? `${coupon.valor}%` : formatPrice(coupon.valor)} aplicado.`,
      })
    } else {
      toast({
        title: "Cupom inválido",
        description: "O cupom informado não é válido ou já expirou.",
        variant: "destructive",
      })
    }

    setIsCouponLoading(false)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do seu pedido.",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const subtotal = getTotal()
  const shippingCost = shippingOptions.find((opt) => opt.id === selectedShipping)?.price || 0

  let couponDiscount = 0
  if (appliedCoupon) {
    if (appliedCoupon.tipo === "PERCENTUAL") {
      couponDiscount = subtotal * (appliedCoupon.valor / 100)
    } else {
      couponDiscount = Math.min(appliedCoupon.valor, subtotal)
    }
  }

  const total = Math.max(0, subtotal - couponDiscount + shippingCost)

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
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Badge
                variant={
                  step === "select" || step === "address" || step === "payment"
                    ? "default"
                    : deliveryAddress && paymentCard
                      ? "secondary"
                      : "outline"
                }
              >
                1. Endereço & Pagamento
              </Badge>
              <Badge variant={step === "shipping" ? "default" : selectedShipping ? "secondary" : "outline"}>
                2. Entrega
              </Badge>
              <Badge variant={step === "review" ? "default" : "outline"}>3. Revisão</Badge>
            </div>

            {step === "select" && (
              <AddressPaymentSelection
                addresses={mockAddresses}
                paymentCards={mockPaymentCards}
                selectedAddressId={selectedAddressId}
                selectedCardId={selectedCardId}
                onAddressSelect={handleAddressSelect}
                onCardSelect={handlePaymentSelect}
                onAddNewAddress={() => setStep("address")}
                onAddNewCard={() => setStep("payment")}
                onContinue={handleSelectionContinue}
              />
            )}

            {step === "address" && (
              <AddressForm
                title="Novo Endereço de Entrega"
                onSave={handleAddressSave}
                onCancel={() => setStep("select")}
              />
            )}

            {step === "payment" && <PaymentForm onSave={handlePaymentSave} onCancel={() => setStep("select")} />}

            {step === "shipping" && (
              <div className="space-y-4">
                {deliveryAddress && paymentCard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Selecionadas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Endereço de Entrega
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddress.logradouro}, {deliveryAddress.numero}
                          {deliveryAddress.complemento && `, ${deliveryAddress.complemento}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddress.bairro}, {deliveryAddress.cidade} - {deliveryAddress.estado}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Forma de Pagamento
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {paymentCard.bandeira} {paymentCard.numero_mascarado}
                        </p>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => setStep("select")}>
                        Alterar Seleções
                      </Button>
                    </CardContent>
                  </Card>
                )}

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

            {step === "review" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    <div>
                      <h4 className="font-semibold mb-2">Forma de Pagamento</h4>
                      <p className="text-sm text-muted-foreground">
                        {paymentCard?.bandeira} {paymentCard?.numero_mascarado}
                        <br />
                        {paymentCard?.nome_titular}
                      </p>
                    </div>

                    <Separator />

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

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">Cupom de Desconto</span>
                  </div>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleApplyCoupon} disabled={!couponCode.trim() || isCouponLoading}>
                        {isCouponLoading ? "..." : "Aplicar"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-md">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {appliedCoupon.codigo}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveCoupon}
                        className="h-6 w-6 p-0 text-green-700 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto ({appliedCoupon.codigo})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

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

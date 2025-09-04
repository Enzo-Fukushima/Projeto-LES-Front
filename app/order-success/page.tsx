"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Package, Truck } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-balance mb-4">Pedido Realizado com Sucesso!</h1>

          <p className="text-muted-foreground text-balance mb-8">
            Seu pedido foi processado e você receberá um email de confirmação em breve.
          </p>

          {orderId && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Número do Pedido</h3>
                    <p className="text-2xl font-mono text-primary">{orderId}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-semibold">Processamento</p>
                        <p className="text-sm text-muted-foreground">1-2 dias úteis</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-semibold">Entrega</p>
                        <p className="text-sm text-muted-foreground">Conforme opção selecionada</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/orders">Ver Meus Pedidos</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

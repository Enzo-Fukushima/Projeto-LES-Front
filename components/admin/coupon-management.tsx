"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { ExchangeCoupon } from "@/lib/types"
import { Gift, Eye, Copy, Check } from "lucide-react"

// Mock exchange coupons data
const mockExchangeCoupons: ExchangeCoupon[] = [
  {
    id: "1",
    codigo: "TROCA001",
    user_id: "CUST001",
    exchange_id: "EX001",
    valor: 29.9,
    data_criacao: new Date("2024-01-15"),
    data_expiracao: new Date("2024-04-15"),
    usado: false,
  },
  {
    id: "2",
    codigo: "TROCA002",
    user_id: "CUST002",
    exchange_id: "EX002",
    valor: 24.9,
    data_criacao: new Date("2024-01-14"),
    data_expiracao: new Date("2024-04-14"),
    usado: true,
    data_uso: new Date("2024-01-20"),
    order_id_uso: "ORD005",
  },
]

export function CouponManagement() {
  const [coupons, setCoupons] = useState<ExchangeCoupon[]>(mockExchangeCoupons)
  const [selectedCoupon, setSelectedCoupon] = useState<ExchangeCoupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const isExpired = (expirationDate: Date) => {
    return new Date() > expirationDate
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cupons de Troca</h2>
          <p className="text-muted-foreground">Gerencie todos os cupons de troca gerados para os clientes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter((c) => !c.usado && !isExpired(c.data_expiracao)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{coupons.filter((c) => c.usado).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(coupons.reduce((sum, c) => sum + c.valor, 0))}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-2">
                      {coupon.codigo}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.codigo)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCode === coupon.codigo ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{coupon.user_id}</TableCell>
                  <TableCell>{formatPrice(coupon.valor)}</TableCell>
                  <TableCell>
                    {coupon.usado ? (
                      <Badge className="bg-blue-100 text-blue-800">Utilizado</Badge>
                    ) : isExpired(coupon.data_expiracao) ? (
                      <Badge className="bg-red-100 text-red-800">Expirado</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(coupon.data_criacao)}</TableCell>
                  <TableCell>{formatDate(coupon.data_expiracao)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCoupon(coupon)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalhes do Cupom</DialogTitle>
                          <DialogDescription>Informações completas sobre o cupom de troca</DialogDescription>
                        </DialogHeader>

                        {selectedCoupon && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Código</Label>
                                <p className="font-mono text-lg">{selectedCoupon.codigo}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Valor</Label>
                                <p className="text-lg font-semibold text-green-600">
                                  {formatPrice(selectedCoupon.valor)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Cliente</Label>
                                <p>{selectedCoupon.user_id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Troca Origem</Label>
                                <p>{selectedCoupon.exchange_id}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Data de Criação</Label>
                                <p>{formatDate(selectedCoupon.data_criacao)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Data de Expiração</Label>
                                <p>{formatDate(selectedCoupon.data_expiracao)}</p>
                              </div>
                            </div>

                            {selectedCoupon.usado && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Data de Uso</Label>
                                  <p>{selectedCoupon.data_uso ? formatDate(selectedCoupon.data_uso) : "-"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Pedido de Uso</Label>
                                  <p>{selectedCoupon.order_id_uso || "-"}</p>
                                </div>
                              </div>
                            )}

                            <div className="p-4 bg-muted rounded-lg">
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="mt-1">
                                {selectedCoupon.usado ? (
                                  <Badge className="bg-blue-100 text-blue-800">Utilizado</Badge>
                                ) : isExpired(selectedCoupon.data_expiracao) ? (
                                  <Badge className="bg-red-100 text-red-800">Expirado</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

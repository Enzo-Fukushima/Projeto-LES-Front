"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Gift, Eye, Copy, Check, Loader2, RefreshCw, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cupomService, CupomDTO } from "@/services/CupomService";

const tipoCupomLabels: Record<string, string> = {
  "DESCONTO": "DESCONTO",
  "TROCA": "TROCA",
  "FIDELIDADE": "FIDELIDADE",
};

const tipoCupomColors: Record<string, string> = {
  "DESCONTO": "bg-blue-100 text-blue-800",
  "TROCA": "bg-purple-100 text-purple-800",
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CupomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<CupomDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await cupomService.listarTodos();
      setCoupons(data);
    } catch (error: any) {
      console.error("Erro ao carregar cupons:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cupons.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copiado!",
        description: "Código do cupom copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const handleViewCoupon = (coupon: CupomDTO) => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };

  const handleDeactivateCoupon = async (couponId: number) => {
    if (!confirm("Tem certeza que deseja desativar este cupom? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeactivating(true);
    try {
      await cupomService.desativar(couponId);
      
      toast({
        title: "Cupom desativado!",
        description: "O cupom foi desativado com sucesso.",
      });

      // Atualizar lista de cupons
      await loadCoupons();
      setDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error: any) {
      console.error("Erro ao desativar cupom:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível desativar o cupom.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date() > new Date(expirationDate);
  };

  const getCouponStatus = (coupon: CupomDTO) => {
    if (!coupon.ativo) return { label: "Inativo", color: "bg-gray-100 text-gray-800" };
    if (coupon.dataValidade && isExpired(coupon.dataValidade))
      return { label: "Expirado", color: "bg-red-100 text-red-800" };
    return { label: "Ativo", color: "bg-green-100 text-green-800" };
  };

  const getCouponsByType = (tipo: number) =>
    coupons.filter((c) => c.tipoCupom === tipo).length;

  const getActiveCoupons = () =>
    coupons.filter(
      (c) => c.ativo && (!c.dataValidade || !isExpired(c.dataValidade))
    ).length;

  const getTotalValue = () =>
    coupons
      .filter((c) => c.ativo && (!c.dataValidade || !isExpired(c.dataValidade)) && !c.percentual)
      .reduce((sum, c) => sum + c.valor, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cupons</h1>
          <p className="text-muted-foreground">
            Gerencie todos os cupons promocionais e de troca
          </p>
        </div>
        <Button onClick={loadCoupons} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getCouponsByType(0)} descontos • {getCouponsByType(1)} trocas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getActiveCoupons()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cupons válidos e disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cupons de Troca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {getCouponsByType(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gerados por solicitações de troca
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(getTotalValue())}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor total em cupons ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de cupons */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum cupom encontrado
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
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
                      <TableCell>
                        <Badge
                          className={
                            tipoCupomColors[coupon.tipoCupom] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {tipoCupomLabels[coupon.tipoCupom] || coupon.tipoCupom || "DESCONHECIDO"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {coupon.percentual
                              ? `${coupon.valor}%`
                              : formatPrice(coupon.valor)}
                          </div>
                          {coupon.valorMinimo && (
                            <div className="text-xs text-muted-foreground">
                              Min: {formatPrice(coupon.valorMinimo)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.nomeCliente || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                        {coupon.singleUse && (
                          <Badge variant="outline" className="ml-1">
                            Uso único
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(coupon.dataValidade)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCoupon(coupon)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {coupon.ativo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateCoupon(coupon.id)}
                              disabled={isDeactivating}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCoupon && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Cupom</DialogTitle>
                <DialogDescription>
                  Informações completas sobre o cupom
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Código</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-lg">{selectedCoupon.codigo}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedCoupon.codigo)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="mt-1">
                      <Badge
                        className={
                          tipoCupomColors[selectedCoupon.tipoCupom] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {tipoCupomLabels[selectedCoupon.tipoCupom] || selectedCoupon.tipoCupom || "DESCONHECIDO"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Valor</Label>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {selectedCoupon.percentual
                        ? `${selectedCoupon.valor}% de desconto`
                        : formatPrice(selectedCoupon.valor)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Valor Mínimo</Label>
                    <p className="mt-1">
                      {selectedCoupon.valorMinimo
                        ? formatPrice(selectedCoupon.valorMinimo)
                        : "Sem mínimo"}
                    </p>
                  </div>
                </div>

                {selectedCoupon.nomeCliente && (
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p className="mt-1">{selectedCoupon.nomeCliente}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedCoupon.clienteId}
                    </p>
                  </div>
                )}

                {selectedCoupon.trocaId && (
                  <div>
                    <Label className="text-sm font-medium">Troca Origem</Label>
                    <p className="mt-1">Troca #{selectedCoupon.trocaId}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Validade</Label>
                    <p className="mt-1">{formatDate(selectedCoupon.dataValidade)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Uso</Label>
                    <p className="mt-1">
                      {selectedCoupon.singleUse ? "Uso único" : "Uso múltiplo"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1 flex gap-2">
                    <Badge className={getCouponStatus(selectedCoupon).color}>
                      {getCouponStatus(selectedCoupon).label}
                    </Badge>
                    {selectedCoupon.singleUse && (
                      <Badge variant="outline">Uso único</Badge>
                    )}
                  </div>
                </div>

                {/* Botão de desativar */}
                {selectedCoupon.ativo && (
                  <div className="pt-4 border-t">
                    <div className="bg-amber-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-amber-800">
                        <strong>Atenção:</strong> Ao desativar este cupom, ele não poderá mais ser utilizado pelos clientes. Esta ação não pode ser desfeita.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeactivateCoupon(selectedCoupon.id)}
                      disabled={isDeactivating}
                      className="w-full"
                    >
                      {isDeactivating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Desativando...
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Desativar Cupom
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
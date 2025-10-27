"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, X, Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cupomService } from "@/services/CupomService";
import type { CouponDTO } from "@/lib/types";

interface CouponApplicationProps {
  totalAmount: number;
  onCouponsChange: (coupons: CouponDTO[]) => void;
}

export function CouponApplication({
  totalAmount,
  onCouponsChange,
}: CouponApplicationProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<CouponDTO[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Atenção",
        description: "Digite um código de cupom.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o cupom já foi aplicado
    if (appliedCoupons.some((c) => c.codigo === couponCode.toUpperCase())) {
      toast({
        title: "Cupom já aplicado",
        description: "Este cupom já está sendo utilizado.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      console.log("🔍 [COMPONENT] Iniciando validação do cupom:", couponCode);
      console.log("💰 [COMPONENT] Total amount:", totalAmount);
      
      const coupon = await cupomService.validate(couponCode);
      
      console.log("✅ [COMPONENT] Cupom recebido do serviço:", coupon);
      console.log("📋 [COMPONENT] Propriedades do cupom:", {
        ativo: coupon.ativo,
        valorMinimo: coupon.valorMinimo,
        tipo: typeof coupon.ativo,
        temValorMinimo: coupon.valorMinimo !== undefined && coupon.valorMinimo !== null
      });

      // Validação: cupom ativo
      if (!coupon.ativo) {
        console.log("❌ [COMPONENT] Cupom inativo");
        toast({
          title: "Cupom inválido",
          description: "Este cupom não está mais ativo.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("✅ [COMPONENT] Cupom está ativo!");

      // Validação: valor mínimo
      if (coupon.valorMinimo && coupon.valorMinimo > 0) {
        console.log("💰 [COMPONENT] Verificando valor mínimo:", {
          valorMinimo: coupon.valorMinimo,
          totalAmount: totalAmount,
          valido: totalAmount >= coupon.valorMinimo
        });
        
        if (totalAmount < coupon.valorMinimo) {
          console.log("❌ [COMPONENT] Valor mínimo não atingido");
          toast({
            title: "Valor mínimo não atingido",
            description: `Este cupom requer um valor mínimo de R$ ${coupon.valorMinimo.toFixed(2)}. Seu carrinho está em R$ ${totalAmount.toFixed(2)}`,
            variant: "destructive",
          });
          return;
        }
      }
      
      console.log("✅ [COMPONENT] Valor mínimo OK (ou não aplicável)!");

      // ✅ Cupom válido! Adicionar à lista
      console.log("✅ [COMPONENT] Cupom validado com sucesso! Adicionando à lista...");
      const newCoupons = [...appliedCoupons, coupon];
      setAppliedCoupons(newCoupons);
      onCouponsChange(newCoupons);
      
      console.log("✅ [COMPONENT] Cupons atualizados:", newCoupons);

      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${
          coupon.percentual
            ? `${coupon.valor}%`
            : `R$ ${coupon.valor.toFixed(2)}`
        } aplicado.`,
      });

      setCouponCode("");
    } catch (error: any) {
      console.error("❌ [COMPONENT] Erro ao validar cupom:", error);
      console.error("❌ [COMPONENT] Stack trace:", error.stack);
      console.error("❌ [COMPONENT] Detalhes:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        name: error.name
      });
      
      toast({
        title: "Cupom inválido",
        description: error.response?.data?.message || error.message || "Não foi possível validar o cupom.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = (couponId: number) => {
    const newCoupons = appliedCoupons.filter((c) => c.id !== couponId);
    setAppliedCoupons(newCoupons);
    onCouponsChange(newCoupons);

    toast({
      title: "Cupom removido",
      description: "O cupom foi removido do pedido.",
    });
  };

  const calculateDiscount = (coupon: CouponDTO): number => {
    if (coupon.percentual) {
      return (totalAmount * coupon.valor) / 100;
    }
    return coupon.valor;
  };

  const totalDiscount = appliedCoupons.reduce(
    (sum, coupon) => sum + calculateDiscount(coupon),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Cupons de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de valor mínimo */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-700 dark:text-blue-300">
            <p className="font-medium">Valor atual do carrinho: R$ {totalAmount.toFixed(2)}</p>
            <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
              Alguns cupons podem exigir um valor mínimo de compra
            </p>
          </div>
        </div>

        {/* Input de Cupom */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleValidateCoupon();
              }
            }}
            disabled={isValidating}
            className="flex-1"
          />
          <Button
            onClick={handleValidateCoupon}
            disabled={isValidating || !couponCode.trim()}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Aplicar"
            )}
          </Button>
        </div>

        {/* Lista de Cupons Aplicados */}
        {appliedCoupons.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cupons aplicados:</h4>
              {appliedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{coupon.codigo}</span>
                        <Badge variant="secondary" className="text-xs">
                          {coupon.percentual
                            ? `${coupon.valor}%`
                            : `R$ ${coupon.valor.toFixed(2)}`}
                        </Badge>
                      </div>
                      {coupon.tipo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {coupon.tipo}
                        </p>
                      )}
                      {coupon.valorMinimo && (
                        <p className="text-xs text-muted-foreground">
                          Valor mínimo: R$ {coupon.valorMinimo.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        -R$ {calculateDiscount(coupon).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => handleRemoveCoupon(coupon.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total de Desconto */}
            <Separator />
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Total de Descontos:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                -R$ {totalDiscount.toFixed(2)}
              </span>
            </div>
          </>
        )}

        {/* Informação sobre cupons */}
        {appliedCoupons.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Digite um código de cupom válido para obter desconto
          </p>
        )}
      </CardContent>
    </Card>
  );
}
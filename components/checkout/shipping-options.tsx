"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { freteService } from "@/services/FreteService";
import type { ShippingOption } from "@/lib/utils/shipping";

interface ShippingOptionsProps {
  selectedOptionId: string | null;
  onOptionSelect: (option: ShippingOption) => void;
}

export function ShippingOptions({
  selectedOptionId,
  onOptionSelect,
}: ShippingOptionsProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 🔄 Carregar opções de frete
  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const data = await freteService.list(); // API que retorna ShippingOption[]
        setOptions(data);
      } catch (error) {
        console.error("Erro ao carregar opções de frete:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as opções de entrega.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [toast]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const handleChange = (optionId: string) => {
    const option = options.find((opt) => opt.id === optionId);
    if (option) onOptionSelect(option);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Opções de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">
            Carregando opções...
          </p>
        ) : options.length > 0 ? (
          <RadioGroup
            value={selectedOptionId || ""}
            onValueChange={handleChange}
          >
            <div className="space-y-3">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.estimatedDays}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {option.price === 0
                          ? "Grátis"
                          : formatPrice(option.price)}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhuma opção de entrega disponível
          </p>
        )}
      </CardContent>
    </Card>
  );
}

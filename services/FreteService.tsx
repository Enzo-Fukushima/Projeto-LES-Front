// src/services/FreteService.ts
import api from "@/lib/api"; // seu axios configurado
import type { ShippingOption } from "@/lib/utils/shipping";

export const freteService = {
  // Retorna todas as opções de frete
  list: async (): Promise<ShippingOption[]> => {
    try {
      // Exemplo de chamada a uma API real:
      // const { data } = await api.get("/frete/opcoes");
      // return data;

      // MOCK temporário
      return [
        {
          id: "1",
          name: "PAC",
          description: "Entrega econômica via Correios",
          price: 15.5,
          estimatedDays: "5-7 dias úteis",
        },
        {
          id: "2",
          name: "Sedex",
          description: "Entrega rápida via Correios",
          price: 35.0,
          estimatedDays: "1-3 dias úteis",
        },
        {
          id: "3",
          name: "Retirada na Loja",
          description: "Retire pessoalmente na loja",
          price: 0,
          estimatedDays: "Disponível hoje",
        },
      ];
    } catch (error) {
      console.error("Erro ao buscar opções de frete:", error);
      throw error;
    }
  },
};

// src/services/CupomService.ts
import  api  from "@/lib/api";
import type { CouponDTO } from "@/lib/types";

class CupomService {
  /**
   * Valida um cupom pelo código
   */
  async validate(codigo: string): Promise<CouponDTO> {
    try {
      const response = await api.get<CouponDTO>(`/cupons/${codigo.toUpperCase()}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const cupomService = new CupomService();
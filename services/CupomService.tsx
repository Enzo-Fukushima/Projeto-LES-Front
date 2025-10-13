// src/services/CupomService.ts
import api from "@/lib/api";
import type { CouponDTO } from "@/lib/types";

export const cupomService = {
  validate: async (code: string): Promise<CouponDTO> => {
    const { data } = await api.get(`/cupons/${code}`);
    return data;
  },
};

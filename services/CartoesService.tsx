// src/services/CartaoService.ts
import api from "@/lib/api";
import type { CartaoCreditoDTO } from "@/lib/types";

export const cartaoService = {
  listByUser: async (userId: number): Promise<CartaoCreditoDTO[]> => {
    const { data } = await api.get(`/cartoes/cliente/${userId}`);
    return data;
  },

  create: async (
    dto: Omit<CartaoCreditoDTO, "id">
  ): Promise<CartaoCreditoDTO> => {
    const { data } = await api.post("/cartoes", dto);
    return data;
  },

  update: async (
    id: number,
    dto: Partial<CartaoCreditoDTO>
  ): Promise<CartaoCreditoDTO> => {
    const { data } = await api.put(`/cartoes/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/cartoes/${id}`);
  },
};

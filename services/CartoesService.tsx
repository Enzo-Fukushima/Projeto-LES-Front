import api from "@/lib/api"
import type { CartaoCreditoDTO } from "@/lib/types"

export const cartaoService = {
  // ✅ GET /api/clientes/{id}/cartoes
  listByUser: async (userId: number): Promise<CartaoCreditoDTO[]> => {
    const { data } = await api.get(`/clientes/${userId}/cartoes`)
    return data
  },

  // ✅ GET /api/clientes/cartoes/{id}
  getById: async (id: number): Promise<CartaoCreditoDTO> => {
    const { data } = await api.get(`/clientes/cartoes/${id}`)
    return data
  },

  // ✅ POST /api/clientes/cartoes
  create: async (
    dto: Omit<CartaoCreditoDTO, "id">
  ): Promise<CartaoCreditoDTO> => {
    const { data } = await api.post(`/clientes/cartoes`, dto)
    return data
  },

  // ✅ (opcional, se quiser manter atualização de cartão)
  // ⚠️ Controller atual não tem PUT para cartões, apenas DELETE.
  // Adicione no back se precisar editar, por enquanto mantemos compatível:
  update: async (
    id: number,
    dto: Partial<CartaoCreditoDTO>
  ): Promise<CartaoCreditoDTO> => {
    const { data } = await api.put(`/clientes/cartoes/${id}`, dto)
    return data
  },

  // ✅ DELETE /api/clientes/cartoes/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/cartoes/${id}`)
  },
}

import api from "@/lib/api"
import type { EnderecoDTO } from "@/lib/types"

export const enderecoService = {
  // ✅ GET /api/clientes/{id}/enderecos
  listByUser: async (userId: number): Promise<EnderecoDTO[]> => {
    const { data } = await api.get(`/clientes/${userId}/enderecos`)
    return data
  },

  // ✅ POST /api/clientes/enderecos
  create: async (payload: Omit<EnderecoDTO, "id">): Promise<EnderecoDTO> => {
    const { data } = await api.post(`/clientes/enderecos`, payload)
    return data
  },

  // ✅ PUT /api/clientes/enderecos/{id}
  update: async (
    id: number,
    payload: Omit<EnderecoDTO, "id">
  ): Promise<EnderecoDTO> => {
    const { data } = await api.put(`/clientes/enderecos/${id}`, payload)
    return data
  },

  // ✅ DELETE /api/clientes/enderecos/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/enderecos/${id}`)
  },
}

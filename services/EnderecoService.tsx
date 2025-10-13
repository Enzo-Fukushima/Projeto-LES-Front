import api from "@/lib/api";
import type { EnderecoDTO } from "@/lib/types";

export const enderecoService = {
  listByUser: async (userId: number): Promise<EnderecoDTO[]> => {
    const { data } = await api.get(`/enderecos/usuario/${userId}`);
    return data;
  },
  create: async (payload: Omit<EnderecoDTO, "id">): Promise<EnderecoDTO> => {
    const { data } = await api.post("/enderecos", payload);
    return data;
  },
  update: async (
    id: number,
    payload: Omit<EnderecoDTO, "id">
  ): Promise<EnderecoDTO> => {
    const { data } = await api.put(`/enderecos/${id}`, payload);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/enderecos/${id}`);
  },
};

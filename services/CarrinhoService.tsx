import api from "../lib/api";

export const carrinhoService = {
  getByCliente: async (clienteId: number) =>
    (await api.get(`/api/carrinhos/cliente/${clienteId}`)).data,

  create: async (clienteId: number) =>
    (await api.post(`/api/carrinhos/cliente/${clienteId}`)).data,

  addItem: async (carrinhoId: number, payload: any) =>
    (await api.post(`/api/carrinhos/${carrinhoId}/itens`, payload)).data,

  updateItem: async (carrinhoId: number, payload: any) =>
    (await api.put(`/api/carrinhos/${carrinhoId}/itens`, payload)).data,

  removeItem: async (carrinhoId: number, livroId: number) =>
    (await api.delete(`/api/carrinhos/${carrinhoId}/itens/${livroId}`)).data,
};

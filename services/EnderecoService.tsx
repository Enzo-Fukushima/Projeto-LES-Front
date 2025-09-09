import api from "../lib/api";

export const enderecosService = {
  listByCliente: async (clienteId: number) => (await api.get(`/clientes/${clienteId}/enderecos`)).data,
  create: async (payload: any) => (await api.post("/clientes/enderecos", payload)).data,
  update: async (id: number, payload: any) => (await api.put(`/clientes/enderecos/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete(`/clientes/enderecos/${id}`)).status,
};

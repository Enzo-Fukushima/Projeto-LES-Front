import api from "../lib/api";

export const cartoesService = {
  get: async (id: number) => (await api.get(`/clientes/cartoes/${id}`)).data,
  listByCliente: async (clienteId: number) => (await api.get(`/clientes/${clienteId}/cartoes`)).data,
  create: async (payload: any) => (await api.post("/clientes/cartoes", payload)).data,
  remove: async (id: number) => (await api.delete(`/clientes/cartoes/${id}`)).status,
};

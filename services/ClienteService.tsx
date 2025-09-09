// src/services/clientesService.ts
import api from "../lib/api"

export const clientesService = {
  list: async () => (await api.get("/clientes")).data,
  get: async (id: number) => (await api.get(`/clientes/${id}`)).data,
  create: async (payload: any) => (await api.post("/clientes", payload)).data,
  update: async (id: number, payload: any) => (await api.put(`/clientes/${id}`, payload)).data,
  changePassword: async (id: number, payload: any) => (await api.put(`/clientes/${id}/senha`, payload)).data,
  activate: async (id: number) => (await api.put(`/clientes/${id}/ativar`)).status,
  deactivate: async (id: number) => (await api.put(`/clientes/${id}/inativar`)).status,
};

// src/services/CarrinhoService.ts
import api from "../lib/api";

export const carrinhoService = {
  getByCliente: async (clienteId: number) => {
    try {
      const res = await api.get(`/carrinhos/cliente/${clienteId}`);
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) return undefined;
      throw err;
    }
  },

  create: async (clienteId: number) => {
    try {
      const res = await api.post(`/carrinhos/cliente/${clienteId}`);
      return res.data;
    } catch (err: any) {
      throw err;
    }
  },

  addItem: async (carrinhoId: number, payload: { livroId: number; quantidade: number }) => {
    try {
      const res = await api.post(`/carrinhos/${carrinhoId}/itens`, payload);
      return res.data;
    } catch (err: any) {
      // Força lançar erro se status >= 400
      throw err.response?.data || new Error("Erro ao adicionar item");
    }
  },

  updateItem: async (carrinhoId: number, payload: { livroId: number; quantidade: number }) => {
    try {
      const res = await api.put(`/carrinhos/${carrinhoId}/itens`, {
        ...payload,
        carrinhoId,
      });
      return res.data;
    } catch (err: any) {
      throw err.response?.data || new Error("Erro ao atualizar item");
    }
  },

  removeItem: async (carrinhoId: number, livroId: number) => {
    try {
      const res = await api.delete(`/carrinhos/${carrinhoId}/itens/${livroId}`);
      return res.data;
    } catch (err: any) {
      throw err.response?.data || new Error("Erro ao remover item");
    }
  },

  addItemByCliente: async (
    clienteId: number,
    payload: { livroId: number; quantidade: number }
  ) => {
    try {
      let carrinho = await carrinhoService.getByCliente(clienteId);
      if (!carrinho) {
        carrinho = await carrinhoService.create(clienteId);
      }
      return await carrinhoService.addItem(carrinho.id, payload);
    } catch (error) {
      throw error;
    }
  },
};

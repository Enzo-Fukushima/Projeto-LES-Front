// src/services/CarrinhoService.ts
import api from "../lib/api";

export const carrinhoService = {
  // Pega o carrinho do cliente
  getByCliente: async (clienteId: number) => {
    try {
      const res = await api.get(`/carrinhos/cliente/${clienteId}`);
      return res.data;
    } catch (err: any) {
      // Retorna undefined se 404
      if (err.response?.status === 404) return undefined;
      throw err;
    }
  },

  // Cria um novo carrinho para o cliente
  create: async (clienteId: number) => {
    const res = await api.post(`/carrinhos/cliente/${clienteId}`);
    return res.data;
  },

  // Adiciona item ao carrinho existente
  addItem: async (carrinhoId: number, payload: { livroId: number; quantidade: number }) => {
    const res = await api.post(`/carrinhos/${carrinhoId}/itens`, payload);
    return res.data;
  },

  // Atualiza quantidade de item
  updateItem: async (carrinhoId: number, payload: { livroId: number; quantidade: number }) => {
  const res = await api.put(`/carrinhos/${carrinhoId}/itens`, {
    ...payload,
    carrinhoId, // adiciona aqui
  });
  return res.data;
},

  // Remove item do carrinho
  removeItem: async (carrinhoId: number, livroId: number) => {
    const res = await api.delete(`/carrinhos/${carrinhoId}/itens/${livroId}`);
    return res.data;
  },

  // Adiciona item ao carrinho do cliente, criando se não existir
  addItemByCliente: async (
    clienteId: number,
    payload: { livroId: number; quantidade: number }
  ) => {
    try {
      // Tenta pegar o carrinho
      let carrinho = await carrinhoService.getByCliente(clienteId);

      // Se não existir, cria um novo
      if (!carrinho) {
        carrinho = await carrinhoService.create(clienteId);
      }

      // Adiciona o item usando o ID do carrinho
      return await carrinhoService.addItem(carrinho.id, payload);
    } catch (error) {
      throw error;
    }
  },
  
};

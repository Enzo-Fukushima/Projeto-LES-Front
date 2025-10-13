// services/LivrosService.ts
import api from "../lib/api";
import type { Livro } from "@/lib/types";

export const livrosService = {
  // Lista todos os livros
  list: async (): Promise<Livro[]> => {
    const response = await api.get("/api/livros");
    return response.data;
  },

  // Retorna um livro pelo ID
  getById: async (id: number): Promise<Livro> => {
    const response = await api.get(`/api/livros/${id}`);
    return response.data;
  },

  // Busca livros pelo termo
  search: async (query: string): Promise<Livro[]> => {
    const response = await api.get(`/api/livros`, { params: { q: query } });
    return response.data;
  },

  // Busca livros por categoria
  getByCategory: async (categoryId: string): Promise<Livro[]> => {
    const response = await api.get(`/api/livros`, {
      params: { category: categoryId },
    });
    return response.data;
  },
};

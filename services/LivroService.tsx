import api from "@/lib/api";
import type { Livro } from "@/lib/types";

export const livrosService = {
  // Retorna todos os livros
  list: async (): Promise<Livro[]> => {
    const response = await api.get("/livros");
    return response.data;
  },

  // Retorna um livro pelo ID
  getById: async (id: number): Promise<Livro> => {
    const response = await api.get(`/livros/${id}`);
    return response.data;
  },
};

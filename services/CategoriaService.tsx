// src/services/categoriasService.ts
import api from "@/lib/api";
import type { Categoria } from "@/components/products/category-filter";

export const categoriasService = {
  list: async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data;
  },
};

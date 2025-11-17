import api from "@/lib/api";
import { AnalyticsRequestDTO, SalesAnalyticsDTO } from "@/lib/types";

class AnalyticsService {
  async getSalesData(params: AnalyticsRequestDTO): Promise<SalesAnalyticsDTO[]> {
    const response = await api.get<SalesAnalyticsDTO[]>("/analytics/vendas", {
      params: {
        tipo: params.tipo,
        id: params.id,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
      },
    });
    return response.data;
  }

  async getProducts(): Promise<Array<{ id: number; nome: string }>> {
    const response = await api.get("/livros");
    return response.data.map((livro: any) => ({
      id: livro.id,
      nome: livro.titulo,
    }));
  }

  async getCategories(): Promise<Array<{ id: number; nome: string }>> {
    const response = await api.get("/categorias");
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
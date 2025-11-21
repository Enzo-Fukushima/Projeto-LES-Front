// services/AnaliseService.ts
import api from "@/lib/api";

export interface SalesAnalyticsDTO {
  data: string; // LocalDate em formato ISO (YYYY-MM-DD)
  quantidade: number; // Long do backend
  valorTotal: number; // BigDecimal do backend
}

export interface AnalyticsRequestDTO {
  tipo: "PRODUTO" | "CATEGORIA";
  id: number;
  dataInicio: string; // formato: YYYY-MM-DD
  dataFim: string; // formato: YYYY-MM-DD
}

class AnalyticsService {
  private baseURL = "/analytics";

  /**
   * Busca dados de vendas por produto ou categoria em um período
   */
  async getSalesData(params: AnalyticsRequestDTO): Promise<SalesAnalyticsDTO[]> {
    const response = await api.get<SalesAnalyticsDTO[]>(`${this.baseURL}/vendas`, {
      params: {
        tipo: params.tipo,
        id: params.id,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
      },
    });
    return response.data;
  }

  /**
   * Busca volume total de vendas em um período
   */
  async getVolumeVendasTotal(dataInicio: string, dataFim: string): Promise<number> {
    const response = await api.get<number>(`${this.baseURL}/vendas/total`, {
      params: {
        inicio: dataInicio,
        fim: dataFim,
      },
    });
    return response.data;
  }

  /**
   * Busca lista de produtos para o filtro
   */
  async getProducts(): Promise<Array<{ id: number; nome: string }>> {
    const response = await api.get("/livros");
    return response.data.map((livro: any) => ({
      id: livro.id,
      nome: livro.titulo,
    }));
  }

  /**
   * Busca lista de categorias para o filtro
   */
  async getCategories(): Promise<Array<{ id: number; nome: string }>> {
    const response = await api.get("/categorias");
    return response.data.map((cat: any) => ({
      id: cat.id,
      nome: cat.nome,
    }));
  }
}

export const analyticsService = new AnalyticsService();
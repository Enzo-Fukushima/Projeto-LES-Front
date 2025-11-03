// src/services/CupomService.ts
import api from "@/lib/api";

export interface CupomDTO {
  id: number;
  codigo: string;
  tipoCupom: number; // 0=DESCONTO, 1=TROCA
  valor: number;
  percentual: boolean;
  ativo: boolean;
  singleUse: boolean;
  valorMinimo?: number;
  dataValidade?: string;
  clienteId?: number;
  trocaId?: number;
  nomeCliente?: string;
}

export interface CupomUseDTO {
  id: number;
  cupomId: number;
  codigo: string;
  tipo: number;
  valor: number;
  percentual: boolean;
  valorMinimo?: number;
  ativo: boolean;
  singleUse: boolean;
  dataValidade?: string;
}

class CupomService {
  private baseURL = "/cupons";

  /**
   * Valida um cupom pelo código
   * ✅ Usa o endpoint correto: /cupons/validar/{codigo}
   */
  async validate(codigo: string): Promise<CupomUseDTO> {
    const response = await api.get<CupomUseDTO>(`${this.baseURL}/validar/${codigo.toUpperCase()}`);
    return response.data;
  }

  /**
   * Lista todos os cupons (Admin)
   */
  async listarTodos(): Promise<CupomDTO[]> {
    const response = await api.get<CupomDTO[]>(this.baseURL);
    return response.data;
  }

  /**
   * Buscar cupom por ID
   */
  async buscarPorId(id: number): Promise<CupomDTO> {
    const response = await api.get<CupomDTO>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Criar cupom (Admin)
   */
  async criar(cupom: Partial<CupomDTO>): Promise<CupomDTO> {
    const response = await api.post<CupomDTO>(this.baseURL, cupom);
    return response.data;
  }

  /**
   * Desativar cupom (Admin)
   */
  async desativar(id: number): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }
}

export const cupomService = new CupomService();
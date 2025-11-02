// services/TrocasService.ts

import api from "../lib/api";

export interface TrocaItemDTO {
  id?: number;
  pedidoItemId: number;
  livroId?: number;
  tituloLivro?: string;
  quantidade: number;
  valorUnitario?: number;
  subtotal?: number;
  motivo: string;
  retornarEstoque?: boolean;
}

export interface SolicitarTrocaDTO {
  pedidoId: number;
  clienteId: number;
  motivoTroca: string;
  itens: TrocaItemDTO[];
}

export interface TrocaDTO {
  id: number;
  pedidoId: number;
  clienteId: number;
  nomeCliente: string;
  status: string;
  dataSolicitacao: string;
  dataAutorizacao?: string;
  dataRecebimento?: string;
  dataConclusao?: string;
  motivoTroca: string;
  observacaoAdmin?: string;
  valorTotalTroca: number;
  itens: TrocaItemDTO[];
  codigoCupom?: string;
}

export interface AutorizarTrocaDTO {
  trocaId: number;
  autorizada: boolean;
  observacao?: string;
}

export interface ItemRecebimentoDTO {
  trocaItemId: number;
  retornarEstoque: boolean;
}

export interface ConfirmarRecebimentoDTO {
  trocaId: number;
  observacao?: string;
  itens: ItemRecebimentoDTO[];
}

class TrocasService {
  private baseURL = "/trocas";

  /**
   * Solicitar troca de um pedido
   */
  async solicitarTroca(dto: SolicitarTrocaDTO): Promise<TrocaDTO> {
    const response = await api.post<TrocaDTO>(this.baseURL, dto);
    return response.data;
  }

  /**
   * Autorizar ou negar uma troca (Admin)
   */
  async autorizarTroca(dto: AutorizarTrocaDTO): Promise<TrocaDTO> {
    const response = await api.put<TrocaDTO>(`${this.baseURL}/autorizar`, dto);
    return response.data;
  }

  /**
   * Listar trocas pendentes (Admin)
   */
  async listarTrocasPendentes(): Promise<TrocaDTO[]> {
    const response = await api.get<TrocaDTO[]>(`${this.baseURL}/pendentes`);
    return response.data;
  }

  /**
   * Confirmar recebimento dos itens (Admin)
   */
  async confirmarRecebimento(dto: ConfirmarRecebimentoDTO): Promise<TrocaDTO> {
    const response = await api.put<TrocaDTO>(
      `${this.baseURL}/confirmar-recebimento`,
      dto
    );
    return response.data;
  }

  /**
   * Buscar troca por ID
   */
  async buscarPorId(id: number): Promise<TrocaDTO> {
    const response = await api.get<TrocaDTO>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Listar trocas de um cliente
   */
  async listarTrocasCliente(clienteId: number): Promise<TrocaDTO[]> {
    const response = await api.get<TrocaDTO[]>(
      `${this.baseURL}/cliente/${clienteId}`
    );
    return response.data;
  }

  /**
   * Listar todas as trocas (Admin)
   */
  async listarTodasTrocas(): Promise<TrocaDTO[]> {
    const response = await api.get<TrocaDTO[]>(this.baseURL);
    return response.data;
  }

  /**
   * Listar trocas por status
   */
  async listarPorStatus(status: string): Promise<TrocaDTO[]> {
    const response = await api.get<TrocaDTO[]>(`${this.baseURL}/status/${status}`);
    return response.data;
  }
}

export const trocasService = new TrocasService();
import { get } from "http";
import api from "../lib/api";
import type {
  CheckoutRequestDTO,
  CheckoutResponseDTO,
  PedidoDTO,
  OrderItemDTO,
} from "@/lib/types";

export const pedidosService = {
  // Cria um pedido a partir do carrinho
  checkout: async (
    payload: CheckoutRequestDTO
  ): Promise<CheckoutResponseDTO> => {
    const response = await api.post("/pedidos/checkout", payload);
    return response.data;
  },

  // ✅ novo método para solicitar troca
  requestExchange: async (payload: {
    pedidoId: number;
    motivoGeral: string;
    itens: { itemId: string; motivo: string }[];
  }) => {
    const response = await api.post(
      `/pedidos/${payload.pedidoId}/troca`,
      payload
    );
    return response.data;
  },

  // Consulta pedido por ID
  getById: async (id: number): Promise<PedidoDTO> => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  getAll: async (): Promise<PedidoDTO[]> => {
    const response = await api.get("/pedidos");
    return response.data;
  },

  // Lista pedidos de um usuário
  // Lista pedidos de um usuário
 listByUser: async (userId: number): Promise<PedidoDTO[]> => {
    const response = await api.get(`/pedidos/cliente/${userId}`);
    return response.data;
},

 updateStatus: async (pedidoId: number, status: string): Promise<PedidoDTO> => {
    const response = await api.patch(`/pedidos/${pedidoId}/status`, { status });
    return response.data;
  },
};

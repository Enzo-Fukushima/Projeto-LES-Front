// lib/api/chat-api.ts

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  clienteId: number;
  historico: ChatMessage[];
}

export interface LivroDTO {
  id: number;
  titulo: string;
  autor: string;
  isbn?: string;
  preco?: number;
  categoria?: string;
  imagemUrl?: string;
}

export interface ChatResponse {
  respostaIA: ChatMessage;
  livrosRecomendados: LivroDTO[];
}

class ChatApiService {
  private baseUrl: string;

  constructor() {
    // Configure a URL base da sua API aqui
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  async enviarMensagem(
    clienteId: number,
    historico: ChatMessage[]
  ): Promise<ChatResponse> {
    const request: ChatRequest = {
      clienteId,
      historico
    };

    console.log('Enviando requisição:', request);

    const response = await fetch(`${this.baseUrl}/api/chat/recomendacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione token de autenticação se necessário
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do backend:', errorText);
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta recebida:', data);
    return data;
  }
}

export const chatApiService = new ChatApiService();
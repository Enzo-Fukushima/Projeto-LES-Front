// Database schema types for the e-commerce bookstore system

export interface User {
  id: string
  codigo_cliente: string // Unique customer code (RNF requirement)
  nome: string
  email: string
  senha_hash: string // Encrypted password (RNF requirement)
  telefone?: string
  data_nascimento?: string
  ativo: boolean
  data_criacao: Date
  data_atualizacao: Date
}

export interface Address {
  id: string
  user_id: string
  tipo: "entrega" | "cobranca"
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  principal: boolean
}

export interface CreditCard {
  id: string
  user_id: string
  numero_mascarado: string // Only last 4 digits visible
  nome_titular: string
  validade: string
  bandeira: string
  principal: boolean
}

export interface Category {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
}

export interface Book {
  id: string
  isbn: string
  titulo: string
  autor: string
  editora: string
  ano_publicacao: number
  categoria_id: string
  descricao: string
  preco: number
  peso: number // For shipping calculation
  dimensoes: {
    altura: number
    largura: number
    profundidade: number
  }
  imagem_url: string
  ativo: boolean
  data_criacao: Date
}

export interface Stock {
  id: string
  book_id: string
  quantidade_disponivel: number
  quantidade_reservada: number
  estoque_minimo: number
  data_atualizacao: Date
}

export interface CartItem {
  id: string
  user_id: string
  book_id: string
  quantidade: number
  data_adicao: Date
}

export interface Order {
  id: string
  user_id: string
  codigo_pedido: string
  status:
    | "pendente"
    | "processando"
    | "enviado"
    | "entregue"
    | "cancelado"
    | "em_troca"
    | "troca_autorizada"
    | "troca_recebida"
  endereco_entrega_id: string
  endereco_cobranca_id: string
  cartao_credito_id: string
  subtotal: number
  valor_frete: number
  valor_total: number
  data_pedido: Date
  data_envio?: Date
  data_entrega?: Date
  codigo_rastreamento?: string
}

export interface OrderItem {
  id: string
  order_id: string
  book_id: string
  quantidade: number
  preco_unitario: number
  preco_total: number
}

export interface Exchange {
  id: string
  order_id: string
  user_id: string
  motivo: string
  status: "solicitada" | "aprovada" | "processando" | "concluida" | "rejeitada"
  data_solicitacao: Date
  data_conclusao?: Date
  items_trocados: ExchangeItem[]
  observacoes_admin?: string
  cupom_gerado?: string
  valor_cupom?: number
  itens_retornaram_estoque: boolean
  data_recebimento?: Date
}

export interface ExchangeItem {
  id: string
  exchange_id: string
  order_item_id: string
  book_id: string
  quantidade: number
  motivo_troca: string
  condicao_item?: "perfeito" | "bom" | "danificado" | "inutilizavel"
}

export interface ExchangeCoupon {
  id: string
  codigo: string
  user_id: string
  exchange_id: string
  valor: number
  data_criacao: Date
  data_expiracao: Date
  usado: boolean
  data_uso?: Date
  order_id_uso?: string
}

// Shopping cart context type
export interface CartContextType {
  items: CartItem[]
  addItem: (bookId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

// Auth context type
export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Partial<User>) => Promise<boolean>
  logout: () => void
  updateUser: (updatedUserData: Partial<User>) => void // Added updateUser function for profile management
  isLoading: boolean
}

export interface PaymentCard {
  id: string
  user_id: string
  numero: string
  nome_titular: string
  validade: string
  cvv: string
  bandeira: string
  created_at: Date
  updated_at: Date
}

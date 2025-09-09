// Mock data for the bookstore prototype
import type { Book, Category, User, Stock, Order, OrderItem, Address, PaymentCard, Coupon } from "./types"

export const mockCategories: Category[] = [
  { id: "1", nome: "Ficção", descricao: "Romances e ficção literária", ativo: true },
  { id: "2", nome: "Não-ficção", descricao: "Biografias, ensaios e documentários", ativo: true },
  { id: "3", nome: "Técnico", descricao: "Livros técnicos e acadêmicos", ativo: true },
  { id: "4", nome: "Infantil", descricao: "Livros para crianças e jovens", ativo: true },
  { id: "5", nome: "Autoajuda", descricao: "Desenvolvimento pessoal e profissional", ativo: true },
]

export const mockBooks: Book[] = [
  {
    id: "1",
    isbn: "978-85-250-4815-7",
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    editora: "Companhia das Letras",
    ano_publicacao: 1899,
    categoria_id: "1",
    descricao: "Clássico da literatura brasileira que narra a história de Bentinho e Capitu.",
    preco: 29.9,
    peso: 0.3,
    dimensoes: { altura: 21, largura: 14, profundidade: 2 },
    imagem_url: "/dom-casmurro-book-cover.png",
    ativo: true,
    data_criacao: new Date("2024-01-01"),
  },
  {
    id: "2",
    isbn: "978-85-359-0277-5",
    titulo: "O Alquimista",
    autor: "Paulo Coelho",
    editora: "Rocco",
    ano_publicacao: 1988,
    categoria_id: "1",
    descricao: "A jornada de Santiago em busca de seu tesouro pessoal.",
    preco: 24.9,
    peso: 0.25,
    dimensoes: { altura: 20, largura: 13, profundidade: 1.5 },
    imagem_url: "/o-alquimista-book-cover.png",
    ativo: true,
    data_criacao: new Date("2024-01-02"),
  },
  {
    id: "3",
    isbn: "978-85-7542-347-9",
    titulo: "Clean Code",
    autor: "Robert C. Martin",
    editora: "Alta Books",
    ano_publicacao: 2008,
    categoria_id: "3",
    descricao: "Manual de boas práticas para desenvolvimento de software.",
    preco: 89.9,
    peso: 0.6,
    dimensoes: { altura: 23, largura: 16, profundidade: 3 },
    imagem_url: "/clean-code-programming-book.png",
    ativo: true,
    data_criacao: new Date("2024-01-03"),
  },
  {
    id: "4",
    isbn: "978-85-7326-158-9",
    titulo: "Sapiens",
    autor: "Yuval Noah Harari",
    editora: "L&PM",
    ano_publicacao: 2011,
    categoria_id: "2",
    descricao: "Uma breve história da humanidade.",
    preco: 39.9,
    peso: 0.4,
    dimensoes: { altura: 21, largura: 14, profundidade: 2.5 },
    imagem_url: "/sapiens-book-cover-history.png",
    ativo: true,
    data_criacao: new Date("2024-01-04"),
  },
  {
    id: "5",
    isbn: "978-85-7542-789-7",
    titulo: "O Pequeno Príncipe",
    autor: "Antoine de Saint-Exupéry",
    editora: "Agir",
    ano_publicacao: 1943,
    categoria_id: "4",
    descricao: "Clássico da literatura infantil sobre amizade e imaginação.",
    preco: 19.9,
    peso: 0.2,
    dimensoes: { altura: 18, largura: 12, profundidade: 1 },
    imagem_url: "/o-pequeno-pr-ncipe-book-cover.png",
    ativo: true,
    data_criacao: new Date("2024-01-05"),
  },
  {
    id: "6",
    isbn: "978-85-7542-456-8",
    titulo: "Mindset",
    autor: "Carol S. Dweck",
    editora: "Objetiva",
    ano_publicacao: 2006,
    categoria_id: "5",
    descricao: "A nova psicologia do sucesso.",
    preco: 34.9,
    peso: 0.35,
    dimensoes: { altura: 21, largura: 14, profundidade: 2 },
    imagem_url: "/mindset-psychology-book-cover.png",
    ativo: true,
    data_criacao: new Date("2024-01-06"),
  },
]

export const mockStock: Stock[] = mockBooks.map((book) => ({
  id: `stock-${book.id}`,
  book_id: book.id,
  quantidade_disponivel: Math.floor(Math.random() * 50) + 10,
  quantidade_reservada: Math.floor(Math.random() * 5),
  estoque_minimo: 5,
  data_atualizacao: new Date(),
}))

export const mockUsers: User[] = [
  {
    id: "1",
    codigo_cliente: "CLI001",
    nome: "João Silva",
    email: "joao@email.com",
    senha_hash: "hashed_password_123",
    telefone: "(11) 99999-9999",
    data_nascimento: "1990-05-15",
    ativo: true,
    data_criacao: new Date("2024-01-01"),
    data_atualizacao: new Date("2024-01-01"),
  },
  {
    id: "admin",
    codigo_cliente: "ADM001",
    nome: "Admin",
    email: "admin@livruvru.com",
    senha_hash: "hashed_admin_password",
    telefone: "(11) 99999-0000",
    data_nascimento: "1980-01-01",
    ativo: true,
    data_criacao: new Date("2024-01-01"),
    data_atualizacao: new Date("2024-01-01"),
  },
  {
    id: "2",
    codigo_cliente: "CLI002",
    nome: "Maria Santos",
    email: "maria@email.com",
    senha_hash: "hashed_password_456",
    telefone: "(11) 88888-8888",
    data_nascimento: "1985-08-22",
    ativo: true,
    data_criacao: new Date("2024-01-05"),
    data_atualizacao: new Date("2024-01-05"),
  },
  {
    id: "3",
    codigo_cliente: "CLI003",
    nome: "Pedro Oliveira",
    email: "pedro@email.com",
    senha_hash: "hashed_password_789",
    telefone: "(11) 77777-7777",
    data_nascimento: "1992-12-10",
    ativo: true,
    data_criacao: new Date("2024-01-10"),
    data_atualizacao: new Date("2024-01-10"),
  },
  {
    id: "4",
    codigo_cliente: "CLI004",
    nome: "Ana Costa",
    email: "ana@email.com",
    senha_hash: "hashed_password_012",
    telefone: "(11) 66666-6666",
    data_nascimento: "1988-03-18",
    ativo: false,
    data_criacao: new Date("2024-01-15"),
    data_atualizacao: new Date("2024-01-20"),
  },
  {
    id: "5",
    codigo_cliente: "CLI005",
    nome: "Carlos Ferreira",
    email: "carlos@email.com",
    senha_hash: "hashed_password_345",
    telefone: "(11) 55555-5555",
    data_nascimento: "1995-07-25",
    ativo: true,
    data_criacao: new Date("2024-01-18"),
    data_atualizacao: new Date("2024-01-18"),
  },
]

export const mockUser: User = mockUsers[0]

export const mockOrders: Order[] = [
  {
    id: "1",
    user_id: "1",
    codigo_pedido: "PED001",
    status: "entregue",
    endereco_entrega_id: "1",
    endereco_cobranca_id: "1",
    cartao_credito_id: "1",
    subtotal: 54.8,
    valor_frete: 15,
    valor_total: 69.8,
    data_pedido: new Date("2024-01-15"),
    data_envio: new Date("2024-01-16"),
    data_entrega: new Date("2024-01-18"),
    codigo_rastreamento: "BR123456789",
  },
  {
    id: "2",
    user_id: "1",
    codigo_pedido: "PED002",
    status: "enviado",
    endereco_entrega_id: "1",
    endereco_cobranca_id: "1",
    cartao_credito_id: "1",
    subtotal: 89.9,
    valor_frete: 0,
    valor_total: 89.9,
    data_pedido: new Date("2024-01-20"),
    data_envio: new Date("2024-01-21"),
    codigo_rastreamento: "BR987654321",
  },
  {
    id: "3",
    user_id: "1",
    codigo_pedido: "PED003",
    status: "processando",
    endereco_entrega_id: "1",
    endereco_cobranca_id: "1",
    cartao_credito_id: "1",
    subtotal: 24.9,
    valor_frete: 15,
    valor_total: 39.9,
    data_pedido: new Date("2024-01-25"),
  },
]

export const mockOrderItems: OrderItem[] = [
  {
    id: "1",
    order_id: "1",
    book_id: "1",
    quantidade: 1,
    preco_unitario: 29.9,
    preco_total: 29.9,
  },
  {
    id: "2",
    order_id: "1",
    book_id: "2",
    quantidade: 1,
    preco_unitario: 24.9,
    preco_total: 24.9,
  },
  {
    id: "3",
    order_id: "2",
    book_id: "3",
    quantidade: 1,
    preco_unitario: 89.9,
    preco_total: 89.9,
  },
  {
    id: "4",
    order_id: "3",
    book_id: "2",
    quantidade: 1,
    preco_unitario: 24.9,
    preco_total: 24.9,
  },
]

// Sales analytics data
export const getSalesAnalytics = () => {
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  return {
    totalRevenue: mockOrders.reduce((sum, order) => sum + order.valor_total, 0),
    totalOrders: mockOrders.length,
    averageOrderValue: mockOrders.reduce((sum, order) => sum + order.valor_total, 0) / mockOrders.length,
    monthlyGrowth: 15.2, // Mock percentage
    topSellingBooks: mockBooks.slice(0, 5),
    recentOrders: mockOrders.slice(0, 10),
    salesByMonth: [
      { month: "Jan", revenue: 1250.5, orders: 15 },
      { month: "Fev", revenue: 1890.3, orders: 22 },
      { month: "Mar", revenue: 2340.8, orders: 28 },
      { month: "Abr", revenue: 1980.6, orders: 24 },
      { month: "Mai", revenue: 2650.9, orders: 31 },
      { month: "Jun", revenue: 3120.4, orders: 38 },
    ],
  }
}

// Utility functions for mock data
export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find((book) => book.id === id)
}

export const getBooksByCategory = (categoryId: string): Book[] => {
  return mockBooks.filter((book) => book.categoria_id === categoryId)
}

export const getStockByBookId = (bookId: string): Stock | undefined => {
  return mockStock.find((stock) => stock.book_id === bookId)
}

export const searchBooks = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockBooks.filter(
    (book) =>
      book.titulo.toLowerCase().includes(lowercaseQuery) ||
      book.autor.toLowerCase().includes(lowercaseQuery) ||
      book.descricao.toLowerCase().includes(lowercaseQuery),
  )
}

// Utility functions for customer management
export const getAllUsers = (): User[] => {
  return mockUsers
}

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id)
}

export const searchUsers = (query: string): User[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockUsers.filter(
    (user) =>
      user.nome.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.codigo_cliente.toLowerCase().includes(lowercaseQuery),
  )
}

// Mock addresses data for user profile management
export const mockAddresses: Address[] = [
  {
    id: "1",
    user_id: "1",
    tipo: "entrega",
    cep: "01310-100",
    logradouro: "Av. Paulista",
    numero: "1578",
    complemento: "Apto 101",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    principal: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "2",
    user_id: "1",
    tipo: "cobranca",
    cep: "01310-100",
    logradouro: "Av. Paulista",
    numero: "1578",
    complemento: "Apto 101",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    principal: false,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "3",
    user_id: "2",
    tipo: "entrega",
    cep: "22071-900",
    logradouro: "Av. Atlântica",
    numero: "1702",
    complemento: "Apto 101",
    bairro: "Copacabana",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    pais: "Brasil",
    principal: true,
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-05"),
  },
]

// Mock payment cards data for user profile management
export const mockPaymentCards: PaymentCard[] = [
  {
    id: "1",
    user_id: "1",
    numero: "4111 1111 1111 1111",
    nome_titular: "JOAO SILVA",
    validade: "12/28",
    cvv: "123",
    bandeira: "Visa",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "2",
    user_id: "1",
    numero: "5555 5555 5555 4444",
    nome_titular: "JOAO SILVA",
    validade: "06/27",
    cvv: "456",
    bandeira: "Mastercard",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-10"),
  },
  {
    id: "3",
    user_id: "2",
    numero: "4000 0000 0000 0002",
    nome_titular: "MARIA SANTOS",
    validade: "09/26",
    cvv: "789",
    bandeira: "Visa",
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-05"),
  },
]

// Mock coupons data for checkout functionality
export const mockCoupons: Coupon[] = [
  {
    id: "1",
    codigo: "DESCONTO10",
    tipo: "PERCENTUAL",
    valor: 10,
    ativo: true,
    usado: false,
    data_criacao: new Date("2024-01-01"),
    data_expiracao: new Date("2024-12-31"),
  },
  {
    id: "2",
    codigo: "FRETE15",
    tipo: "VALOR_FIXO",
    valor: 15,
    ativo: true,
    usado: false,
    data_criacao: new Date("2024-01-01"),
    data_expiracao: new Date("2024-12-31"),
  },
  {
    id: "3",
    codigo: "TROCA50",
    tipo: "VALOR_FIXO",
    valor: 50,
    ativo: true,
    usado: false,
    data_criacao: new Date("2024-01-01"),
    data_expiracao: new Date("2024-12-31"),
  },
  {
    id: "4",
    codigo: "EXPIRED",
    tipo: "PERCENTUAL",
    valor: 20,
    ativo: true,
    usado: false,
    data_criacao: new Date("2024-01-01"),
    data_expiracao: new Date("2024-01-15"), // Expired coupon for testing
  },
]

export const updateStockQuantity = (bookId: string, quantityChange: number): boolean => {
  const stockIndex = mockStock.findIndex((stock) => stock.book_id === bookId)

  if (stockIndex === -1) {
    console.error(`Stock not found for book ID: ${bookId}`)
    return false
  }

  const currentStock = mockStock[stockIndex]
  const newQuantity = currentStock.quantidade_disponivel + quantityChange

  if (newQuantity < 0) {
    console.error(`Cannot reduce stock below zero for book ID: ${bookId}`)
    return false
  }

  // Update the stock quantity and timestamp
  mockStock[stockIndex] = {
    ...currentStock,
    quantidade_disponivel: newQuantity,
    data_atualizacao: new Date(),
  }

  console.log(`Stock updated for book ${bookId}: ${currentStock.quantidade_disponivel} -> ${newQuantity}`)
  return true
}

export const getStockImpactForExchange = (exchangeItems: Array<{ productId: string; quantity: number }>) => {
  return exchangeItems.map((item) => {
    const stock = getStockByBookId(item.productId)
    const book = getBookById(item.productId)

    return {
      productId: item.productId,
      productName: book?.titulo || "Produto não encontrado",
      quantity: item.quantity,
      currentStock: stock?.quantidade_disponivel || 0,
      newStock: (stock?.quantidade_disponivel || 0) + item.quantity,
      canReturn: true, // In real app, this could check item condition
    }
  })
}

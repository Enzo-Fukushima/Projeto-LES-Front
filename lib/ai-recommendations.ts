// AI-powered book recommendation system (RNF requirement)

import type { Book, Recommendation } from "./types"
import { mockBooks } from "./mock-data"

export interface RecommendationEngine {
  getPersonalizedRecommendations: (userId: string, limit?: number) => Promise<Recommendation[]>
  getSimilarBooks: (bookId: string, limit?: number) => Promise<Book[]>
  getRecommendationsByCategory: (categoryId: string, limit?: number) => Promise<Book[]>
  getChatbotResponse: (message: string, userId?: string) => Promise<string>
}

// Mock AI recommendation engine
export const recommendationEngine: RecommendationEngine = {
  async getPersonalizedRecommendations(userId: string, limit = 5): Promise<Recommendation[]> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock personalized recommendations based on user behavior
    const recommendations: Recommendation[] = mockBooks.slice(0, limit).map((book, index) => ({
      id: `rec-${book.id}`,
      user_id: userId,
      book_id: book.id,
      score: 0.9 - index * 0.1,
      motivo: getRecommendationReason(book, index),
      data_criacao: new Date(),
    }))

    return recommendations
  },

  async getSimilarBooks(bookId: string, limit = 4): Promise<Book[]> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock similar books recommendation
    const currentBook = mockBooks.find((book) => book.id === bookId)
    if (!currentBook) return []

    // Find books in same category or by same author
    const similarBooks = mockBooks
      .filter(
        (book) =>
          book.id !== bookId && (book.categoria_id === currentBook.categoria_id || book.autor === currentBook.autor),
      )
      .slice(0, limit)

    return similarBooks
  },

  async getRecommendationsByCategory(categoryId: string, limit = 6): Promise<Book[]> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockBooks
      .filter((book) => book.categoria_id === categoryId)
      .sort(() => Math.random() - 0.5) // Random shuffle for variety
      .slice(0, limit)
  },

  async getChatbotResponse(message: string, userId?: string): Promise<string> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const lowerMessage = message.toLowerCase()

    // Mock AI chatbot responses for book recommendations
    if (lowerMessage.includes("recomend") || lowerMessage.includes("suger") || lowerMessage.includes("indic")) {
      if (lowerMessage.includes("ficção") || lowerMessage.includes("romance")) {
        return "Baseado no seu interesse em ficção, recomendo 'Dom Casmurro' de Machado de Assis e 'O Alquimista' de Paulo Coelho. Ambos são clássicos da literatura que oferecem narrativas envolventes e reflexões profundas sobre a natureza humana."
      }

      if (
        lowerMessage.includes("técnico") ||
        lowerMessage.includes("programação") ||
        lowerMessage.includes("tecnologia")
      ) {
        return "Para livros técnicos, sugiro 'Clean Code' de Robert C. Martin - é essencial para desenvolvedores que querem escrever código mais limpo e maintível. Também temos outros títulos de programação e tecnologia em nosso catálogo."
      }

      if (lowerMessage.includes("infantil") || lowerMessage.includes("criança")) {
        return "Para o público infantil, 'O Pequeno Príncipe' é uma escolha maravilhosa! É um clássico que encanta crianças e adultos com sua história sobre amizade, imaginação e os valores mais importantes da vida."
      }

      if (lowerMessage.includes("autoajuda") || lowerMessage.includes("desenvolvimento")) {
        return "Em desenvolvimento pessoal, recomendo 'Mindset' de Carol S. Dweck. Este livro revolucionário explora como nossa mentalidade pode determinar nosso sucesso e felicidade. É uma leitura transformadora!"
      }

      return "Com base no seu perfil de leitura, recomendo explorar nossa seção de ficção com 'Dom Casmurro' e 'O Alquimista', ou se preferir algo mais técnico, 'Clean Code' é excelente. Que tipo de livro você está procurando especificamente?"
    }

    if (lowerMessage.includes("preço") || lowerMessage.includes("valor") || lowerMessage.includes("cust")) {
      return "Nossos preços variam de R$ 19,90 a R$ 89,90. Temos opções para todos os orçamentos! Oferecemos frete grátis para compras acima de R$ 100,00. Posso ajudar você a encontrar livros dentro do seu orçamento?"
    }

    if (lowerMessage.includes("entrega") || lowerMessage.includes("frete") || lowerMessage.includes("prazo")) {
      return "Trabalhamos com diferentes opções de entrega: SEDEX (1-2 dias úteis), PAC (3-7 dias úteis) e frete grátis para compras acima de R$ 100,00 (5-10 dias úteis). O prazo pode variar conforme sua localização."
    }

    if (lowerMessage.includes("autor") || lowerMessage.includes("escritor")) {
      return "Temos livros de diversos autores renomados! Machado de Assis, Paulo Coelho, Robert C. Martin, Yuval Noah Harari, entre outros. Qual autor você tem interesse ou gostaria de descobrir?"
    }

    if (lowerMessage.includes("categoria") || lowerMessage.includes("gênero") || lowerMessage.includes("tipo")) {
      return "Organizamos nossos livros em categorias: Ficção, Não-ficção, Técnico, Infantil e Autoajuda. Cada categoria tem uma seleção cuidadosa de títulos. Qual categoria desperta seu interesse?"
    }

    // Default response
    return "Olá! Sou seu assistente de recomendações de livros. Posso ajudar você a encontrar o livro perfeito baseado em seus interesses, orçamento ou categoria preferida. Sobre que tipo de livro você gostaria de saber mais?"
  },
}

function getRecommendationReason(book: Book, index: number): string {
  const reasons = [
    `Baseado em seus livros favoritos de ${book.autor}`,
    `Recomendado por leitores com perfil similar ao seu`,
    `Trending entre usuários que compraram livros similares`,
    `Perfeito para expandir seus horizontes literários`,
    `Altamente avaliado por nossa comunidade de leitores`,
  ]

  return reasons[index % reasons.length]
}

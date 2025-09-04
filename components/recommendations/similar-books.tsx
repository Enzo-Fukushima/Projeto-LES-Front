"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/products/product-card"
import { useCart } from "@/contexts/cart-context"
import { recommendationEngine } from "@/lib/ai-recommendations"
import type { Book } from "@/lib/types"
import { BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SimilarBooksProps {
  bookId: string
}

export function SimilarBooks({ bookId }: SimilarBooksProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [similarBooks, setSimilarBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSimilarBooks = async () => {
      setIsLoading(true)
      try {
        const books = await recommendationEngine.getSimilarBooks(bookId, 4)
        setSimilarBooks(books)
      } catch (error) {
        console.error("Error loading similar books:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSimilarBooks()
  }, [bookId])

  const handleAddToCart = (bookId: string) => {
    addItem(bookId, 1)
    toast({
      title: "Produto adicionado",
      description: "O livro foi adicionado ao seu carrinho com sucesso!",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Livros Similares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[3/4] rounded-lg mb-3"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (similarBooks.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Livros Similares
        </CardTitle>
        <p className="text-sm text-muted-foreground">Outros livros que você pode gostar baseado nesta seleção</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {similarBooks.map((book) => (
            <ProductCard key={book.id} book={book} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

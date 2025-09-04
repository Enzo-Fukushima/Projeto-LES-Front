"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { recommendationEngine } from "@/lib/ai-recommendations"
import { getBookById } from "@/lib/mock-data"
import type { Recommendation } from "@/lib/types"
import { Sparkles, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RecommendationSectionProps {
  title?: string
  subtitle?: string
}

export function RecommendationSection({
  title = "Recomendações Personalizadas",
  subtitle = "Selecionados especialmente para você pela nossa IA",
}: RecommendationSectionProps) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRecommendations = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const recs = await recommendationEngine.getPersonalizedRecommendations(user.id, 4)
      setRecommendations(recs)
    } catch (error) {
      console.error("Error loading recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [user])

  const handleAddToCart = (bookId: string) => {
    addItem(bookId, 1)
    toast({
      title: "Produto adicionado",
      description: "O livro foi adicionado ao seu carrinho com sucesso!",
    })
  }

  const handleRefresh = () => {
    loadRecommendations()
    toast({
      title: "Recomendações atualizadas",
      description: "Novas sugestões foram carregadas para você!",
    })
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Recomendações Personalizadas</h3>
          <p className="text-muted-foreground mb-4">
            Faça login para receber recomendações de livros personalizadas pela nossa IA
          </p>
          <Button asChild>
            <a href="/login">Fazer Login</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[3/4] rounded-lg mb-3"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => {
                const book = getBookById(rec.book_id)
                if (!book) return null

                return (
                  <div key={rec.id} className="space-y-2">
                    <ProductCard book={book} onAddToCart={handleAddToCart} />
                    <div className="px-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {rec.motivo}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Relevância:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < Math.floor(rec.score * 5) ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ainda não temos recomendações para você. Continue navegando para que possamos aprender suas preferências!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

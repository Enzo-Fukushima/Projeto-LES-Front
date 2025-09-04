"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { SimilarBooks } from "@/components/recommendations/similar-books"
import { AIChatbot } from "@/components/recommendations/ai-chatbot"
import { getBookById, getStockByBookId, mockCategories } from "@/lib/mock-data"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, ArrowLeft, Package, Truck } from "lucide-react"
import Link from "next/link"

interface BookPageProps {
  params: {
    id: string
  }
}

export default function BookPage({ params }: BookPageProps) {
  const book = getBookById(params.id)
  const stock = getStockByBookId(params.id)
  const { addItem } = useCart()
  const { toast } = useToast()

  if (!book) {
    notFound()
  }

  const category = mockCategories.find((cat) => cat.id === book.categoria_id)
  const isInStock = stock && stock.quantidade_disponivel > 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem(book.id, 1)
    toast({
      title: "Produto adicionado",
      description: `"${book.titulo}" foi adicionado ao seu carrinho!`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Book Image */}
          <div className="relative aspect-[3/4] max-w-md mx-auto">
            <Image
              src={book.imagem_url || "/placeholder.svg"}
              alt={book.titulo}
              fill
              className="object-cover rounded-lg shadow-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {!isInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Esgotado
                </Badge>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {category?.nome}
              </Badge>
              <h1 className="text-3xl font-bold text-balance mb-2">{book.titulo}</h1>
              <p className="text-xl text-muted-foreground mb-1">por {book.autor}</p>
              <p className="text-muted-foreground">
                {book.editora} • {book.ano_publicacao}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(book.preco)}</span>
              {stock && <span className="text-muted-foreground">{stock.quantidade_disponivel} em estoque</span>}
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">{book.descricao}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Detalhes do Produto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ISBN:</span>
                    <span>{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Editora:</span>
                    <span>{book.editora}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ano:</span>
                    <span>{book.ano_publicacao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso:</span>
                    <span>{book.peso}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensões:</span>
                    <span>
                      {book.dimensoes.altura} x {book.dimensoes.largura} x {book.dimensoes.profundidade} cm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button size="lg" className="w-full" disabled={!isInStock} onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isInStock ? "Adicionar ao Carrinho" : "Produto Indisponível"}
              </Button>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Estoque disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Frete calculado no checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Books Section */}
        <SimilarBooks bookId={book.id} />
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}

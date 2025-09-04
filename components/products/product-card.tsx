"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/types"
import { getStockByBookId } from "@/lib/mock-data"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  book: Book
  onAddToCart?: (bookId: string) => void
}

export function ProductCard({ book, onAddToCart }: ProductCardProps) {
  const stock = getStockByBookId(book.id)
  const isInStock = stock && stock.quantidade_disponivel > 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <Link href={`/books/${book.id}`}>
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={book.imagem_url || "/placeholder.svg"}
              alt={book.titulo}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {!isInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Esgotado</Badge>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-2">
          <Link href={`/books/${book.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{book.titulo}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">{book.autor}</p>
          <p className="text-sm text-muted-foreground">
            {book.editora} • {book.ano_publicacao}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary">{formatPrice(book.preco)}</span>
            {stock && <span className="text-xs text-muted-foreground">{stock.quantidade_disponivel} em estoque</span>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={!isInStock} onClick={() => onAddToCart?.(book.id)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInStock ? "Adicionar ao Carrinho" : "Indisponível"}
        </Button>
      </CardFooter>
    </Card>
  )
}

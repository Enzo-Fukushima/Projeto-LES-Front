"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { CartItem } from "@/lib/types"
import { getBookById } from "@/lib/mock-data"
import { Minus, Plus, Trash2 } from "lucide-react"

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const book = getBookById(item.book_id)

  if (!book) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const totalPrice = book.preco * item.quantidade

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Book Image */}
          <div className="relative w-20 h-28 flex-shrink-0">
            <Image
              src={book.imagem_url || "/placeholder.svg"}
              alt={book.titulo}
              fill
              className="object-cover rounded"
              sizes="80px"
            />
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">{book.titulo}</h3>
              <p className="text-sm text-muted-foreground">{book.autor}</p>
              <p className="text-sm text-muted-foreground">{book.editora}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}
                  disabled={item.quantidade <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <Input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                />

                <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{formatPrice(book.preco)} cada</span>
              <span className="font-semibold text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

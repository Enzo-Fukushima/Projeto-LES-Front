import type { Book } from "@/lib/types"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  books: Book[]
  onAddToCart?: (bookId: string) => void
}

export function ProductGrid({ books, onAddToCart }: ProductGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Nenhum livro encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <ProductCard key={book.id} book={book} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}

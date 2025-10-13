// src/components/products/product-grid.tsx
import type { Livro } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  books: Livro[];
  onAddToCart?: (bookId: number) => void;
  isLoading?: boolean; // nova prop opcional
}

export function ProductGrid({
  books,
  onAddToCart,
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Carregando livros...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Nenhum livro encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <ProductCard
          key={book.id}
          book={book} // use 'book' aqui, não 'livro'
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

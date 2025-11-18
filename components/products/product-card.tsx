"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { carrinhoService } from "@/services/CarrinhoService";
import type { Livro } from "@/lib/types";

interface ProductCardProps {
  book: Livro;
  onAddToCart?: (bookId: number) => void;
  carrinhoId?: number; // opcional, pode vir de contexto do usuário
}

export function ProductCard({
  book,
  onAddToCart,
  carrinhoId,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  console.log(book);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart(book.id);
      return;
    }

    if (!carrinhoId) {
      alert(
        "Carrinho não encontrado. Faça login ou inicie um carrinho primeiro."
      );
      return;
    }

    try {
      setIsAdding(true);
      await carrinhoService.addItem(carrinhoId, {
        livroId: book.id,
        quantidade: 1,
      });
      alert("Livro adicionado ao carrinho!");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar ao carrinho");
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  const isInStock = (book.estoque ?? 0) > 0;

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
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {book.titulo}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{book.autor}</p>
          <p className="text-sm text-muted-foreground">
            {book.editoraId} • {book.publicacao}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-primary">
              {formatPrice(book.preco)}
            </span>
            {book.estoque !== undefined && (
              <span className="text-xs text-muted-foreground">
                {book.estoque} em estoque
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={!isInStock || isAdding}
          onClick={handleAddToCart}
          data-cy={`add-to-cart-${book.id}`} // ✅ atributo único
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding
            ? "Adicionando..."
            : isInStock
            ? "Adicionar ao Carrinho"
            : "Indisponível"}
        </Button>
      </CardFooter>
    </Card>
  );
}

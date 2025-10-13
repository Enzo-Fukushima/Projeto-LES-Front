"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/products/product-grid";
import { CategoryFilter } from "@/components/products/category-filter";
import { AIChatbot } from "@/components/recommendations/ai-chatbot";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import type { Livro } from "@/lib/types";
import { livrosService } from "@/services/livrosService"; // Serviço que consome API real

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Livro[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        let books: Livro[] = [];
        if (query) {
          books = await livrosService.search(query); // API real de busca
        } else if (selectedCategory) {
          books = await livrosService.getByCategory(selectedCategory); // API por categoria
        } else {
          books = [];
        }

        if (selectedCategory && query) {
          books = books.filter((b) => b.categoria_id === selectedCategory);
        }

        setSearchResults(books);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        toast({
          title: "Erro",
          description: "Não foi possível buscar os livros. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [query, selectedCategory, toast]);

  const handleAddToCart = (bookId: number) => {
    addItem(bookId, 1);
    toast({
      title: "Produto adicionado",
      description: "O livro foi adicionado ao seu carrinho com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Loja
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-2">
              {query ? `Resultados para "${query}"` : "Buscar Livros"}
            </h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Carregando livros..."
                : `${searchResults.length} ${
                    searchResults.length === 1
                      ? "livro encontrado"
                      : "livros encontrados"
                  }`}
            </p>
          </div>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <ProductGrid
          books={searchResults}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
        />
      </div>

      <AIChatbot />
    </div>
  );
}

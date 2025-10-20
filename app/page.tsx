"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/products/product-grid";
import { CategoryFilter } from "@/components/products/category-filter";
import { RecommendationSection } from "@/components/recommendations/recommendation-section";
import { AIChatbot } from "@/components/recommendations/ai-chatbot";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { livrosService } from "@/services/LivroService";
import { carrinhoService } from "@/services/CarrinhoService";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth(); // <-- pega o usuário logado

  // Buscar todos os livros da API ao carregar a página
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await livrosService.list();
        console.log(data);
        setBooks(data);
        setFilteredBooks(data);
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os livros.",
          variant: "destructive",
        });
      }
    };
    fetchBooks();
  }, [toast]);

  console.log(user);

  // Filtrar livros quando a categoria mudar
  useEffect(() => {
    if (selectedCategory) {
      setFilteredBooks(
        books.filter((book) => book.categoria_id === selectedCategory)
      );
    } else {
      setFilteredBooks(books);
    }
  }, [selectedCategory, books]);

  const handleAddToCart = async (bookId: number) => {
    try {
      await addItem(bookId, 1);

      toast({
        title: "Produto adicionado",
        description: "O livro foi adicionado ao seu carrinho com sucesso!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o livro ao carrinho.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Sua Biblioteca Digital
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Descubra milhares de livros com recomendações personalizadas por IA.
            A melhor experiência de compra online para amantes da leitura.
          </p>
          <Button size="lg" asChild>
            <a href="#catalog">Explorar Catálogo</a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">
                  Catálogo Completo
                </h3>
                <p className="text-muted-foreground">
                  Milhares de títulos de todas as categorias e gêneros
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">
                  IA Personalizada
                </h3>
                <p className="text-muted-foreground">
                  Recomendações inteligentes baseadas no seu perfil de leitura
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">
                  Entrega Rápida
                </h3>
                <p className="text-muted-foreground">
                  Frete calculado automaticamente e entrega em todo o Brasil
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <RecommendationSection />
        </div>
      </section>

      {/* Product Catalog */}
      <section id="catalog" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-balance mb-4">
              Nosso Catálogo
            </h2>
            <p className="text-muted-foreground text-balance max-w-2xl mx-auto">
              Explore nossa seleção cuidadosa de livros organizados por
              categoria
            </p>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <ProductGrid books={filteredBooks} onAddToCart={handleAddToCart} />
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

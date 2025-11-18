"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { categoriasService } from "@/services/CategoriaService";

export interface Categoria {
  id: number;
  nome: string;
}

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {

  console.log("📌 [CategoryFilter] selectedCategory recebido do pai:", selectedCategory);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔄 [CategoryFilter] Buscando categorias...");
        setIsLoading(true);

        const data = await categoriasService.list();
        console.log("📦 [CategoryFilter] Dados recebidos da API:", data);

        if (!Array.isArray(data)) {
          console.error("❌ [CategoryFilter] ERRO: API retornou algo que não é array:", data);
          return;
        }

        // LOG extra para verificar IDs nulos
        data.forEach((cat, i) => {
          if (cat.id == null) {
            console.warn(`⚠️ [CategoryFilter] Categoria na posição ${i} veio com ID null/undefined:`, cat);
          }
        });

        setCategories(data);

      } catch (error) {
        console.error("❌ [CategoryFilter] Erro ao buscar categorias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (id: number | null) => {
    console.log("🖱️ [CategoryFilter] Categoria clicada:", id);
    onCategoryChange(id);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategoryClick(null)}
      >
        Todas as Categorias
      </Button>

      {isLoading ? (
        <span>Carregando...</span>
      ) : (
        categories.map((category) => {
          console.log("🔍 [CategoryFilter] Renderizando categoria:", category);

          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(Number(category.id))}
            >
              {category.nome}
            </Button>
          );
        })
      )}
    </div>
  );
}

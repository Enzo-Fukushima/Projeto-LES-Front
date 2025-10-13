// src/components/products/category-filter.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { categoriasService } from "@/services/CategoriaService";

export interface Categoria {
  id: string;
  nome: string;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await categoriasService.list();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        Todas as Categorias
      </Button>

      {isLoading ? (
        <span>Carregando...</span>
      ) : (
        categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.nome}
          </Button>
        ))
      )}
    </div>
  );
}

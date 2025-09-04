"use client"

import { Button } from "@/components/ui/button"
import { mockCategories } from "@/lib/mock-data"

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        Todas as Categorias
      </Button>
      {mockCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
        >
          {category.nome}
        </Button>
      ))}
    </div>
  )
}

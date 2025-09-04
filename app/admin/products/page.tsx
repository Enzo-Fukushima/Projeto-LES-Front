"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockBooks, getStockByBookId } from "@/lib/mock-data"
import { Search, Plus, Edit, Package } from "lucide-react"
import Image from "next/image"

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBooks = mockBooks.filter(
    (book) =>
      book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.autor.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie o catálogo de livros e estoque</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catálogo de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => {
                  const stock = getStockByBookId(book.id)
                  const isLowStock = stock && stock.quantidade_disponivel <= stock.estoque_minimo

                  return (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 flex-shrink-0">
                            <Image
                              src={book.imagem_url || "/placeholder.svg"}
                              alt={book.titulo}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{book.titulo}</p>
                            <p className="text-sm text-muted-foreground">{book.autor}</p>
                            <p className="text-xs text-muted-foreground">{book.editora}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Ficção</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(book.preco)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className={isLowStock ? "text-destructive font-medium" : ""}>
                            {stock?.quantidade_disponivel || 0} unidades
                          </p>
                          {isLowStock && (
                            <Badge variant="destructive" className="text-xs">
                              Estoque Baixo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={book.ativo ? "default" : "secondary"}>{book.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

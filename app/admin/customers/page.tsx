"use client"

import { useState } from "react"
import Link from "next/link"
import { getAllUsers, searchUsers } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, UserX, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>(getAllUsers())
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setCustomers(getAllUsers())
    } else {
      setCustomers(searchUsers(query))
    }
  }

  const handleToggleStatus = (customerId: string, currentStatus: boolean) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId ? { ...customer, ativo: !currentStatus, data_atualizacao: new Date() } : customer,
      ),
    )

    toast({
      title: currentStatus ? "Cliente desativado" : "Cliente ativado",
      description: `O status do cliente foi ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return "-"
    return phone
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <p className="text-muted-foreground">Gerencie os clientes cadastrados na loja</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou código..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Total: {customers.length} clientes</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-sm">{customer.codigo_cliente}</TableCell>
                  <TableCell className="font-medium">{customer.nome}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{formatPhone(customer.telefone)}</TableCell>
                  <TableCell>{formatDate(customer.data_criacao)}</TableCell>
                  <TableCell>
                    <Badge variant={customer.ativo ? "default" : "secondary"}>
                      {customer.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(customer.id, customer.ativo)}>
                          {customer.ativo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{customers.filter((c) => c.ativo).length}</div>
          <p className="text-sm text-muted-foreground">Clientes Ativos</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{customers.filter((c) => !c.ativo).length}</div>
          <p className="text-sm text-muted-foreground">Clientes Inativos</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{customers.length}</div>
          <p className="text-sm text-muted-foreground">Total de Clientes</p>
        </div>
      </div>
    </div>
  )
}

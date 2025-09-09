"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, UserX, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { clientesService } from "@/services/ClienteService"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Carregar clientes da API
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await clientesService.list()
      console.log(data);
      setCustomers(data)
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os clientes." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    try {
      setLoading(true)
      if (query.trim() === "") {
        await fetchCustomers()
      } else {
        // Se sua API tiver filtro por query, poderia ser algo tipo clientesService.search(query)
        const all = await clientesService.list()
        const filtered = all.filter(
          (c: any) =>
            c.nome.toLowerCase().includes(query.toLowerCase()) ||
            c.email.toLowerCase().includes(query.toLowerCase()) ||
            c.codigo_cliente.toString().includes(query)
        )
        setCustomers(filtered)
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível buscar os clientes." })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await clientesService.deactivate(Number(customerId))
      } else {
        await clientesService.activate(Number(customerId))
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, ativo: !currentStatus, data_atualizacao: new Date() } : c
        )
      )
      toast({
        title: currentStatus ? "Cliente desativado" : "Cliente ativado",
        description: `O status do cliente foi ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
      })
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível alterar o status do cliente." })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(date)
    )
  }

  const formatPhone = (phone?: string) => (phone ? phone : "-")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <p className="text-muted-foreground">Gerencie os clientes cadastrados na loja</p>
      </div>

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
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
                            <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(customer.id, customer.ativo)}>
                          {customer.ativo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" /> Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" /> Ativar
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

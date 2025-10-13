"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { clientesService } from "@/services/ClienteService"
import type { ClienteUpdateDTO } from "@/lib/types"

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = Number(params.id)
  const { toast } = useToast()

  const [cliente, setCliente] = useState<ClienteUpdateDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [senhaConfirm, setSenhaConfirm] = useState("")

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true)
        const data = await clientesService.getById(clienteId)
        setCliente({
          id: data.id,
          nome: data.nome,
          cpf: data.cpf,
          email: data.email,
          senha: "",
          tipoTelefone: data.tipoTelefone || "CELULAR",
          ddd: data.ddd || "",
          numeroTelefone: data.numeroTelefone || "",
          ativo: true || false,
          ranking: data.ranking || 0,
        })
      } catch {
        toast({ title: "Erro", description: "Não foi possível carregar o cliente." })
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [clienteId])

  const handleInputChange = (field: keyof ClienteUpdateDTO, value: string | boolean) => {
    if (!cliente) return
    setCliente({ ...cliente, [field]: value })
  }

  const handleSave = async () => {
    if (!cliente) return

    if (cliente.senha && cliente.senha !== senhaConfirm) {
      toast({ title: "Erro", description: "As senhas não coincidem." })
      return
    }

    try {
      setLoading(true)
      const payload: ClienteUpdateDTO = { ...cliente }
      if (!cliente.senha) {
        delete payload.senha
      }

      await clientesService.update(cliente.id, payload)

      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram salvas com sucesso.",
      })
      router.push(`/admin/customers`)
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar o cliente." })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <Button onClick={() => router.push("/admin/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
          <p className="text-muted-foreground">Edite as informações do cliente {cliente.nome}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados básicos do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={cliente.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={cliente.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="ddd">DDD</Label>
                <Input
                  id="ddd"
                  value={cliente.ddd}
                  onChange={(e) => handleInputChange("ddd", e.target.value)}
                  placeholder="11"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="numeroTelefone">Telefone</Label>
                <Input
                  id="numeroTelefone"
                  value={cliente.numeroTelefone}
                  onChange={(e) => handleInputChange("numeroTelefone", e.target.value)}
                  placeholder="99999-9999"
                />
              </div>

              <div className="space-y-2 col-span-3">
                <Label htmlFor="tipoTelefone">Tipo de Telefone</Label>
                <Select
                  value={cliente.tipoTelefone}
                  onValueChange={(value) => handleInputChange("tipoTelefone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CELULAR">Celular</SelectItem>
                    <SelectItem value="RESIDENCIAL">Residencial</SelectItem>
                    <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                disabled
                id="cpf"
                value={cliente.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Conta</CardTitle>
            <CardDescription>Status e configurações do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Status da Conta</Label>
              <Switch
                checked={cliente.ativo}
                onCheckedChange={(checked) => handleInputChange("ativo", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Salvar Alterações
        </Button>
      </div>
    </div>
  )
}

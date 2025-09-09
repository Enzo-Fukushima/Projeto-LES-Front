"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  CreditCard,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { validatePassword } from "@/lib/utils/password";
import { clientesService } from "@/services/ClienteService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    senha: "",
    confirmar_senha: "",
    endereco_cobranca: {
      cep: "",
      tipoLogradouro: "RUA",
      tipoResidencia: "",
      tipoEndereco: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "",
    },
    endereco_entrega: {
      cep: "",
      tipoLogradouro: "RUA",
      tipoResidencia: "",
      tipoEndereco: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "",
    },
    mesmo_endereco: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("endereco_cobranca.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        endereco_cobranca: { ...prev.endereco_cobranca, [field]: value },
      }));
      if (formData.mesmo_endereco) {
        setFormData((prev) => ({
          ...prev,
          endereco_entrega: { ...prev.endereco_cobranca, [field]: value },
        }));
      }
    } else if (name.startsWith("endereco_entrega.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        endereco_entrega: { ...prev.endereco_entrega, [field]: value },
      }));
    } else if (name === "mesmo_endereco") {
      setFormData((prev) => ({
        ...prev,
        mesmo_endereco: checked,
        endereco_entrega: checked
          ? { ...prev.endereco_cobranca }
          : { ...prev.endereco_entrega },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    const newErrors: string[] = [];

    if (!formData.nome) newErrors.push("Nome é obrigatório");
    if (!formData.email) newErrors.push("Email é obrigatório");
    if (!formData.senha) newErrors.push("Senha é obrigatória");

    const endCob = formData.endereco_cobranca;
    if (!endCob.cep) newErrors.push("CEP de cobrança é obrigatório");
    if (!endCob.logradouro)
      newErrors.push("Logradouro de cobrança é obrigatório");
    if (!endCob.numero) newErrors.push("Número de cobrança é obrigatório");
    if (!endCob.bairro) newErrors.push("Bairro de cobrança é obrigatório");
    if (!endCob.cidade) newErrors.push("Cidade de cobrança é obrigatória");
    if (!endCob.estado) newErrors.push("Estado de cobrança é obrigatório");

    if (!formData.mesmo_endereco) {
      const endEnt = formData.endereco_entrega;
      if (!endEnt.cep) newErrors.push("CEP de entrega é obrigatório");
      if (!endEnt.logradouro)
        newErrors.push("Logradouro de entrega é obrigatório");
      if (!endEnt.numero) newErrors.push("Número de entrega é obrigatório");
      if (!endEnt.bairro) newErrors.push("Bairro de entrega é obrigatório");
      if (!endEnt.cidade) newErrors.push("Cidade de entrega é obrigatória");
      if (!endEnt.estado) newErrors.push("Estado de entrega é obrigatório");
    }

    const passwordValidation = validatePassword(formData.senha);
    if (!passwordValidation.isValid)
      newErrors.push(...passwordValidation.errors);
    if (formData.senha !== formData.confirmar_senha)
      newErrors.push("As senhas não coincidem");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ""), // remove pontos e traço
        genero: "OUTRO",
        dataNascimento: formData.data_nascimento,
        email: formData.email,
        senha: formData.senha,
        tipoTelefone: "CELULAR",
        ddd: formData.telefone.replace(/\D/g, "").slice(0, 2),
        numeroTelefone: formData.telefone.replace(/\D/g, "").slice(2),
        enderecos: [
          {
            ...formData.endereco_cobranca,
            tipo: "COBRANCA",
            observacoes: formData.endereco_cobranca.complemento || "-", // preencher observações
          },
          {
            ...(formData.mesmo_endereco
              ? formData.endereco_cobranca
              : formData.endereco_entrega),
            tipo: "ENTREGA",
            observacoes:
              (formData.mesmo_endereco
                ? formData.endereco_cobranca.complemento
                : formData.endereco_entrega.complemento) || "-", // preencher observações
          },
        ],
      };

      await clientesService.create(payload);
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrors(["Erro ao criar conta. Tente novamente."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">Livruvru</span>
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Crie sua conta para começar a comprar livros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="123.456.789-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar_senha">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmar_senha"
                    name="confirmar_senha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmar_senha}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Endereço de Cobrança */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Endereço de Cobrança *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.cep">CEP *</Label>
                <Input
                  id="endereco_cobranca.cep"
                  name="endereco_cobranca.cep"
                  value={formData.endereco_cobranca.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco_cobranca.tipoLogradouro">
                  Tipo Logradouro *
                </Label>
                <Select
                  value={formData.endereco_cobranca.tipoLogradouro || undefined}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco_cobranca: {
                        ...prev.endereco_cobranca,
                        tipoLogradouro: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUA">RUA</SelectItem>
                    <SelectItem value="AVENIDA">AVENIDA</SelectItem>
                    <SelectItem value="ALAMEDA">ALAMEDA</SelectItem>
                    <SelectItem value="PRACA">PRAÇA</SelectItem>
                    <SelectItem value="TRAVESSA">TRAVESSA</SelectItem>
                    <SelectItem value="VIELA">VIELA</SelectItem>
                    <SelectItem value="RODOVIA">RODOVIA</SelectItem>
                    <SelectItem value="CAMINHO">CAMINHO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco_cobranca.logradouro">
                  Logradouro *
                </Label>
                <Input
                  id="endereco_cobranca.logradouro"
                  name="endereco_cobranca.logradouro"
                  value={formData.endereco_cobranca.logradouro}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.numero">Número *</Label>
                <Input
                  id="endereco_cobranca.numero"
                  name="endereco_cobranca.numero"
                  value={formData.endereco_cobranca.numero}
                  onChange={handleChange}
                  placeholder="123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.complemento">
                  Complemento
                </Label>
                <Input
                  id="endereco_cobranca.complemento"
                  name="endereco_cobranca.complemento"
                  value={formData.endereco_cobranca.complemento}
                  onChange={handleChange}
                  placeholder="Apto, Sala"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco_cobranca.bairro">Bairro *</Label>
                <Input
                  id="endereco_cobranca.bairro"
                  name="endereco_cobranca.bairro"
                  value={formData.endereco_cobranca.bairro}
                  onChange={handleChange}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.cidade">Cidade *</Label>
                <Input
                  id="endereco_cobranca.cidade"
                  name="endereco_cobranca.cidade"
                  value={formData.endereco_cobranca.cidade}
                  onChange={handleChange}
                  placeholder="Nome da cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.pais">País *</Label>
                <Input
                  id="endereco_cobranca.pais"
                  name="endereco_cobranca.pais"
                  value={formData.endereco_cobranca.pais}
                  onChange={handleChange}
                  placeholder="País"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.estado">Estado *</Label>
                <Input
                  id="endereco_cobranca.estado"
                  name="endereco_cobranca.estado"
                  value={formData.endereco_cobranca.estado}
                  onChange={handleChange}
                  placeholder="SP"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Endereço de Entrega */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de Entrega *
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mesmo_endereco"
                  name="mesmo_endereco"
                  checked={formData.mesmo_endereco}
                  onChange={handleChange}
                  className="rounded"
                />
                <Label htmlFor="mesmo_endereco" className="text-sm">
                  Mesmo endereço de cobrança
                </Label>
              </div>
            </div>

            {!formData.mesmo_endereco && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.cep">CEP *</Label>
                    <Input
                      id="endereco_entrega.cep"
                      name="endereco_entrega.cep"
                      value={formData.endereco_entrega.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco_entrega.tipoLogradouro">
                      Tipo Logradouro *
                    </Label>
                    <Select
                      value={formData.endereco_entrega.tipoLogradouro}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          endereco_entrega: {
                            ...prev.endereco_entrega,
                            tipoLogradouro: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUA">RUA</SelectItem>
                        <SelectItem value="AVENIDA">AVENIDA</SelectItem>
                        <SelectItem value="ALAMEDA">ALAMEDA</SelectItem>
                        <SelectItem value="PRACA">PRAÇA</SelectItem>
                        <SelectItem value="TRAVESSA">TRAVESSA</SelectItem>
                        <SelectItem value="VIELA">VIELA</SelectItem>
                        <SelectItem value="RODOVIA">RODOVIA</SelectItem>
                        <SelectItem value="CAMINHO">CAMINHO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco_entrega.logradouro">
                      Logradouro *
                    </Label>
                    <Input
                      id="endereco_entrega.logradouro"
                      name="endereco_entrega.logradouro"
                      value={formData.endereco_entrega.logradouro}
                      onChange={handleChange}
                      placeholder="Rua, Avenida, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.numero">Número *</Label>
                    <Input
                      id="endereco_entrega.numero"
                      name="endereco_entrega.numero"
                      value={formData.endereco_entrega.numero}
                      onChange={handleChange}
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.complemento">
                      Complemento
                    </Label>
                    <Input
                      id="endereco_entrega.complemento"
                      name="endereco_entrega.complemento"
                      value={formData.endereco_entrega.complemento}
                      onChange={handleChange}
                      placeholder="Apto, Sala"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco_entrega.bairro">Bairro *</Label>
                    <Input
                      id="endereco_entrega.bairro"
                      name="endereco_entrega.bairro"
                      value={formData.endereco_entrega.bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.cidade">Cidade *</Label>
                    <Input
                      id="endereco_entrega.cidade"
                      name="endereco_entrega.cidade"
                      value={formData.endereco_entrega.cidade}
                      onChange={handleChange}
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.pais">País *</Label>
                    <Input
                      id="endereco_entrega.pais"
                      name="endereco_entrega.pais"
                      value={formData.endereco_entrega.pais}
                      onChange={handleChange}
                      placeholder="País"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.estado">Estado *</Label>
                    <Input
                      id="endereco_entrega.estado"
                      name="endereco_entrega.estado"
                      value={formData.endereco_entrega.estado}
                      onChange={handleChange}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Ao criar uma conta, você concorda com nossos termos de uso e política
          de privacidade.
        </div>
      </CardContent>
    </Card>
  );
}

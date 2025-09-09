"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { clientesService } from "@/services/ClienteService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validatePassword } from "@/lib/utils/password";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: "",
    genero: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    senha: "",
    confirmar_senha: "",
    endereco_cobranca: {
      cep: "",
      tipoResidencia: "",
      tipoLogradouro: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "",
      apelido: "",
    },
    endereco_entrega: {
      cep: "",
      tipoResidencia: "",
      tipoLogradouro: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      pais: "",
      apelido: "",
    },
    mesmo_endereco: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatCEP = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);
  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .substring(0, 14);
  const formatPhone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "cpf") {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(value) }));
      return;
    }

    if (name === "telefone") {
      setFormData((prev) => ({ ...prev, telefone: formatPhone(value) }));
      return;
    }

    if (name === "mesmo_endereco") {
      setFormData((prev) => ({
        ...prev,
        mesmo_endereco: checked,
        endereco_entrega: checked
          ? { ...prev.endereco_cobranca }
          : { ...prev.endereco_entrega },
      }));
      return;
    }

    // Campos de endereço
    if (
      name.startsWith("endereco_cobranca.") ||
      name.startsWith("endereco_entrega.")
    ) {
      const [prefix, field] = name.split(".") as [
        "endereco_cobranca" | "endereco_entrega",
        string
      ];
      setFormData((prev) => {
        const updated = { ...prev[prefix], [field]: value };
        return {
          ...prev,
          [prefix]: updated,
          endereco_entrega:
            prev.mesmo_endereco && prefix === "endereco_cobranca"
              ? { ...updated }
              : prev.endereco_entrega,
        };
      });
      return;
    }

    // Campos simples
    setFormData((prev) => ({
      ...prev,
      [name as keyof typeof formData]: type === "checkbox" ? checked : value,
    }));
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
    [
      "cep",
      "logradouro",
      "numero",
      "bairro",
      "cidade",
      "estado",
      "pais",
    ].forEach((f) => {
      if (!endCob[f as keyof typeof endCob])
        newErrors.push(
          `${f.charAt(0).toUpperCase() + f.slice(1)} de cobrança é obrigatório`
        );
    });

    if (!formData.mesmo_endereco) {
      const endEnt = formData.endereco_entrega;
      [
        "cep",
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "estado",
        "pais",
      ].forEach((f) => {
        if (!endEnt[f as keyof typeof endEnt])
          newErrors.push(
            `${f.charAt(0).toUpperCase() + f.slice(1)} de entrega é obrigatório`
          );
      });
    }

    const pwdValidation = validatePassword(formData.senha);
    if (!pwdValidation.isValid) newErrors.push(...pwdValidation.errors);
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
        cpf: formData.cpf.replace(/\D/g, ""),
        genero: formData.genero || "OUTRO",
        dataNascimento: formData.data_nascimento,
        email: formData.email,
        senha: formData.senha,
        tipoTelefone: "CELULAR",
        ddd: formData.telefone.replace(/\D/g, "").slice(0, 2),
        numeroTelefone: formData.telefone.replace(/\D/g, "").slice(2),
        enderecos: [
          {
            ...formData.endereco_cobranca,
            tipoEndereco: "COBRANCA",
            apelido: formData.endereco_cobranca.apelido || "-",
            estado: formData.endereco_cobranca.estado.toUpperCase(),
          },
          {
            ...(formData.mesmo_endereco
              ? formData.endereco_cobranca
              : formData.endereco_entrega),
            tipoEndereco: "ENTREGA",
            apelido:
              (formData.mesmo_endereco
                ? formData.endereco_cobranca.apelido
                : formData.endereco_entrega.apelido) || "-",
            estado: (formData.mesmo_endereco
              ? formData.endereco_cobranca.estado
              : formData.endereco_entrega.estado
            ).toUpperCase(),
          },
        ],
      };
      console.log("Payload para registro:", payload); // Log do payload

      await clientesService.create(payload);
      router.push("/");
    } catch {
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

              <div className="space-y-2">
                <Label htmlFor="genero">Gênero *</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      genero: value, // agora atualiza o campo correto
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Endereço de Cobrança *
            </h3>

            {/* Linha 1: CEP | Tipo Residência | Tipo Logradouro */}
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
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.tipoResidencia">
                  Tipo Residência *
                </Label>
                <Select
                  value={formData.endereco_cobranca.tipoResidencia || undefined}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco_cobranca: {
                        ...prev.endereco_cobranca,
                        tipoResidencia: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASA">Casa</SelectItem>
                    <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
            </div>

            {/* Linha 2: Logradouro */}
            <div className="space-y-2">
              <Label htmlFor="endereco_cobranca.logradouro">Logradouro *</Label>
              <Input
                id="endereco_cobranca.logradouro"
                name="endereco_cobranca.logradouro"
                value={formData.endereco_cobranca.logradouro}
                onChange={handleChange}
                placeholder="Rua, Avenida, etc."
                required
                className="w-full"
              />
            </div>

            {/* Linha 3: Número | Complemento | Bairro */}
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
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.complemento">
                  Apelido
                </Label>
                <Input
                  id="endereco_cobranca.complemento"
                  name="endereco_cobranca.complemento"
                  value={formData.endereco_cobranca.apelido}
                  onChange={handleChange}
                  placeholder="Apto, Sala"
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>

            {/* Linha 4: Cidade | Estado | País */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_cobranca.cidade">Cidade *</Label>
                <Input
                  id="endereco_cobranca.cidade"
                  name="endereco_cobranca.cidade"
                  value={formData.endereco_cobranca.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  required
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
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
                {/* Linha 1: CEP | Tipo Residência | Tipo Logradouro */}
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
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.tipoResidencia">
                      Tipo Residência *
                    </Label>
                    <Select
                      value={
                        formData.endereco_entrega.tipoResidencia || undefined
                      }
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          endereco_entrega: {
                            ...prev.endereco_entrega,
                            tipoResidencia: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.tipoLogradouro">
                      Tipo Logradouro *
                    </Label>
                    <Select
                      value={
                        formData.endereco_entrega.tipoLogradouro || undefined
                      }
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
                </div>

                {/* Linha 2: Logradouro */}
                <div className="space-y-2">
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
                    className="w-full"
                  />
                </div>

                {/* Linha 3: Número | Complemento | Bairro */}
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
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Linha 4: Cidade | Estado | País */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco_entrega.cidade">Cidade *</Label>
                    <Input
                      id="endereco_entrega.cidade"
                      name="endereco_entrega.cidade"
                      value={formData.endereco_entrega.cidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                      required
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
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

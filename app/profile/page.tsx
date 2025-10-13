<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, User, MapPin, CreditCard, Lock } from "lucide-react";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { AddressManagement } from "@/components/profile/address-management";
import { PaymentManagement } from "@/components/profile/payment-management";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { clientesService } from "@/services/ClienteService";
import { enderecoService } from "@/services/EnderecoService";
import { cartaoService } from "@/services/CartoesService";
import type {
  ClienteDetalhadoDTO,
  EnderecoDTO,
  CartaoCreditoDTO,
} from "@/lib/types";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<ClienteDetalhadoDTO | null>(null);
  const [addresses, setAddresses] = useState<EnderecoDTO[]>([]);
  const [payments, setPayments] = useState<CartaoCreditoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
=======
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, MapPin, CreditCard, Lock } from "lucide-react"
import { PersonalInfoForm } from "@/components/profile/personal-info-form"
import { AddressManagement } from "@/components/profile/address-management"
import { PaymentManagement } from "@/components/profile/payment-management"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { clientesService } from "@/services/ClienteService"
import type { Cliente } from "@/lib/types"

export default function ProfilePage() {
  const [user, setUser] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Substitua pelo ID fixo do cliente que você quer carregar
  const FIXED_USER_ID = 16

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const fetchedUser = await clientesService.get(FIXED_USER_ID)
        setUser(fetchedUser)
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Carregando usuário...</p>
      </div>
    )
  }
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await clientesService.getById(authUser.id);
        setUser(userData);

        const userAddresses = await enderecoService.listByUser(authUser.id);
        setAddresses(userAddresses);

        const userPayments = await cartaoService.listByUser(authUser.id);
        setPayments(userPayments);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
<<<<<<< HEAD
        <p className="text-muted-foreground mb-4">
          Você precisa estar logado para acessar seu perfil.
        </p>
=======
        <p className="text-muted-foreground mb-4">Não foi possível carregar o usuário.</p>
>>>>>>> 6f32a6fafdf73cbb4587be3532fa2d236b454a4f
        <Button asChild>
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        Carregando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Loja
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cartões
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Senha
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Endereços</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressManagement
                userId={user.id}
                addresses={addresses}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Cartões de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentManagement userId={user.id} payments={payments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

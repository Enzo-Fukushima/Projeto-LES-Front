"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Package, Layers, Loader2, AlertCircle } from "lucide-react";
import { analyticsService } from "@/services/AnaliseService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SalesDataPoint {
  date: string;
  displayDate: string;
  quantity: number;
  revenue: number;
}

export default function SalesAnalyticsPage() {
  const [viewType, setViewType] = useState<"produto" | "categoria">("produto");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: number; nome: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; nome: string }>>([]);
  const [error, setError] = useState<string>("");

  // Carregar produtos e categorias
  useEffect(() => {
    loadFiltersData();
    
    // Definir datas padrão (últimos 30 dias)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const loadFiltersData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        analyticsService.getProducts(),
        analyticsService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar filtros:", error);
      setError("Erro ao carregar produtos e categorias");
    }
  };

  const loadSalesData = async () => {
    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas");
      return;
    }

    if (viewType === "produto" && !selectedProduct) {
      setError("Por favor, selecione um produto");
      return;
    }

    if (viewType === "categoria" && !selectedCategory) {
      setError("Por favor, selecione uma categoria");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await analyticsService.getSalesData({
        tipo: viewType === "produto" ? "PRODUTO" : "CATEGORIA",
        id: Number(viewType === "produto" ? selectedProduct : selectedCategory),
        dataInicio: startDate,
        dataFim: endDate,
      });

      // Transformar dados da API para o formato do gráfico
      const chartData: SalesDataPoint[] = data.map((item) => ({
        date: item.data,
        displayDate: new Date(item.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        quantity: item.quantidade,
        revenue: item.valorTotal,
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error("Erro ao carregar dados de vendas:", error);
      setError("Erro ao carregar dados de vendas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTotalQuantity = () => {
    return salesData.reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const getTotalRevenue = () => {
    return salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  };

  const getAverageTicket = () => {
    const totalQuantity = getTotalQuantity();
    const totalRevenue = getTotalRevenue();
    return totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise de Vendas</h1>
        <p className="text-muted-foreground">
          Visualize o volume de vendas por produto ou categoria em períodos personalizados
        </p>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Análise
          </CardTitle>
          <CardDescription>
            Selecione o tipo de análise, período e produto/categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="viewType">Tipo de Análise</Label>
              <Select value={viewType} onValueChange={(value: "produto" | "categoria") => setViewType(value)}>
                <SelectTrigger id="viewType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Por Produto
                    </div>
                  </SelectItem>
                  <SelectItem value="categoria">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Por Categoria
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewType === "produto" ? (
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={loadSalesData}
              disabled={
                isLoading ||
                !startDate ||
                !endDate ||
                (viewType === "produto" && !selectedProduct) ||
                (viewType === "categoria" && !selectedCategory)
              }
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Gerar Análise
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumidas */}
      {salesData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalQuantity()}</div>
              <p className="text-xs text-muted-foreground">unidades vendidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
              <p className="text-xs text-muted-foreground">no período selecionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getAverageTicket())}</div>
              <p className="text-xs text-muted-foreground">por unidade</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Linhas */}
      {salesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Volume de Vendas - {viewType === "produto" ? "Produto" : "Categoria"}
            </CardTitle>
            <CardDescription>
              Análise de {startDate && new Date(startDate).toLocaleDateString("pt-BR")} até{" "}
              {endDate && new Date(endDate).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Gráfico de Quantidade */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quantidade Vendida</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="displayDate"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Quantidade"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Receita */}
              <div>
                <h4 className="text-sm font-medium mb-3">Receita</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="displayDate"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke="hsl(142.1 76.2% 36.3%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(142.1 76.2% 36.3%)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {salesData.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado para exibir</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Selecione um {viewType === "produto" ? "produto" : "categoria"}, defina o período e clique em
              "Gerar Análise" para visualizar os dados de vendas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Package,
  Layers,
  Loader2,
  AlertCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { analyticsService } from "@/services/AnaliseService";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";

interface SalesDataPoint {
  // dynamic keys: qty_{id}, rev_{id}
  date: string;
  displayDate: string;
  [key: string]: any;
}

export default function AdminAnalyticsPage() {
  const [viewType, setViewType] = useState<"produto" | "categoria">("produto");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: number; nome: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; nome: string }>>([]);
  const [error, setError] = useState<string>("");

  // Paleta de cores (rotaciona se precisar)
  const CHART_COLORS = [
    "#3b82f6", // azul
    "#ef4444", // vermelho
    "#10b981", // verde
    "#f59e0b", // laranja
    "#8b5cf6", // roxo
    "#06b6d4", // cyan
    "#f97316", // deep orange
  ];

  useEffect(() => {
    loadFiltersData();

    // padrão: últimos 30 dias
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
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
      setError("Erro ao carregar produtos e categorias");
    }
  };

  // Helpers
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getTotalQuantity = () =>
    salesData.reduce((acc, curr) => {
      // soma todas as qty_* chaves
      const qtySum = Object.keys(curr)
        .filter((k) => k.startsWith("qty_"))
        .reduce((s, k) => s + Number(curr[k] || 0), 0);
      return acc + qtySum;
    }, 0);

  const getTotalRevenue = () =>
    salesData.reduce((acc, curr) => {
      const revSum = Object.keys(curr)
        .filter((k) => k.startsWith("rev_"))
        .reduce((s, k) => s + Number(curr[k] || 0), 0);
      return acc + revSum;
    }, 0);

  const getAverageTicket = () => {
    const totalQty = getTotalQuantity();
    const totalRev = getTotalRevenue();
    return totalQty > 0 ? totalRev / totalQty : 0;
  };

  // MultiSelect (interno, baseado em Popover+Command)
  function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  interface MultiSelectProps {
    items: { id: string | number; label: string }[];
    selected: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
  }

  function MultiSelect({ items, selected, onChange, placeholder = "Selecione..." }: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const toggle = (id: string) => {
      if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
      else onChange([...selected, id]);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {selected.length > 0 ? `${selected.length} selecionado(s)` : placeholder}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar..." className="h-9" />
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem key={item.id} value={String(item.label)} onSelect={() => toggle(String(item.id))}>
                  <Check className={cn("mr-2 h-4 w-4", selected.includes(String(item.id)) ? "opacity-100" : "opacity-0")} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  /**
   * Monta o salesData para Recharts:
   * - Para cada dia entre startDate e endDate cria um objeto com displayDate e chaves qty_{id}, rev_{id}
   * - results: array de arrays (cada item: SalesAnalyticsDTO[])
   * - ids: array de ids que correspondem à mesma ordem de results
   */
  const buildMultiSeriesData = (
    results: Array<Array<{ data: string; quantidade: number; valorTotal: number }>>,
    ids: number[],
    labels: string[]
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // criar mapa: date -> { qty_{id}: number, rev_{id}: number }
    const dateMap = new Map<string, Record<string, number>>();

    // inicialmente preenche o mapa com zeros no intervalo
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0];
      dateMap.set(key, {}); // preenchido depois
      cursor.setDate(cursor.getDate() + 1);
    }

    // Para cada result (correspondente a um id), preencher mapa
    results.forEach((arr, idx) => {
      const id = ids[idx];
      const qtyKey = `qty_${id}`;
      const revKey = `rev_${id}`;

      // transformar arr em mapa local data->values
      const local = new Map<string, { q: number; r: number }>();
      arr.forEach((it) => {
        local.set(it.data, {
          q: Number(it.quantidade ?? 0),
          r: Number(it.valorTotal ?? 0),
        });
      });

      // percorrer todas as datas do dateMap e setar valores (0 quando não há)
      for (const [dateKey] of dateMap) {
        const existing = dateMap.get(dateKey) || {};
        const localVal = local.get(dateKey);
        existing[qtyKey] = localVal ? localVal.q : 0;
        existing[revKey] = localVal ? localVal.r : 0;
        dateMap.set(dateKey, existing);
      }
    });

    // construir array final ordenado
    const final: SalesDataPoint[] = [];
    Array.from(dateMap.keys())
      .sort()
      .forEach((dateKey) => {
        const entry = dateMap.get(dateKey) || {};
        final.push({
          date: dateKey,
          displayDate: new Date(dateKey).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          ...entry,
        });
      });

    return final;
  };

  const loadSalesData = async () => {
    setError("");
    if (!startDate || !endDate) {
      setError("Por favor, selecione as datas");
      return;
    }

    const ids = viewType === "produto" ? selectedProducts.map(Number) : selectedCategories.map(Number);
    if (!ids.length) {
      setError(`Por favor, selecione pelo menos ${viewType === "produto" ? "um produto" : "uma categoria"}`);
      return;
    }

    setIsLoading(true);
    try {
      // efetua uma chamada por id
      const promises = ids.map((id) =>
        analyticsService.getSalesData({
          tipo: viewType === "produto" ? "PRODUTO" : "CATEGORIA",
          id,
          dataInicio: startDate,
          dataFim: endDate,
        })
      );

      const results = await Promise.all(promises); // Array<SalesAnalyticsDTO[]>

      // labels: buscar nome dos ids nas listas carregadas
      const labels = ids.map((id) => {
        if (viewType === "produto") {
          const p = products.find((x) => x.id === id);
          return p ? p.nome : `Produto ${id}`;
        } else {
          const c = categories.find((x) => x.id === id);
          return c ? c.nome : `Categoria ${id}`;
        }
      });

      const combined = buildMultiSeriesData(results as any, ids, labels);
      setSalesData(combined);
    } catch (err) {
      console.error("Erro ao carregar dados de vendas:", err);
      setError("Erro ao carregar dados de vendas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar configurações de linhas para renderizar dinamicamente
  const prepareSeriesConfig = () => {
    const ids = viewType === "produto" ? selectedProducts.map(Number) : selectedCategories.map(Number);
    const labels = ids.map((id) => {
      if (viewType === "produto") {
        const p = products.find((x) => x.id === id);
        return p ? p.nome : `Produto ${id}`;
      } else {
        const c = categories.find((x) => x.id === id);
        return c ? c.nome : `Categoria ${id}`;
      }
    });

    return ids.map((id, idx) => ({
      id,
      label: labels[idx],
      color: CHART_COLORS[idx % CHART_COLORS.length],
      qtyKey: `qty_${id}`,
      revKey: `rev_${id}`,
    }));
  };

  const seriesConfig = prepareSeriesConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise de Vendas</h1>
        <p className="text-muted-foreground">
          Visualize o volume de vendas por produto ou categoria em períodos personalizados
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Análise
          </CardTitle>
          <CardDescription>Selecione o tipo de análise, período e produto/categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="viewType">Tipo de Análise</Label>
              <Select value={viewType} onValueChange={(v: "produto" | "categoria") => setViewType(v)}>
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
                <Label>Produtos</Label>
                <MultiSelect
                  items={products.map((p) => ({ id: p.id, label: p.nome }))}
                  selected={selectedProducts}
                  onChange={setSelectedProducts}
                  placeholder="Selecione os produtos"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Categorias</Label>
                <MultiSelect
                  items={categories.map((c) => ({ id: c.id, label: c.nome }))}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Selecione as categorias"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={endDate || undefined} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={loadSalesData}
              disabled={
                isLoading ||
                !startDate ||
                !endDate ||
                (viewType === "produto" && selectedProducts.length === 0) ||
                (viewType === "categoria" && selectedCategories.length === 0)
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

      {/* Métricas */}
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

      {/* Gráficos */}
      {salesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Volume de Vendas - {viewType === "produto" ? "Produto" : "Categoria"}</CardTitle>
            <CardDescription>
              Análise de {startDate && new Date(startDate).toLocaleDateString("pt-BR")} até{" "}
              {endDate && new Date(endDate).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Quantidade por item */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quantidade Vendida</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="displayDate" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    {seriesConfig.map((s) => (
                      <Line
                        key={s.qtyKey}
                        type="monotone"
                        dataKey={s.qtyKey}
                        name={s.label}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Receita por item */}
              <div>
                <h4 className="text-sm font-medium mb-3">Receita</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="displayDate" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
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
                    {seriesConfig.map((s) => (
                      <Line
                        key={s.revKey}
                        type="monotone"
                        dataKey={s.revKey}
                        name={s.label}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
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
              Selecione um {viewType === "produto" ? "produto" : "categoria"}, defina o período e clique em "Gerar Análise" para visualizar os dados de vendas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client"

import { StatsCard } from "@/components/admin/stats-cards"
import { SalesChart } from "@/components/admin/sales-chart"
import { RecentOrders } from "@/components/admin/recent-orders"
import { getSalesAnalytics } from "@/lib/mock-data"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const analytics = getSalesAnalytics()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das vendas e performance da loja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total"
          value={formatCurrency(analytics.totalRevenue)}
          change={analytics.monthlyGrowth}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Pedidos"
          value={analytics.totalOrders.toString()}
          change={12.5}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Ticket Médio"
          value={formatCurrency(analytics.averageOrderValue)}
          change={8.2}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Clientes"
          value="1,234"
          change={5.1}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesChart data={analytics.salesByMonth} />
        <RecentOrders orders={analytics.recentOrders} />
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Gift,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  // {
  //   title: "Produtos",
  //   href: "/admin/products",
  //   icon: Package,
  // },
  {
    title: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Trocas",
    href: "/admin/exchanges",
    icon: RefreshCw,
  },
  {
    title: "Cupons",
    href: "/admin/coupons",
    icon: Gift,
  },
  {
    title: "Clientes",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/admin/reports",
    icon: BarChart3,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn("w-full justify-start gap-2", isActive && "bg-primary text-primary-foreground")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar à Loja
          </Link>
        </Button>
      </div>
    </div>
  )
}

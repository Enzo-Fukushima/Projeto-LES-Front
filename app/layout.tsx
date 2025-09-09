import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Livruvru - Sua Biblioteca Digital",
  description: "A melhor livraria online com recomendações personalizadas por IA",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </Suspense>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}

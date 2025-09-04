"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, CartContextType } from "@/lib/types"
import { getBookById } from "@/lib/mock-data"

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bookstore_cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("bookstore_cart", JSON.stringify(items))
  }, [items])

  // Cart timeout functionality (RNF requirement)
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        // Clear cart after 30 minutes of inactivity
        setItems([])
        localStorage.removeItem("bookstore_cart")
      },
      30 * 60 * 1000,
    ) // 30 minutes

    return () => clearTimeout(timeout)
  }, [items])

  const addItem = (bookId: string, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.book_id === bookId)

      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map((item) =>
          item.book_id === bookId ? { ...item, quantidade: item.quantidade + quantity } : item,
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now().toString(),
          user_id: "current_user", // In real app, get from auth context
          book_id: bookId,
          quantidade: quantity,
          data_adicao: new Date(),
        }
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantidade: quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("bookstore_cart")
  }

  const getTotal = () => {
    return items.reduce((total, item) => {
      const book = getBookById(item.book_id)
      return total + (book ? book.preco * item.quantidade : 0)
    }, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantidade, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

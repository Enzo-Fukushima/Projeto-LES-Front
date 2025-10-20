// src/contexts/cart-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { carrinhoService } from "@/services/CarrinhoService";
import { CarrinhoDTO, CarrinhoItemDTO } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

interface CartContextProps {
  items: CarrinhoItemDTO[];
  loading: boolean;
  addItem: (livroId: number, quantidade: number) => Promise<void>;
  updateQuantity: (livroId: number, quantidade: number) => Promise<void>;
  removeItem: (livroId: number) => Promise<void>;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  reloadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CarrinhoItemDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para recarregar carrinho (memoizada)
  const reloadCart = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let carrinho: CarrinhoDTO = await carrinhoService.getByCliente(user.id);
      if (!carrinho) {
        carrinho = await carrinhoService.create(user.id);
      }
      setItems(carrinho.itens);
    } catch (error) {
      console.error("Erro ao recarregar carrinho:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar carrinho ao iniciar ou quando user.id mudar
  useEffect(() => {
    reloadCart();
  }, [reloadCart]);

  const addItem = async (livroId: number, quantidade: number) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let carrinho = await carrinhoService.getByCliente(user.id);
      if (!carrinho) {
        carrinho = await carrinhoService.create(user.id);
      }
      carrinho = await carrinhoService.addItem(carrinho.id, { livroId, quantidade });
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (livroId: number, quantidade: number) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const carrinho = await carrinhoService.updateItem(user.id, { livroId, quantidade });
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (livroId: number) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const carrinho = await carrinhoService.removeItem(user.id, livroId);
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => setItems([]);

  const getItemCount = () =>
    items.reduce((sum, item) => sum + item.quantidade, 0);

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemCount,
        getTotal,
        reloadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
};

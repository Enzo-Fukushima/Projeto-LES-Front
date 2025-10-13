// src/contexts/cart-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { carrinhoService } from "@/services/CarrinhoService";
import { CarrinhoDTO, CarrinhoItemDTO } from "@/lib/types";

interface CartContextProps {
  items: CarrinhoItemDTO[];
  loading: boolean;
  addItem: (livroId: number, quantidade: number) => Promise<void>;
  updateQuantity: (livroId: number, quantidade: number) => Promise<void>;
  removeItem: (livroId: number) => Promise<void>;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CarrinhoItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const clienteId = 1; // temporário: pegar do usuário logado

  // carregar carrinho ao iniciar
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const carrinho: CarrinhoDTO = await carrinhoService.getByCliente(
          clienteId
        );
        setItems(carrinho.itens);
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [clienteId]);

  const addItem = async (livroId: number, quantidade: number) => {
    setLoading(true);
    try {
      const carrinho = await carrinhoService.addItem(clienteId, {
        livroId,
        quantidade,
      });
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (livroId: number, quantidade: number) => {
    setLoading(true);
    try {
      const carrinho = await carrinhoService.updateItem(clienteId, {
        livroId,
        quantidade,
      });
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (livroId: number) => {
    setLoading(true);
    try {
      const carrinho = await carrinhoService.removeItem(clienteId, livroId);
      setItems(carrinho.itens);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
    // opcional: chamar endpoint de limpar carrinho se existir
  };

  // derivativos
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

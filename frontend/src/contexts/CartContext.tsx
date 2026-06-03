import { createContext, useContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

export interface CartProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  is_available: boolean;
  image_url?: string | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  notes: string;
}

interface CartContextData {
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const value = useMemo(
    () => ({
      cart,
      setCart,
      clearCart: () => setCart([]),
    }),
    [cart],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}

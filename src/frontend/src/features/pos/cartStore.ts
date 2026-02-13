import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: number;
  variantId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
  note?: string;
  discount: number;
}

interface CartStore {
  cart: CartItem[];
  cartDiscount: number;
  taxEnabled: boolean;
  addItem: (product: any, variant: any) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  updateDiscount: (id: string, discount: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCartDiscount: (discount: number) => void;
  setTaxEnabled: (enabled: boolean) => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      cartDiscount: 0,
      taxEnabled: false,

      addItem: (product, variant) => {
        const existingItem = get().cart.find(
          (item) => item.productId === product.id && item.variantId === variant.id
        );

        if (existingItem) {
          set({
            cart: get().cart.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}-${Date.now()}`,
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            sku: variant.sku,
            price: variant.retailPrice,
            quantity: 1,
            unit: 'pcs',
            discount: 0,
          };
          set({ cart: [...get().cart, newItem] });
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((item) => item.id !== id) });
        } else {
          set({
            cart: get().cart.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },

      updateNote: (id, note) => {
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, note } : item
          ),
        });
      },

      updateDiscount: (id, discount) => {
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, discount } : item
          ),
        });
      },

      removeItem: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      clearCart: () => {
        set({ cart: [], cartDiscount: 0, taxEnabled: false });
      },

      setCartDiscount: (discount) => {
        set({ cartDiscount: Math.max(0, discount) });
      },

      setTaxEnabled: (enabled) => {
        set({ taxEnabled: enabled });
      },

      get cartSubtotal() {
        const subtotal = get().cart.reduce(
          (sum, item) => sum + item.price * item.quantity - item.discount,
          0
        );
        return Math.max(0, subtotal);
      },

      get cartTax() {
        if (!get().taxEnabled) return 0;
        const subtotal = get().cartSubtotal - get().cartDiscount;
        return Math.max(0, Math.round(subtotal * 0.1));
      },

      get cartTotal() {
        const total = get().cartSubtotal - get().cartDiscount + get().cartTax;
        return Math.max(0, total);
      },
    }),
    {
      name: 'pos-cart-storage',
    }
  )
);

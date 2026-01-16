import { create } from 'zustand';
import { PackingProduct } from '../services/packing.service';

// ==========================================
// TYPES
// ==========================================

interface LocalCartItem {
  productId: string;
  product: PackingProduct;
  quantity: number;
}

interface PackingCartState {
  // Local cart items (for optimistic updates)
  localItems: Map<string, LocalCartItem>;
  
  // Selected quantities for products (before adding to cart)
  productQuantities: Map<string, number>;
  
  // UI state
  isCartVisible: boolean;
  
  // Actions
  setProductQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string, minQty?: number, maxQty?: number | null) => void;
  decrementQuantity: (productId: string, minQty?: number) => void;
  getProductQuantity: (productId: string, defaultQty?: number) => number;
  
  // Local cart actions (for optimistic updates)
  addLocalItem: (productId: string, product: PackingProduct, quantity: number) => void;
  updateLocalItemQuantity: (productId: string, quantity: number) => void;
  removeLocalItem: (productId: string) => void;
  clearLocalCart: () => void;
  
  // UI actions
  showCart: () => void;
  hideCart: () => void;
  toggleCart: () => void;
  
  // Reset all state
  reset: () => void;
}

// ==========================================
// STORE
// ==========================================

export const usePackingCartStore = create<PackingCartState>((set, get) => ({
  localItems: new Map(),
  productQuantities: new Map(),
  isCartVisible: false,

  // Set product quantity
  setProductQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const newQuantities = new Map(state.productQuantities);
      newQuantities.set(productId, Math.max(1, quantity));
      return { productQuantities: newQuantities };
    });
  },

  // Increment quantity for a product
  incrementQuantity: (productId: string, minQty = 1, maxQty = null) => {
    set((state) => {
      const newQuantities = new Map(state.productQuantities);
      const currentQty = newQuantities.get(productId) || minQty;
      const newQty = currentQty + 1;
      
      // Check max constraint
      if (maxQty !== null && newQty > maxQty) {
        return state; // Don't exceed max
      }
      
      newQuantities.set(productId, newQty);
      return { productQuantities: newQuantities };
    });
  },

  // Decrement quantity for a product
  decrementQuantity: (productId: string, minQty = 1) => {
    set((state) => {
      const newQuantities = new Map(state.productQuantities);
      const currentQty = newQuantities.get(productId) || minQty;
      const newQty = Math.max(minQty, currentQty - 1);
      newQuantities.set(productId, newQty);
      return { productQuantities: newQuantities };
    });
  },

  // Get quantity for a product
  getProductQuantity: (productId: string, defaultQty = 1) => {
    return get().productQuantities.get(productId) || defaultQty;
  },

  // Add local item (optimistic update)
  addLocalItem: (productId: string, product: PackingProduct, quantity: number) => {
    set((state) => {
      const newItems = new Map(state.localItems);
      const existing = newItems.get(productId);
      
      if (existing) {
        newItems.set(productId, {
          ...existing,
          quantity: existing.quantity + quantity,
        });
      } else {
        newItems.set(productId, { productId, product, quantity });
      }
      
      return { localItems: newItems };
    });
  },

  // Update local item quantity
  updateLocalItemQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const newItems = new Map(state.localItems);
      const existing = newItems.get(productId);
      
      if (existing) {
        newItems.set(productId, { ...existing, quantity });
      }
      
      return { localItems: newItems };
    });
  },

  // Remove local item
  removeLocalItem: (productId: string) => {
    set((state) => {
      const newItems = new Map(state.localItems);
      newItems.delete(productId);
      return { localItems: newItems };
    });
  },

  // Clear local cart
  clearLocalCart: () => {
    set({ localItems: new Map() });
  },

  // Show cart
  showCart: () => {
    set({ isCartVisible: true });
  },

  // Hide cart
  hideCart: () => {
    set({ isCartVisible: false });
  },

  // Toggle cart visibility
  toggleCart: () => {
    set((state) => ({ isCartVisible: !state.isCartVisible }));
  },

  // Reset all state
  reset: () => {
    set({
      localItems: new Map(),
      productQuantities: new Map(),
      isCartVisible: false,
    });
  },
}));

// ==========================================
// SELECTORS (for convenience)
// ==========================================

export const useLocalCartItemsCount = () => {
  return usePackingCartStore((state) => {
    let count = 0;
    state.localItems.forEach((item) => {
      count += item.quantity;
    });
    return count;
  });
};

export const useLocalCartTotal = () => {
  return usePackingCartStore((state) => {
    let total = 0;
    state.localItems.forEach((item) => {
      total += Number(item.product.price) * item.quantity;
    });
    return total;
  });
};

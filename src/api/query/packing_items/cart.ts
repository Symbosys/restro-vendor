import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  getPackingCart,
  addToPackingCart,
  updatePackingCartItem,
  removePackingCartItem,
  clearPackingCart,
  syncPackingCartPrices,
} from '../../../services/packing.service';

// ==========================================
// QUERY KEYS
// ==========================================

export const PACKING_CART_KEYS = {
  all: ['packingCart'] as const,
  cart: () => [...PACKING_CART_KEYS.all, 'detail'] as const,
};

// ==========================================
// QUERIES
// ==========================================

/**
 * Get the current user's packing cart
 */
export const usePackingCart = () => {
  return useQuery({
    queryKey: PACKING_CART_KEYS.cart(),
    queryFn: getPackingCart,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Add an item to the packing cart
 */
export const useAddToPackingCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToPackingCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

/**
 * Update a cart item's quantity
 */
export const useUpdatePackingCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updatePackingCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

/**
 * Remove an item from the cart
 */
export const useRemovePackingCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removePackingCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

/**
 * Clear the entire cart
 */
export const useClearPackingCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearPackingCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

/**
 * Sync cart prices with current product prices
 */
export const useSyncPackingCartPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncPackingCartPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

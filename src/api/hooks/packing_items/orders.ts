import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  getPackingOrders,
  getPackingOrderById,
  createPackingOrder,
  cancelPackingOrder,
  getPackingOrdersSummary,
  GetOrdersParams,
} from '../../../services/packing.service';
import { PACKING_CART_KEYS } from './cart';

// ==========================================
// QUERY KEYS
// ==========================================

export const PACKING_ORDER_KEYS = {
  all: ['packingOrders'] as const,
  lists: () => [...PACKING_ORDER_KEYS.all, 'list'] as const,
  list: (filters: GetOrdersParams) => [...PACKING_ORDER_KEYS.lists(), filters] as const,
  details: () => [...PACKING_ORDER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PACKING_ORDER_KEYS.details(), id] as const,
  summary: () => [...PACKING_ORDER_KEYS.all, 'summary'] as const,
};

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all packing orders with optional filtering
 */
export const usePackingOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: PACKING_ORDER_KEYS.list(params || {}),
    queryFn: () => getPackingOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get a single packing order by ID
 */
export const usePackingOrder = (orderId: string) => {
  return useQuery({
    queryKey: PACKING_ORDER_KEYS.detail(orderId),
    queryFn: () => getPackingOrderById(orderId),
    enabled: !!orderId,
  });
};

/**
 * Get orders summary/statistics
 */
export const usePackingOrdersSummary = () => {
  return useQuery({
    queryKey: PACKING_ORDER_KEYS.summary(),
    queryFn: getPackingOrdersSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * Create a new order (checkout from cart)
 */
export const useCreatePackingOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryNotes?: string) => createPackingOrder(deliveryNotes),
    onSuccess: () => {
      // Invalidate cart (it will be empty after order)
      queryClient.invalidateQueries({ queryKey: PACKING_CART_KEYS.cart() });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: PACKING_ORDER_KEYS.lists() });
      // Invalidate summary
      queryClient.invalidateQueries({ queryKey: PACKING_ORDER_KEYS.summary() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

/**
 * Cancel an order
 */
export const useCancelPackingOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      cancelPackingOrder(orderId, reason),
    onSuccess: (data, variables) => {
      // Invalidate specific order
      queryClient.invalidateQueries({ queryKey: PACKING_ORDER_KEYS.detail(variables.orderId) });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: PACKING_ORDER_KEYS.lists() });
      // Invalidate summary
      queryClient.invalidateQueries({ queryKey: PACKING_ORDER_KEYS.summary() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is done in service
    },
  });
};

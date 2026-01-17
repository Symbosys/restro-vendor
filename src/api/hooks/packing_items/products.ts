import { useQuery } from '@tanstack/react-query';
import {
  getPackingProductById,
  getPackingProducts,
  GetProductsParams
} from '../../../services/packing.service';

// ==========================================
// QUERY KEYS
// ==========================================

export const PACKING_PRODUCT_KEYS = {
  all: ['packingProducts'] as const,
  lists: () => [...PACKING_PRODUCT_KEYS.all, 'list'] as const,
  list: (filters: GetProductsParams) => [...PACKING_PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PACKING_PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PACKING_PRODUCT_KEYS.details(), id] as const,
};

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all packing products with optional filtering
 */
export const usePackingProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: PACKING_PRODUCT_KEYS.list(params || {}),
    queryFn: () => getPackingProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a single packing product by ID
 */
export const usePackingProduct = (id: string) => {
  return useQuery({
    queryKey: PACKING_PRODUCT_KEYS.detail(id),
    queryFn: () => getPackingProductById(id),
    enabled: !!id,
  });
};

import { useQuery } from '@tanstack/react-query';
import {
  getPackingInstallmentPlans,
  getPackingInstallmentPlanById,
  getPackingInstallments,
  getPackingInstallmentsSummary,
  GetInstallmentPlansParams,
  GetInstallmentsParams,
} from '../../../services/packing.service';

// ==========================================
// QUERY KEYS
// ==========================================

export const PACKING_INSTALLMENT_KEYS = {
  all: ['packingInstallments'] as const,
  plans: () => [...PACKING_INSTALLMENT_KEYS.all, 'plans'] as const,
  plansList: (filters: GetInstallmentPlansParams) => [...PACKING_INSTALLMENT_KEYS.plans(), filters] as const,
  planDetail: (id: string) => [...PACKING_INSTALLMENT_KEYS.plans(), 'detail', id] as const,
  installments: () => [...PACKING_INSTALLMENT_KEYS.all, 'installments'] as const,
  installmentsList: (filters: GetInstallmentsParams) => [...PACKING_INSTALLMENT_KEYS.installments(), filters] as const,
  summary: () => [...PACKING_INSTALLMENT_KEYS.all, 'summary'] as const,
};

// ==========================================
// QUERIES
// ==========================================

/**
 * Get all installment plans with optional filtering
 */
export const usePackingInstallmentPlans = (params?: GetInstallmentPlansParams) => {
  return useQuery({
    queryKey: PACKING_INSTALLMENT_KEYS.plansList(params || {}),
    queryFn: () => getPackingInstallmentPlans(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get a single installment plan by ID
 */
export const usePackingInstallmentPlan = (planId: string) => {
  return useQuery({
    queryKey: PACKING_INSTALLMENT_KEYS.planDetail(planId),
    queryFn: () => getPackingInstallmentPlanById(planId),
    enabled: !!planId,
  });
};

/**
 * Get all installments with optional filtering
 */
export const usePackingInstallments = (params?: GetInstallmentsParams) => {
  return useQuery({
    queryKey: PACKING_INSTALLMENT_KEYS.installmentsList(params || {}),
    queryFn: () => getPackingInstallments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get installments summary with upcoming and due installments
 */
export const usePackingInstallmentsSummary = () => {
  return useQuery({
    queryKey: PACKING_INSTALLMENT_KEYS.summary(),
    queryFn: getPackingInstallmentsSummary,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

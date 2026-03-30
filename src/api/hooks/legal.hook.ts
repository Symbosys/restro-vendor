import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

// ── Types ───────────────────────────────────────────────────

export enum LegalDocumentType {
  PRIVACY_POLICY = "PRIVACY_POLICY",
  TERMS_AND_CONDITIONS = "TERMS_AND_CONDITIONS",
  BUSINESS_AND_PAYMENT = "BUSINESS_AND_PAYMENT",
  VENDOR_AND_PARTNER = "VENDOR_AND_PARTNER",
  CSR_POLICY = "CSR_POLICY",
  REFUND_POLICY = "REFUND_POLICY",
  ABOUT_US = "ABOUT_US",
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  content: string;
  isPublished: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * Public hook to fetch a legal document by its type.
 * Uses the /legal endpoint which is accessible without admin credentials.
 */
export const useGetLegalDocumentByType = (type?: LegalDocumentType) => {
  return useQuery<LegalDocument>({
    queryKey: ["public-legal-doc", type],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LegalDocument>>(`/legal/${type}`);
      return data.data;
    },
    enabled: !!type,
    // Add some caching optimization for app performance
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

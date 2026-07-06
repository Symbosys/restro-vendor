import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

export interface RequestPayoutPayload {
  amount: number | string;
  bankAccountId?: string | number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * Hook to request a vendor payout.
 * Sends a POST request to /vendor/payout/request with the withdrawal details.
 * 
 * @returns A mutation object to handle the request.
 */
export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RequestPayoutPayload) => {
      const { data } = await api.post<ApiResponse<any>>(
        "/vendor/payout/request",
        payload
      );
      return data;
    },
    onSuccess: (response) => {
      // Show success toast to the user
      SuccessMessage(response.message || "Payout requested successfully");

      // Invalidate relevant queries to keep wallet balance and transaction list synced
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
    },
    onError: (error: any) => {
      // Handle and display the error message
      ErrorMessage(error);
    },
  });
};

/**
 * Hook to fetch all payouts for the currently authenticated vendor.
 * Supports filters like status, page, and limit.
 */
export const useVendorPayouts = (filters?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["vendor-payouts", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/vendor/payout/all", {
        params: filters,
      });
      return data.data;
    },
  });
};

/**
 * Hook to fetch details of a specific payout request by its ID.
 */
export const useVendorPayoutById = (id: string | number) => {
  return useQuery({
    queryKey: ["vendor-payout", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/vendor/payout/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook for a vendor to cancel their own pending payout request.
 */
export const useCancelVendorPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await api.post<ApiResponse<any>>(
        `/vendor/payout/${id}/cancel`
      );
      return data;
    },
    onSuccess: (response) => {
      SuccessMessage(response.message || "Payout request cancelled successfully");

      // Refetches current lists and wallet stats
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
    },
    onError: (error: any) => {
      ErrorMessage(error);
    },
  });
};

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { FullOrderDetails, VendorBroadcastApiResponse, VendorBroadcastFilter } from "../../types/order.types";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

/**
 * Hook to fetch orders broadcasted to a vendor with infinite scrolling support.
 * Supports filtering by date range, order status, and broadcast status.
 * 
 * @param filters - Filtering options (startDate, endDate, status, etc.)
 */
export const useVendorBroadcastedOrders = (filters: VendorBroadcastFilter) => {
  return useInfiniteQuery<VendorBroadcastApiResponse>({
    queryKey: ["vendorBroadcastedOrders", filters],
    queryFn: async ({ pageParam = 1 }): Promise<VendorBroadcastApiResponse> => {
      const response = await api.get("/order/vendor/broadcasted-orders", {
        params: {
          ...filters,
          page: pageParam,
        },
      });
      console.log("response.data", response.data);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPage } = lastPage.data;
      if (currentPage < totalPage) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};


/**
 * Fetch a single order's full details by ID or Order Number
 */
export const useOrderDetails = (params: { id?: string; orderNumber?: string }) => {
    return useQuery<FullOrderDetails>({
        queryKey: ['order-details', params],
        queryFn: async () => {
            const { data } = await api.get('/order/details', { params });
            return data.data;
        },
        enabled: !!(params.id || params.orderNumber),
    });
};

export interface AcceptOrderPayload {
  orderId: string;
  notes?: string;
}

export interface AcceptOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    status: string;
  };
}

export interface RejectOrderPayload {
  orderId: string;
  reason?: string;
}

export interface RejectOrderResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Mutation to accept a broadcasted order
 */
export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<AcceptOrderResponse, Error, AcceptOrderPayload>({
    mutationFn: async ({ orderId, notes }) => {
      const { data } = await api.post(`/order/vendor/${orderId}/accept`, { notes });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendorBroadcastedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order-details", { id: variables.orderId }] });
      SuccessMessage("Order accepted successfully");
    },
    onError: (error) => {
      ErrorMessage(error);
    },
  });
};

/**
 * Mutation to reject a broadcasted order
 */
export const useRejectOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<RejectOrderResponse, Error, RejectOrderPayload>({
    mutationFn: async ({ orderId, reason }) => {
      const { data } = await api.post(`/order/vendor/${orderId}/reject`, { reason });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendorBroadcastedOrders"] });
      queryClient.invalidateQueries({ queryKey: ["order-details", { id: variables.orderId }] });
      SuccessMessage("Order rejected successfully");
    },
    onError: (error) => {
      ErrorMessage(error);
    },
  });
};

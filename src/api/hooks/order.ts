import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api";
import { VendorBroadcastApiResponse, VendorBroadcastFilter } from "../../types/order.types";

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

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVendorBroadcastedOrders } from "../services/vendorOrder.service";
import { VendorBroadcastFilter } from "../types/order.types";

export const useVendorBroadcastedOrders = (queryParams: VendorBroadcastFilter) => {
  return useInfiniteQuery({
    queryKey: ["vendorBroadcastedOrders", queryParams],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      fetchVendorBroadcastedOrders({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.currentPage < lastPage.data.totalPage) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
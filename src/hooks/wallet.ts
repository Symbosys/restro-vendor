import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVendorWalletTransactions } from "../services/wallet.service";
import { WalletTransactionQueryParams } from "../types/wallet.type";

export const useVendorWalletTransactions = (
  queryParams: WalletTransactionQueryParams,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: ["vendor-wallet-transactions", queryParams],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      fetchVendorWalletTransactions({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.currentPage < lastPage.data.totalPages) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => page.data),
      pageParams: data.pageParams,
      }),
    
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
  });
};
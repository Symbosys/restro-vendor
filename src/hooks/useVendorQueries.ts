import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVendorsAPI, fetchVendorByIdAPI, updateVendorAPI, FetchVendorsParams } from "../services/vendor.service";
import { ErrorMessage } from "../utils/utils";
import { AxiosError } from "axios";
import { Vendor } from "../types/vendor.types";

// 🔄 Fetch All Vendors
export const useVendorsQuery = (params?: FetchVendorsParams) =>
  useQuery({
    queryKey: ["vendors", params],     // caching + refetching by params
    queryFn: () => fetchVendorsAPI(params),
    staleTime: 1000 * 60 * 5,         // 5 minutes
  });

// 🔄 Fetch Single Vendor
export const useVendorById = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await fetchVendorByIdAPI();
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },                 
    staleTime: 1000 * 60 * 5,         // 5 minutes
    enabled: options?.enabled,
  });


// ✏️ Update Vendor
export const useUpdateVendorMutation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      try {
          const response = await updateVendorAPI(data, id);
          console.log(response.data)
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedVendor) => {
      // Update vendor in list
      // queryClient.invalidateQueries({ queryKey: ["vendors"] });

      // Update selected vendor
      queryClient.setQueryData(["vendor", updatedVendor?.id], updatedVendor);
    },
    onError: (error) => {
      console.error(error);
      ErrorMessage(error as AxiosError | Error);
    },
  });
};
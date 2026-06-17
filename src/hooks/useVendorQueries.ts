import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVendorsAPI, fetchVendorByIdAPI, updateVendorAPI, verifyShopDetailsAPI, FetchVendorsParams, toggleStoreStatusAPI } from "../services/vendor.service";
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

export const useVerifyShopDetailsMutation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      try {
        const response = await verifyShopDetailsAPI(data, id);
        return response; // wait, in service it returns res.data.data directly
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(["vendor", updatedVendor?.id], updatedVendor);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      console.error(error);
    }, // error message is handled in service
  });
};

export const useToggleStoreStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      try {
        const response = await toggleStoreStatusAPI(isOpen);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(["me"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            isOpen: updatedVendor.isOpen
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      console.error(error);
      ErrorMessage(error as AxiosError | Error);
    },
  });
};
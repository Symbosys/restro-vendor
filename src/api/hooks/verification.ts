import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";

export interface UpdateProfileRequest {
  ownerName: string;
  companyName: string;
  email: string;
  ownerEmail: string;
  ownerMobile: string;
  status?: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * Hook to update the vendor's owner profile details.
 * Performs a PUT request to /vendor/:id/profile
 */
export const useUpdateProfileMutation = (vendorId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfileRequest) => {
      const { data } = await api.put<ApiResponse<any>>(
        `/vendor/${vendorId}/profile`,
        payload
      );
      return data.data;
    },
    onSuccess: (data) => {
      SuccessMessage("Profile updated successfully");
      // Update selected vendor in query caches
      queryClient.setQueryData(["me"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...data
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      ErrorMessage(error);
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ErrorMessage, SuccessMessage } from "../../utils/utils";


/**
 * Interface for changing work location request
 */
export interface ChangeWorkLocationRequest {
  cityId: string | number;
  areaId: string | number;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * Hook to change or update the vendor's work location (city and area).
 * 
 * @returns A mutation object to handle the PATCH request to /vendor/change-work-location
 */
export const useChangeWorkLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChangeWorkLocationRequest) => {
      const { data } = await api.patch<ApiResponse<null>>(
        "/vendor/change-work-location",
        payload
      );
      return data;
    },
    onSuccess: (response) => {
      // Show success toast
      SuccessMessage(response.message || "Work location changed successfully");
      
      // Invalidate relevant queries to refresh vendor data across the app
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
    },
    onError: (error: any) => {
      // Show error toast
      ErrorMessage(error);
    },
  });
};

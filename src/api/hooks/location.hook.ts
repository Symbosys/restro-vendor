import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ── Types ───────────────────────────────────────────────────

export interface City {
  id: string | number;
  name: string;
  state?: string;
  country: string;
  isActive: boolean;
  isHiring: boolean;
}

export interface Area {
  id: string | number;
  cityId: string | number;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isHiring: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * Hook to fetch all active cities.
 */
export const useCities = () => {
  return useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<City[]>>("/city/all");
      return data.data;
    },
  });
};

/**
 * Hook to fetch areas belonging to a specific city.
 * 
 * @param cityId - The ID of the city to fetch areas for.
 */
export const useAreasByCity = (cityId?: string | number) => {
  return useQuery<Area[]>({
    queryKey: ["areas", cityId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Area[]>>(`/area/city/${cityId}`);
      return data.data;
    },
    enabled: !!cityId,
  });
};

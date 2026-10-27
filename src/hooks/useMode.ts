import { useQuery } from '@tanstack/react-query';
import { fetchVendorModes } from '../services/mode.service';
import { GetAllModesResponse } from '../types/product.type';

export const useGetVendorModes = () => {
  return useQuery<GetAllModesResponse, Error>({
    queryKey: ['vendor-modes'],
    queryFn: () => fetchVendorModes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export default useGetVendorModes;

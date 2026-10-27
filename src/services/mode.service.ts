import api from '../api/api';
import { GetAllModesResponse } from '../types/product.type';
import { ErrorMessage } from '../utils/utils';
import { AxiosError } from 'axios';

export const fetchVendorModes = async (): Promise<GetAllModesResponse> => {
  try {
    const res = await api.get<GetAllModesResponse>('/vendor/inventory/modes');
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      try {
        const fallbackRes = await api.get('/mode/all');
        return {
          success: true,
          message: 'Modes fetched successfully',
          data: fallbackRes.data?.data || fallbackRes.data || [],
        };
      } catch (fallbackError) {
        ErrorMessage(fallbackError as AxiosError | Error);
        throw fallbackError;
      }
    }
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export default fetchVendorModes;

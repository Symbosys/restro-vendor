import { useState } from 'react';
import { Alert } from 'react-native';
import api from '../api/api';
import { ErrorMessage, SuccessMessage } from '../utils/utils';
import { useAlertStore } from '../store/alert.store';
import { navigate } from '../helpers/navigationService';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';

interface UpdateInventoryPayload {
  categoryIds: string[];
  productIds: string[];
}

export const useUpdateInventory = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showAlert } = useAlertStore();
  const queryClient = useQueryClient();

  const updateInventory = async (payload: UpdateInventoryPayload) => {
    setIsUpdating(true);
    try {
      const response = await api.post('/vendor/inventory/update', payload);
      
      // Invalidate queries to ensure fresh data is fetched
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['all-products'] }),
        queryClient.invalidateQueries({ queryKey: ['all-categories'] })
      ]);

      SuccessMessage(
        response.data.message || 'Inventory updated successfully.',
      );
      return response.data;
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateInventory, isUpdating };
};

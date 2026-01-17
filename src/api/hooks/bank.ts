import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
    createBankAccount,
    CreateBankAccountPayload,
    getAllBankAccounts,
    getBankAccountById,
    updateBankAccount
} from '../../services/bank.service';
import { ErrorMessage } from '../../utils/utils';

export const BANK_KEYS = {
  all: ['banks'] as const,
  lists: () => [...BANK_KEYS.all, 'list'] as const,
  list: (filters: string) => [...BANK_KEYS.lists(), { filters }] as const,
  details: () => [...BANK_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...BANK_KEYS.details(), id] as const,
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: BANK_KEYS.lists(),
    queryFn: getAllBankAccounts,
  });
};

export const useBankAccount = (id: string | number) => {
  return useQuery({
    queryKey: BANK_KEYS.detail(id),
    queryFn: () => getBankAccountById(id),
    enabled: !!id,
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBankAccountPayload) => createBankAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_KEYS.lists() });
    },
    onError: (error: AxiosError | Error) => {
      // Error handling is likely done in service too, but good to have here if needed
    }
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<CreateBankAccountPayload> }) =>
      updateBankAccount(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: BANK_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BANK_KEYS.detail(variables.id) });
    },
    onError: (error: AxiosError | Error) => {
        ErrorMessage(error)
    }
  });
};

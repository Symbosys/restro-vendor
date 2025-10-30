import { create } from 'zustand';
import api from '../api';
import { AxiosError } from 'axios';
import { ToastAndroid } from 'react-native';
import { ErrorMessage } from '../../utils/utils';

export type VendorDocument = {
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  fassaiNumber?: string | null;
  isAadhaarVerified?: boolean;
  isPanVerified?: boolean;
  isFassaiVerified?: boolean;
  reason?: string | null;
};

type VendorDocumentStore = {
  document: VendorDocument | null;
  loading: boolean;
  error: string | null;

  fetchDocument: (id: string) => Promise<void>;
  verifyDocument: (data: Partial<VendorDocument>) => Promise<void>;
};

export const useVendorDocumentStore = create<VendorDocumentStore>((set,) => ({
  document: null,
  loading: false,
  error: null,

  fetchDocument: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/vendor/document/${id}`);
      set({ document: res.data.data, loading: false });
      console.log(res.data)
    } catch (err: unknown) {
      ErrorMessage(err as AxiosError | Error);
      throw err
    }
  },

  verifyDocument: async (data: Partial<VendorDocument>) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/vendor/document/verify', data);
      set({ document: res.data.data, loading: false });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
       ToastAndroid.show(err.response?.data?.message || 'Failed to verify document', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      }
      throw err; // rethrow if you want component to handle Toast/alert
    }
  },
}));

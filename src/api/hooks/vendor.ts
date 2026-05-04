import { create } from "zustand";
import { AxiosError } from "axios";
import api from "../api"; // your Axios instance
import { ToastAndroid } from "react-native";

export type VendorWorkLocation = {
  id: bigint | number;
  city: {
    id: bigint | number;
    name: string;
  };
  area: {
    id: bigint | number;
    name: string;
  };
  vendorId: bigint | number;
};

export type Vendor = {
  id: bigint | number;
  ownerName?: string | null;
  companyName?: string | null;
  email?: string | null;
  mobile: string;
  isActive: boolean;
  status: string;
  rejectReason?: string | null;
  blockReason?: string | null;
  isApproved: boolean;
  isProfileFullyCompleted: boolean;
  profileCompletion?: Record<string, boolean> | null;
  createdAt: string;
  updatedAt: string;
  vendorWorkLocations: VendorWorkLocation;
};

type VendorStore = {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  loading: boolean;
  loadingAction: "fetchAll" | "fetchOne" | "update" | null;
  error: string | null;
  pagination: {
    totalVendors: number;
    totalPages: number;
    currentPage: number;
    count: number;
  } | null;

  // Actions
  fetchAllVendors: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    status?: string;
    isApproved?: boolean;
  }) => Promise<void>;

  fetchVendorById: (id?: string | number) => Promise<void>;

  updateVendor: (data: Partial<Vendor>) => Promise<any>;
};

export const useVendorStore = create<VendorStore>((set, get) => ({
  vendors: [],
  selectedVendor: null,
  loading: false,
  loadingAction: null,
  error: null,
  pagination: null,

  // ✅ Fetch all vendors
  fetchAllVendors: async (params = {}) => {
    try {
      set({ loading: true, loadingAction: "fetchAll", error: null });

      const res = await api.get("/vendor/all", { params });

      if (res.data.success) {
        ToastAndroid.show(res.data.message || "Vendors fetched successfully", ToastAndroid.SHORT);
      }

      const { vendors, totalVendors, totalPages, currentPage, count } = res.data.data;

      set({
        vendors,
        pagination: { totalVendors, totalPages, currentPage, count },
        loading: false,
        loadingAction: null,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        ToastAndroid.show(
          error.response?.data.message || 'Failed to fetch shops',
          ToastAndroid.LONG,
        );
      } else {
        ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
      }
    }
  },

  // ✅ Fetch single vendor (by ID or current vendor)
  fetchVendorById: async (id) => {
    try {
      set({ loading: true, loadingAction: "fetchOne", error: null });

      const res = await api.get(`/vendor/me?id=${id}`);

      set({
        selectedVendor: res.data.data,
        loading: false,
        loadingAction: null,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        ToastAndroid.show(
          error.response?.data.message || 'Failed to fetch shops',
          ToastAndroid.LONG,
        );
      } else {
        ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
      }
    }
  },

  // ✅ Update vendor info
  updateVendor: async (data) => {
    try {
      set({ loading: true, loadingAction: "update", error: null });

      const res = await api.patch("/vendor/update", data);
      if (res.data.success) {
        ToastAndroid.show(res.data.message || "Vendor updated successfully", ToastAndroid.SHORT);
      }

      // Update local selectedVendor and vendors list
      const updatedVendor = res.data.data;
      set({
        selectedVendor: updatedVendor,
        vendors: get().vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)),
        loading: false,
        loadingAction: null,
      });

      return res

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        ToastAndroid.show(err.response?.data?.message || "Failed to update vendor", ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("Something went wrong", ToastAndroid.SHORT);
      }
      throw err;
    }
  },
}));

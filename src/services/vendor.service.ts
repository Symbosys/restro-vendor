import { ToastAndroid } from "react-native";
import api from "../api/api";
import type { Vendor, UpdateVendorPayload } from "../types/vendor.types";
import { AxiosError } from "axios";
import { ErrorMessage, SuccessMessage } from "../utils/utils";

/**
 * Fetch a single vendor by ID
 */
export async function getVendorById(id: number | string): Promise<Vendor> {
  const res = await api.get(`/vendor/me?id=${id}`);
  return res.data.data; // matches your SuccessResponse format
}

/**
 * Get all vendors
 */
export async function getAllVendors(): Promise<Vendor[]> {
  const res = await api.get("/vendor/all");
  return res.data.data;
}

/**
 * Update a vendor by ID
 */
export async function updateVendor(id: number | string, payload: UpdateVendorPayload): Promise<Vendor> {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const res = await api.put(`/vendor/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
}






export type FetchVendorsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  status?: string;
  isApproved?: boolean;
};

export const fetchVendorsAPI = async (params?: FetchVendorsParams) => {
  try {
    const res = await api.get("/vendor/all", { params });

    if (res.data.success) {
      ToastAndroid.show(res.data.message || "Vendors fetched", ToastAndroid.SHORT);
    }

    return res.data.data; // vendors, pagination etc.
  } catch (error) {
    ErrorMessage(error as AxiosError | Error)
    throw error;
  }
};

interface VendorData {
  data: Vendor;
}

export const fetchVendorByIdAPI = async (id?: string | number): Promise<VendorData> => {
  try {
    const res = await api.get(`/vendor/me?id=${id}`);
    console.log('res', res)
    return res.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error)
    throw error;
  }
};

export const updateVendorAPI = async (data: Partial<Vendor>, id: string | number) => {
  try {
    const res = await api.put(`/vendor/${id}`, data);

    console.log('res', res)
    if (res.data.success) {
      SuccessMessage(res.data.message || "Vendor updated")
    }

    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error)
    throw error;
  }
};

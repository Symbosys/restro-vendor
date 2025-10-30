import api from "../api/api";
import type { Vendor, UpdateVendorPayload } from "../types/vendor.types";

/**
 * Fetch a single vendor by ID
 */
export async function getVendorById(id: number | string): Promise<Vendor> {
  const res = await api.get(`/vendor/${id}`);
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

import api from "../api/api";
import { VendorBroadcastApiResponse, VendorBroadcastFilter } from "../types/order.types";

export const fetchVendorBroadcastedOrders = async (
  params: VendorBroadcastFilter
): Promise<VendorBroadcastApiResponse> => {
  const res = await api.get("/order/vendor/broadcasted-orders", { params });
  return res.data;
};
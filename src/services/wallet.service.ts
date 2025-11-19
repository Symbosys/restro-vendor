import api from "../api/api";
import { WalletApiResponse, WalletTransactionQueryParams } from "../types/wallet.type";

export const fetchVendorWalletTransactions = async (
  params: WalletTransactionQueryParams
): Promise<WalletApiResponse> => {
  const res = await api.get("/vendor/wallet/all", { params });
  return res.data;
};
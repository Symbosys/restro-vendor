import api from "../api/api";
import { SuccessMessage, ErrorMessage } from "../utils/utils";
import { AxiosError } from "axios";

export interface CreateBankAccountPayload {
  vendorId: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch?: string;
}



export const createBankAccount = async (payload: CreateBankAccountPayload) => {
  try {
    const res = await api.post("/vendor/bank/create", payload);
    if (res.data.success) {
      SuccessMessage(res.data.message || "Bank account added successfully");
    }
    return res.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getAllBankAccounts = async () => {
  try {
    const res = await api.get(`/vendor/bank/all`);
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const updateBankAccount = async (bankId: string | number, payload: Partial<CreateBankAccountPayload>) => {
  try {
    const res = await api.put(`/vendor/bank/update/${bankId}`, payload);
    if (res.data.success) {
      SuccessMessage(res.data.message || "Bank account updated successfully");
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getBankAccountById = async (bankId: string | number) => {
  try {
    const res = await api.get(`/vendor/bank/detail/${bankId}`);
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

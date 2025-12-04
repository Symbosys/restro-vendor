import { AxiosError } from "axios";
import api from "../api/api";
import { GetAllProductsParams, GetAllProductsResponse } from "../types/product.type";
import { ErrorMessage } from "../utils/utils";

export const getAllProducts = async (
): Promise<GetAllProductsResponse> => {
  try {
    const response = await api.get<GetAllProductsResponse>(
      "vendor/inventory/products",
    );
    return response.data;
  } catch (error) {
      ErrorMessage(error as AxiosError | Error)
    throw error;
  }
};

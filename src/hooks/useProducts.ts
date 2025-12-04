import { useQuery } from "@tanstack/react-query"
import { getAllProducts } from "../services/product.service"
import { GetAllProductsParams, GetAllProductsResponse } from "../types/product.type"

export const useGetAllProducts = () => {
    return useQuery<GetAllProductsResponse, Error>({
        queryKey: ['all-products'],
        queryFn: () => getAllProducts(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}
import { useQuery } from "@tanstack/react-query"
import fetchCategories from "../services/category.service"
import { GetAllCategoriesResponse } from "../types/product.type"

export const useGetAllCategories = () => {
    return useQuery<GetAllCategoriesResponse, Error>({
        queryKey: ['all-categories'],
        queryFn: () => fetchCategories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}
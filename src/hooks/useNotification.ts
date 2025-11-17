import { useInfiniteQuery } from "@tanstack/react-query";
import { NotificationQueryParams } from "../types/notification.type";
import { fetchNotification } from "../services/notification.service";

export const useNotification = (queryParams: NotificationQueryParams) => {
    return useInfiniteQuery({
        queryKey: ['notifications', queryParams],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1, }) => fetchNotification({ ...queryParams, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.data.currentPage < lastPage.data.totalPages) {
                return lastPage.data.currentPage + 1;
            }
            return undefined;
        },
    })
}
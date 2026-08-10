import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationQueryParams } from "../types/notification.type";
import { fetchNotification, markNotificationAsRead } from "../services/notification.service";

export const useNotification = (queryParams: NotificationQueryParams, options?: { enabled?: boolean }) => {
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
        enabled: options?.enabled,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// now in delivery app create a screen where render all the notifications of delivery partner and when click on any notification mark that notification as read register the screen in stack and give a option in account/profile tab to navigate to notification screen implement this else don't change anything be carefull make no mistake at any cost
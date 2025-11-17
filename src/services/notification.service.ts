import api from "../api/api";
import { NotificationApiResponse, NotificationQueryParams } from "../types/notification.type";

export const fetchNotification = async (params: NotificationQueryParams): Promise<NotificationApiResponse> => {
    const res = await api.get("/notification/all", { params });
    return res.data;
}
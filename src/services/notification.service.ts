import api from "../api/api";
import { NotificationApiResponse, NotificationQueryParams } from "../types/notification.type";
import { ErrorMessage } from "../utils/utils";
import { AxiosError } from "axios";

export const fetchNotification = async (params: NotificationQueryParams): Promise<NotificationApiResponse> => {
    try {
        const res = await api.get("/notification/all", { params });
        return res.data;
    } catch (error) {
        ErrorMessage(error as AxiosError | Error)
        throw error;
    }
}
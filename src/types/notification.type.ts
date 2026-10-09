import { formatDistanceToNow } from 'date-fns';
import { COLORS } from '../theme/color';

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "PROMOTION"
  | "NEW_MENU_ITEM"
  | "VENDOR_MESSAGE"
  | "USER_MESSAGE"
  | "DELIVERY_ASSIGNMENT"
  | "VENDOR_ORDER_REQUEST"
  | "DELIVERY_ORDER_REQUEST"
  | "ORDER_REJECTED"
  | "PAYMENT_RECEIVED"
  | "PAYOUT_PROCESSED"
  | "ACCOUNT_ALERT"
  | "SYSTEM";

export type RecipientType = "USER" | "VENDOR" | "DELIVERY_PARTNER";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  deepLink?: string;
  isRead: boolean;
  readAt?: string | null;
  sentAt: string;
  expiresAt?: string | null;
  channel: string;
  priority: string;
  order?: {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}


export interface NotificationQueryParams {
  recipientType: RecipientType;
  recipientId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  date?: string;
}

interface notificationData {
  totalNotifications: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  count: number;
  notifications: NotificationItem[];
}

export interface NotificationApiResponse {
  data: notificationData;
}


// Older one
export interface FrontendNotification {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  note: string;
  time: string;
  isUnread: boolean;
  type: 'All' | 'Orders' | 'Payments' | 'System';
  data?: Record<string, any>;
  deepLink?: string;
}

// export interface NotificationQueryParams {
//   recipientType: RecipientType;
//   recipientId: string;
//   page?: number;
//   limit?: number;
//   isRead?: boolean;
//   type?: NotificationType;
//   date?: string;
// }




// Mapper functions
export const mapBackendTypeToFrontend = (backendType: string): 'Orders' | 'Payments' | 'System' => {
  if (backendType.includes('ORDER')) {
    return 'Orders';
  }
  if (backendType === 'PAYMENT_RECEIVED' || backendType === 'PAYOUT_PROCESSED') {
    return 'Payments';
  }
  return 'System';
};

export const getIcon = (backendType: string): string => {
  switch (backendType) {
    case 'NEW_ORDER':
    case 'ORDER_STATUS_UPDATE':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return 'shopping-cart';
    case 'PAYMENT_RECEIVED':
    case 'PAYOUT_PROCESSED':
      return 'payments';
    case 'ACCOUNT_ALERT':
    case 'SYSTEM':
      return 'priority-high';
    default:
      return 'settings';
  }
};

export const getIconColor = (backendType: string): string => {
  switch (backendType) {
    case 'NEW_ORDER':
    case 'ORDER_STATUS_UPDATE':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return COLORS.primary;
    case 'PAYMENT_RECEIVED':
    case 'PAYOUT_PROCESSED':
      return '#16a34a';
    case 'ACCOUNT_ALERT':
    case 'SYSTEM':
      return backendType === 'ACCOUNT_ALERT' ? COLORS.highlight : '#3b82f6';
    default:
      return '#3b82f6';
  }
};



export const mapToFrontendNotification = (backend: NotificationItem): FrontendNotification => ({
  id: Number(backend.id),
  icon: getIcon(backend.type),
  iconColor: getIconColor(backend.type),
  title: backend.title,
  note: backend.body,
  time: formatDistanceToNow(new Date(backend.sentAt), { addSuffix: true }),
  isUnread: !backend.isRead,
  type: mapBackendTypeToFrontend(backend.type),
  data: backend.data,
  deepLink: backend.deepLink,
});
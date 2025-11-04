
import api from '../api/api';
import { BroadcastStatus, OrderStatus } from '../types/order.types';

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  broadcastStatus?: BroadcastStatus;
  date?: string;
}

export interface BroadcastedOrder {
  id: string; // Broadcast ID as string for RN
  orderId: string;
  vendorId: string;
  status: BroadcastStatus;
  notifiedAt: string; // ISO string
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    user: {
      id: string;
      name: string;
      mobile: string;
    };
    address: {
      mainAddress: string;
      completeAddress?: string;
      receiverName?: string;
      latitude?: number;
      longitude?: number;
    };
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
      };
    }>;
    totalAmount?: string; // Decimal as string from JSON
    // Add other fields if needed
  };
  // Add other broadcast fields if needed
}

export interface OrdersResponse {
  orders: BroadcastedOrder[];
  totalOrder: number;
  totalPage: number;
  currentPage: number;
  count: number;
}

export const getOrders = async (params: GetOrdersParams): Promise<OrdersResponse> => {
  const response = await api.get('/vendor/order/all', { params });
  return response.data.data; // Assuming SuccessResponse wraps data in .data
};

export const acceptOrder = async (orderId: string, notes?: string): Promise<any> => {
  const response = await api.post(`/vendor/order/accept-order/${orderId}`, { notes });
  return response.data.data.order;
};

export const markReady = async (orderId: string): Promise<any> => {
  const response = await api.post(`/vendor/order/mark-ready/${orderId}`);
  return response.data.data.order;
};
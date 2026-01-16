import api from "../api/api";
import { SuccessMessage, ErrorMessage } from "../utils/utils";
import { AxiosError } from "axios";

// ==========================================
// TYPES
// ==========================================

export interface PackingProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  quantityPerPack: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  badge: string | null;
  badgeColor: string | null;
  sku: string | null;
  stockQuantity: number;
  lowStockAlert: number;
  isAvailable: boolean;
  isActive: boolean;
  weight: string | null;
  dimensions: string | null;
  material: string | null;
  displayOrder: number;
  image: { public_id: string; url: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackingCartItem {
  id: string;
  cartId: string;
  productId: string;
  product: PackingProduct;
  quantity: number;
  priceAtAdd: string;
  createdAt: string;
  updatedAt: string;
  currentPrice?: string;
  priceChanged?: boolean;
  priceDifference?: number;
}

export interface PackingCart {
  id: string;
  vendorId: string;
  items: PackingCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemsCount: number;
  subtotal: number;
  hasPriceChanges: boolean;
}

export interface PackingOrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: PackingProduct;
  quantity: number;
  pricePerUnit: string;
  totalPrice: string;
  productSnapshot: {
    id: string;
    title: string;
    description: string;
    price: number;
    quantityPerPack: number;
    material: string | null;
    image: { public_id: string; url: string } | null;
  };
}

export interface PackingInstallment {
  id: string;
  planId: string;
  installmentNumber: number;
  amount: string;
  status: 'PENDING' | 'UPCOMING' | 'DUE' | 'PROCESSING' | 'PAID' | 'OVERDUE' | 'FAILED' | 'CANCELLED';
  dueDate: string;
  scheduledDate: string;
  paidDate: string | null;
  attemptCount: number;
  failureReason: string | null;
}

export interface PackingInstallmentPlan {
  id: string;
  orderId: string;
  vendorId: string;
  totalAmount: string;
  installmentCount: number;
  installmentAmount: string;
  paidInstallments: number;
  remainingAmount: string;
  isCompleted: boolean;
  isCancelled: boolean;
  installments: PackingInstallment[];
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount?: string;
  };
}

export interface PackingOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  totalAmount: string;
  itemsCount: number;
  deliveryNotes: string | null;
  paymentMethod: string;
  isPaid: boolean;
  paidAmount: string;
  pendingAmount: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: PackingOrderItem[];
  installmentPlan: PackingInstallmentPlan | null;
}

export interface OrdersSummary {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  pendingPayment: number;
}

export interface InstallmentsSummary {
  plans: {
    total: number;
    active: number;
    completed: number;
  };
  installments: {
    total: number;
    paid: number;
    overdue: number;
  };
  pendingAmount: number;
}

// ==========================================
// PACKING PRODUCTS SERVICE
// ==========================================

export interface GetProductsParams {
  search?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'title' | 'displayOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const getPackingProducts = async (params?: GetProductsParams) => {
  try {
    const res = await api.get('/packing/products', { params });
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingProductById = async (id: string) => {
  try {
    const res = await api.get(`/packing/products/${id}`);
    return res.data.data.product;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

// ==========================================
// PACKING CART SERVICE
// ==========================================

export const getPackingCart = async (): Promise<{ cart: PackingCart; summary: CartSummary }> => {
  try {
    const res = await api.get('/packing/cart');
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const addToPackingCart = async (productId: string, quantity: number) => {
  try {
    const res = await api.post('/packing/cart/items', { productId, quantity: quantity.toString() });
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Item added to cart');
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const updatePackingCartItem = async (itemId: string, quantity: number) => {
  try {
    const res = await api.put(`/packing/cart/items/${itemId}`, { quantity: quantity.toString() });
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Cart updated');
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const removePackingCartItem = async (itemId: string) => {
  try {
    const res = await api.delete(`/packing/cart/items/${itemId}`);
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Item removed from cart');
    }
    return res.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const clearPackingCart = async () => {
  try {
    const res = await api.delete('/packing/cart');
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Cart cleared');
    }
    return res.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const syncPackingCartPrices = async () => {
  try {
    const res = await api.post('/packing/cart/sync-prices');
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Prices synced');
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

// ==========================================
// PACKING ORDERS SERVICE
// ==========================================

export interface GetOrdersParams {
  status?: string;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export const getPackingOrders = async (params?: GetOrdersParams) => {
  try {
    const res = await api.get('/packing/orders', { params });
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingOrderById = async (orderId: string) => {
  try {
    const res = await api.get(`/packing/orders/${orderId}`);
    return res.data.data.order;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const createPackingOrder = async (deliveryNotes?: string) => {
  try {
    const res = await api.post('/packing/orders', { deliveryNotes });
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Order placed successfully');
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const cancelPackingOrder = async (orderId: string, reason: string) => {
  try {
    const res = await api.post(`/packing/orders/${orderId}/cancel`, { reason });
    if (res.data.success) {
      SuccessMessage(res.data.message || 'Order cancelled');
    }
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingOrdersSummary = async (): Promise<{ summary: OrdersSummary }> => {
  try {
    const res = await api.get('/packing/orders/summary');
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

// ==========================================
// PACKING INSTALLMENTS SERVICE
// ==========================================

export interface GetInstallmentPlansParams {
  isCompleted?: boolean;
  isCancelled?: boolean;
  page?: number;
  limit?: number;
}

export interface GetInstallmentsParams {
  status?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const getPackingInstallmentPlans = async (params?: GetInstallmentPlansParams) => {
  try {
    const res = await api.get('/packing/installments/plans', { params });
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingInstallmentPlanById = async (planId: string) => {
  try {
    const res = await api.get(`/packing/installments/plans/${planId}`);
    return res.data.data.plan;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingInstallments = async (params?: GetInstallmentsParams) => {
  try {
    const res = await api.get('/packing/installments', { params });
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

export const getPackingInstallmentsSummary = async (): Promise<{
  summary: InstallmentsSummary;
  upcomingInstallments: PackingInstallment[];
  dueInstallments: PackingInstallment[];
}> => {
  try {
    const res = await api.get('/packing/installments/summary');
    return res.data.data;
  } catch (error) {
    ErrorMessage(error as AxiosError | Error);
    throw error;
  }
};

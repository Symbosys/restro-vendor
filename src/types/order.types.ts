// types/vendorOrder.type.ts
export enum BroadcastStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  MISSED = "MISSED",
}

export enum OrderStatus {
  PLACED = "PLACED",
  VENDOR_PENDING = "VENDOR_PENDING",
  VENDOR_ACCEPTED = "VENDOR_ACCEPTED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  DELIVERY_PENDING = "DELIVERY_PENDING",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  DISPUTED = "DISPUTED",
}

export interface ProductSnapshot {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  weight?: number;
  pieces?: number;
  images: {id: string; url: string, public_id: string}[]; // Assuming array of image URLs from Json
}

export interface OrderItemSnapshot {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  product: ProductSnapshot;
}

export interface OrderTimestampsSnapshot {
  id: string;
  orderId: string;
  placedAt: string;
  vendorNotifiedAt?: string;
  vendorAssignedAt?: string;
  confirmedAt?: string;
  readyAt?: string;
  deliveryNotifiedAt?: string;
  deliveryAssignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSnapshot {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  itemTotal: number;
  gstOnItemTotal: number;
  deliveryFee: number;
  platformFee: number;
  gstOnPlatform: number;
  packingFee: number;
  gstOnPackingFee: number;
  tipAmount?: number;
  surcharge?: number;
  discountAmount: number;
  paidAmount?: number;
  subtotal: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: string; // Assuming PaymentStatus as string
  deliveryStatus: string; // Assuming DeliveryStatus as string
  notes?: string;
  source: string; // Assuming OrderSource as string
  paymentMethod: string; // Assuming PaymentMethod as string
  paymentReference?: string;
  refundReference?: string;
  cancelReason?: string;
  disputeDetails?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSnapshot[];
  timestamps: OrderTimestampsSnapshot;
}

export interface VendorBroadcastItem {
  id: string;
  orderId: string;
  vendorId: string;
  notifiedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  status: BroadcastStatus;
  order: OrderSnapshot;
}

export interface VendorBroadcastFilter {
  date?: string; // ISO date string, e.g., "2025-11-17"
  broadcastStatus?: BroadcastStatus;
  orderStatus?: OrderStatus;
  limit?: number;
  page?: number;
}

interface VendorBroadcastData {
  broadcasts: VendorBroadcastItem[];
  totalBroadcasts: number;
  totalPage: number;
  currentPage: number;
  count: number;
}

export interface VendorBroadcastApiResponse {
  data: VendorBroadcastData;
}
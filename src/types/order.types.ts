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

export interface AddressSnapshot {
  id: string;
  userId: string;
  type: string;
  mainAddress: string;
  completeAddress: string;
  receiverName: string;
  receiverContact: string;
  landMark?: string;
  floor?: string;
  city?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
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
  address?: AddressSnapshot;
  tracking?: OrderTrackingSnapshot[];
  payments?: OrderPaymentSnapshot;
  orderVendorAssignments?: OrderVendorAssignmentSnapshot;
  orderDeliveryAssignment?: OrderDeliveryAssignmentSnapshot;
  vendorBroadcasts?: VendorBroadcastItem[];
}

export interface OrderTrackingSnapshot {
  id: string;
  orderId: string;
  eventType: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  eta?: number | null;
  notes?: string | null;
  executedBy: string;
  timestamp: string;
}

export interface OrderPaymentSnapshot {
  id: string;
  entityType: string;
  entityId: string;
  orderId: string;
  userId: string;
  vendorId?: string | null;
  partnerId?: string | null;
  direction: string;
  amount: number | any;
  currency: string;
  method: string;
  gateway: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  referenceId: string;
  description?: string | null;
  metadata?: any;
  status: string;
  initiatedAt: string;
  authorizedAt?: string | null;
  capturedAt?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  refundReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderVendorAssignmentSnapshot {
  id: string;
  orderId: string;
  amount: number | any;
  vendorId?: string | null;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  status: string;
  estimatedPrepTimeMinutes?: number | null;
  actualPrepTimeMinutes?: number | null;
  pickupOtp?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDeliveryAssignmentSnapshot {
  id: string;
  orderId: string;
  deliveryPartnerId?: string | null;
  assignedAt?: string | null;
  status: string;
  deliveryPartner?: {
    id: string;
    name: string;
    mobile: string;
  };
}

export interface FullOrderDetails extends OrderSnapshot {}

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
  startDate?: string; // ISO date string, e.g., "2025-11-17T00:00:00Z"
  endDate?: string; // ISO date string, e.g., "2025-11-18T23:59:59Z"
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
  success: boolean;
  message: string;
  data: VendorBroadcastData;
}
export type OrderStatus =
  | "PLACED"
  | "VENDOR_PENDING"
  | "VENDOR_ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "DELIVERY_PENDING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "DISPUTED"
    ;


    export type BroadcastStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "MISSED"
    ;
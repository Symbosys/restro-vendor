import { VendorWorkLocation } from "../api/hooks/vendor";

export type VendorStatus =
  | "NEW"
  | "PROFILE_COMPLETION_NOT_FILLED"
  | "DOCUMENTS_NOT_VERIFIED"
  | "SHOP_DETAILS_NOT_FILLED"
  | "SHOP_IMAGES_NOT_UPLOADED"
  | "PRODUCT_SELECTION_NOT_DONE"
  | "BANK_ACCOUNT_NOT_ADDED"
  | "SIGNATURE_NOT_UPLOADED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "BLOCKED";

export interface Vendor {
  id: bigint;
  ownerName?: string;
  companyName?: string;
  email?: string;
  ownerEmail?: string;
  ownerMobile?: string;
  signature?: { public_id: string; url: string };
  mobile: string;
  isActive: boolean;
  status: VendorStatus;
  rejectReason?: string;
  blockReason?: string;
  isApproved: boolean;
  shopName?: string;
  mainAddress?: string;
  completeAddress?: string;
  contactNumber?: string;
  floor?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
  areaName?: string;
  countryCode?: string;
  stateCode?: string;
  isOpen: boolean | string;
  images?: { public_id: string; url: string };
  fcmToken?: string;
  vendorOwnerId?: string | number | null;
  vendorOwner?: {
    id: string | number;
    name: string;
    email?: string;
    mobile?: string;
    fssaiLicenceNumber?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  vendorWorkLocations: VendorWorkLocation;
}


export interface UpdateVendorPayload extends Partial<Vendor> {
  image?: File;
}

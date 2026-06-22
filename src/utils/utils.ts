import { AxiosError } from "axios";
import { ToastAndroid } from "react-native";

type DecimalObj = {s: number; e: number; d: number[]};

export function parseToDecimal(
  price: number | string | DecimalObj | null | undefined,
): number {
  if (!price) return 0;
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return parseFloat(price);

  const high = (price as DecimalObj).d?.[0] ?? 0;
  const low = (price as DecimalObj).d?.[1] ?? 0;
  return (high + low / 1e7) * ((price as DecimalObj).s ?? 1);
}

export function getVendorOrderTotal(order: any): number {
  if (!order || !order.items) return 0;
  return order.items.reduce((sum: number, item: any) => {
    const price = parseToDecimal(item.product?.vendorPrice) || parseToDecimal(item.unitPrice) || 0;
    return sum + price * Number(item.quantity || 0);
  }, 0);
}

/**
 * Calculates discount percentage based on market and selling price
 * @param marketPrice - Market price (number or DecimalObj)
 * @param sellingPrice - Selling price (number or DecimalObj)
 * @returns number - Discount percentage (rounded to nearest integer)
 */
export function calculateDiscount(
  marketPrice: number | DecimalObj | null | undefined,
  sellingPrice: number | DecimalObj | null | undefined
): number {
  const market = parseToDecimal(marketPrice);
  const selling = parseToDecimal(sellingPrice);

  if (market <= 0) return 0; // avoid division by zero or invalid data
  const discount = ((market - selling) / market) * 100;

  return Math.round(discount); // round to nearest integer (e.g., 25%)
}



export const ErrorMessage = (error: AxiosError | Error) => {
  if (error instanceof AxiosError) {
    ToastAndroid.show(error.response?.data?.message || 'Something went wrong', ToastAndroid.LONG);
  } else {
    ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
  }
}

export const SuccessMessage = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
}

interface Coordinates {
  latitude: any;
  longitude: any;
}

export const CalculateDistance = (from: Coordinates, to: Coordinates): number => {
  const lat1 = parseToDecimal(from?.latitude);
  const lon1 = parseToDecimal(from?.longitude);
  const lat2 = parseToDecimal(to?.latitude);
  const lon2 = parseToDecimal(to?.longitude);

  if (lat1 === 0 && lon1 === 0) return 0;
  if (lat2 === 0 && lon2 === 0) return 0;

  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180); 
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in km 
  return distance;
}
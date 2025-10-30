import { AxiosError } from "axios";
import { ToastAndroid } from "react-native";

type DecimalObj = {s: number; e: number; d: number[]};

export function parseToDecimal(
  price: number | DecimalObj | null | undefined,
): number {
  if (!price) return 0;
  if (typeof price === 'number') return price;

  const high = price.d?.[0] ?? 0;
  const low = price.d?.[1] ?? 0;
  return (high + low / 1e7) * (price.s ?? 1);
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
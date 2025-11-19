export type TransactionType = 
  | "CREDIT"
  | "DEBIT"
  | "REFUND"
  | "PAYOUT";

export type TransactionStatus = 
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
    | "REFUNDED";
  



    export interface WalletTransactionItem {
  id: string;
  amount: string; // Decimal comes as string from backend
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  referenceId: string | null;
  orderId: string | null;
  bankAccountId: string | null;
  initiatedBy: string | null;
  createdAt: string;
}

export interface WalletTransactionQueryParams {
  vendorId?: string;
  page?: number;
  limit?: number;
  transactionType?: TransactionType;
}

interface WalletData {
  totalBalance: string;
  currency: string;
  transactions: WalletTransactionItem[];
  totalTransactions: number;
  totalPages: number;
  currentPage: number;
  count: number;
}

export interface WalletApiResponse {
  success: boolean;
  message: string;
  data: WalletData;
}
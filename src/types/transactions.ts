import type { ListParams, PaginatedResponse } from './common';

/**
 * Transaction entity
 */
export interface Transaction {
  id: string;
  customerId: string;
  appId?: string;
  subscriptionId?: string;
  chargeId?: string;
  amount: number;
  currencyCode: string;
  type: string;
  status: string;
  description?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string;
  };
}

/**
 * Parameters for listing transactions
 */
export interface TransactionListParams extends ListParams {
  customerId?: string;
  appId?: string;
  subscriptionId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Response from listing transactions
 */
export interface TransactionListResponse extends PaginatedResponse {
  transactions: Transaction[];
}

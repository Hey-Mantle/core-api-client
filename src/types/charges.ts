import type { ListParams, PaginatedResponse } from './common';

/**
 * Charge entity
 */
export interface Charge {
  id: string;
  customerId: string;
  appId?: string;
  subscriptionId?: string;
  amount: number;
  currencyCode: string;
  status: string;
  type?: string;
  description?: string;
  billedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string;
  };
}

/**
 * Parameters for listing charges
 */
export interface ChargeListParams extends ListParams {
  groupBy?: 'customer';
  customerId?: string;
  appId?: string;
  subscriptionId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Response from listing charges
 */
export interface ChargeListResponse extends PaginatedResponse {
  charges: Charge[];
}

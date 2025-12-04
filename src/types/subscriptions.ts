import type { ListParams, PaginatedResponse } from './common';

/**
 * Subscription entity
 */
export interface Subscription {
  id: string;
  customerId: string;
  appId: string;
  planId?: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd?: boolean;
  trialStart?: string;
  trialEnd?: string;
  amount?: number;
  currencyCode?: string;
  interval?: string;
  test?: boolean;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    name: string;
    amount: number;
    currencyCode: string;
    interval: string;
  };
  customer?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * Parameters for listing subscriptions
 */
export interface SubscriptionListParams extends ListParams {
  appId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  ids?: string[];
  active?: boolean;
}

/**
 * Response from listing subscriptions
 */
export interface SubscriptionListResponse extends PaginatedResponse {
  subscriptions: Subscription[];
}

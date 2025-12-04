import type { ListParams, PaginatedResponse } from './common';

/**
 * Usage event entity
 */
export interface UsageEvent {
  id: string;
  appId: string;
  customerId: string;
  eventName: string;
  eventId?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
  billingStatus?: string;
  countryCode?: string;
  createdAt: string;
}

/**
 * Parameters for listing usage events
 */
export interface UsageEventListParams extends ListParams {
  appId?: string;
  customerId?: string;
  eventName?: string;
  propertiesFilters?: Record<string, unknown>;
  billingStatus?: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Response from listing usage events
 */
export interface UsageEventListResponse extends PaginatedResponse {
  usageEvents: UsageEvent[];
  events?: UsageEvent[];
}

/**
 * Single usage event for creation
 */
export interface UsageEventCreateData {
  timestamp?: string;
  eventName: string;
  eventId?: string;
  customerId: string;
  appId: string;
  properties?: Record<string, unknown>;
}

/**
 * Parameters for creating usage event(s)
 */
export interface UsageEventCreateParams {
  /** Single event data */
  timestamp?: string;
  eventName?: string;
  eventId?: string;
  customerId?: string;
  appId?: string;
  properties?: Record<string, unknown>;
  private?: boolean;
  /** Multiple events */
  events?: UsageEventCreateData[];
}

/**
 * Response from creating usage events
 */
export interface UsageEventCreateResponse {
  success: boolean;
}

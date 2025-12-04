import type { ListParams, PaginatedResponse } from './common';

/**
 * App entity
 */
export interface App {
  id: string;
  name: string;
  slug?: string;
  platform?: string;
  description?: string;
  iconUrl?: string;
  listingUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing apps
 */
export interface AppListParams {
  minUpdatedAt?: string;
  maxUpdatedAt?: string;
}

/**
 * Plan usage charge configuration
 */
export interface PlanUsageCharge {
  id?: string;
  usageMetricId: string;
  cappedAmount?: number;
  terms?: string;
  balanceUsed?: boolean;
  interval?: string;
}

/**
 * Plan feature configuration
 */
export interface PlanFeature {
  id: string;
  featureId: string;
  value?: unknown;
  valueType?: string;
}

/**
 * Plan entity
 */
export interface Plan {
  id: string;
  appId: string;
  name: string;
  description?: string;
  interval: 'month' | 'year' | 'one_time';
  currencyCode: string;
  amount: number;
  trialDays?: number;
  public?: boolean;
  visible?: boolean;
  archived?: boolean;
  customerTags?: string[];
  customerExcludeTags?: string[];
  shopifyPlans?: string[];
  type?: string;
  flexBilling?: boolean;
  flexBillingTerms?: string;
  planUsageCharges?: PlanUsageCharge[];
  features?: PlanFeature[];
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing plans
 */
export interface PlanListParams {
  public?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * Response from listing plans
 */
export interface PlanListResponse {
  plans: Plan[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Parameters for creating a plan
 */
export interface PlanCreateParams {
  name: string;
  description?: string;
  interval: 'month' | 'year' | 'one_time';
  currencyCode: string;
  amount: number;
  trialDays?: number;
  public?: boolean;
  visible?: boolean;
  customerTags?: string[];
  customerExcludeTags?: string[];
  shopifyPlans?: string[];
  type?: string;
  flexBilling?: boolean;
  flexBillingTerms?: string;
  planUsageCharges?: Omit<PlanUsageCharge, 'id'>[];
  features?: Array<{ featureId: string; value?: unknown }>;
  customFields?: Record<string, unknown>;
}

/**
 * Parameters for updating a plan
 */
export interface PlanUpdateParams extends Partial<PlanCreateParams> {}

/**
 * Feature entity
 */
export interface Feature {
  id: string;
  appId: string;
  name: string;
  type: 'boolean' | 'limit' | 'unlimited';
  description?: string;
  usageMetricId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a feature
 */
export interface FeatureCreateParams {
  name: string;
  type: 'boolean' | 'limit' | 'unlimited';
  description?: string;
  usageMetricId?: string;
}

/**
 * Parameters for updating a feature
 */
export interface FeatureUpdateParams
  extends Partial<Omit<FeatureCreateParams, 'type'>> {}

/**
 * App review entity
 */
export interface Review {
  id: string;
  appId: string;
  rating: number;
  title?: string;
  body?: string;
  author?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a review
 */
export interface ReviewCreateParams {
  rating: number;
  title?: string;
  body?: string;
}

/**
 * Parameters for updating a review
 */
export interface ReviewUpdateParams extends Partial<ReviewCreateParams> {}

/**
 * Usage metric entity
 */
export interface UsageMetric {
  id: string;
  appId: string;
  name: string;
  description?: string;
  eventName?: string;
  aggregationType?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a usage metric
 */
export interface UsageMetricCreateParams {
  name: string;
  description?: string;
  eventName?: string;
  aggregationType?: string;
}

/**
 * Parameters for updating a usage metric
 */
export interface UsageMetricUpdateParams
  extends Partial<UsageMetricCreateParams> {}

/**
 * App event entity
 */
export interface AppEvent {
  id: string;
  appId: string;
  customerId?: string;
  name: string;
  description?: string;
  occurredAt: string;
  properties?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Parameters for listing app events
 */
export interface AppEventListParams extends ListParams {
  customerId?: string;
}

/**
 * Response from listing app events
 */
export interface AppEventListResponse extends PaginatedResponse {
  appEvents: AppEvent[];
}

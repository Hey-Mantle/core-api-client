import type { ListParams, PaginatedResponse } from './common';

/**
 * App installation on a customer
 */
export interface AppInstallation {
  id: string;
  appId: string;
  installedAt?: string;
  uninstalledAt?: string;
  test?: boolean;
  active?: boolean;
  plan?: {
    id: string;
    name: string;
  };
  subscription?: {
    id: string;
    status: string;
  };
}

/**
 * App installation params for creating/updating
 */
export interface AppInstallationParams {
  appId: string;
  installedAt?: string;
  test?: boolean;
}

/**
 * Account owner for a customer
 */
export interface AccountOwner {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer entity
 */
export interface Customer {
  id: string;
  name?: string;
  email?: string;
  domain?: string;
  url?: string;
  shopifyDomain?: string;
  shopifyShopId?: string;
  countryCode?: string;
  preferredCurrency?: string;
  description?: string;
  tags: string[];
  customFields?: Record<string, unknown>;
  lifetimeValue?: number;
  test?: boolean;
  createdAt: string;
  updatedAt: string;
  appInstallations?: AppInstallation[];
  accountOwners?: AccountOwner[];
  company?: {
    id: string;
    name: string;
  };
}

/**
 * Parameters for listing customers
 */
export interface CustomerListParams extends ListParams {
  appIds?: string[];
  shopifyShopDomain?: string;
  shopifyShopId?: string;
  includeUsageMetrics?: boolean;
  includeContactCount?: boolean;
}

/**
 * Response from listing customers
 */
export interface CustomerListResponse extends PaginatedResponse {
  customers: Customer[];
}

/**
 * Parameters for creating a customer
 */
export interface CustomerCreateParams {
  name?: string;
  email?: string;
  domain?: string;
  url?: string;
  shopifyDomain?: string;
  shopifyShopId?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  companyId?: string;
  countryCode?: string;
  preferredCurrency?: string;
  description?: string;
  appInstallations?: AppInstallationParams[];
}

/**
 * Parameters for updating a customer
 */
export interface CustomerUpdateParams extends Partial<CustomerCreateParams> {}

/**
 * Parameters for retrieving a customer
 */
export interface CustomerRetrieveParams {
  includeContactCount?: boolean;
  includeCurrentInvoice?: boolean;
}

/**
 * Timeline event for a customer
 */
export interface TimelineEvent {
  id: string;
  type: string;
  description?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response from listing timeline events
 */
export interface TimelineListResponse extends PaginatedResponse {
  events: TimelineEvent[];
}

/**
 * Parameters for listing timeline events
 */
export interface TimelineListParams {
  appId?: string;
  type?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Response from listing account owners
 */
export interface AccountOwnersListResponse {
  accountOwners: AccountOwner[];
}

/**
 * Custom field definition
 */
export interface CustomField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'select_single' | 'select_multiple' | 'url' | 'date_time' | 'json' | 'number_integer' | 'number_decimal';
  defaultValue?: unknown;
  options?: string[];
  appLevel?: boolean;
  showOnCustomerDetail?: boolean;
  private?: boolean;
  filterable?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a custom field
 */
export interface CustomFieldCreateParams {
  appId: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'select_single' | 'select_multiple' | 'url' | 'date_time' | 'json' | 'number_integer' | 'number_decimal';
  defaultValue?: unknown;
  options?: string[];
  appLevel?: boolean;
  showOnCustomerDetail?: boolean;
  private?: boolean;
  filterable?: boolean;
}

/**
 * Parameters for updating a custom field
 */
export interface CustomFieldUpdateParams
  extends Partial<Omit<CustomFieldCreateParams, 'appId'>> {}

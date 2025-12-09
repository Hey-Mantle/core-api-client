import type { ListParams, PaginatedResponse } from './common';

/**
 * Deal entity
 */
export interface Deal {
  id: string;
  name: string;
  amount?: number;
  amountCurrencyCode?: string;
  currentAmount?: number;
  acquisitionChannel?: string;
  acquisitionSource?: string;
  firstInteractionAt?: string;
  closingAt?: string;
  closedAt?: string;
  stage?: string;
  step?: number;
  dealFlowId?: string;
  dealStageId?: string;
  customerId?: string;
  domain?: string;
  shopifyDomain?: string;
  companyId?: string;
  appId?: string;
  planId?: string;
  ownerIds?: string[];
  contactIds?: string[];
  notes?: string;
  affiliateId?: string;
  partnershipId?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string;
  };
  dealFlow?: {
    id: string;
    name: string;
  };
  dealStage?: {
    id: string;
    name: string;
  };
}

/**
 * Parameters for listing deals
 */
export interface DealListParams extends ListParams {
  customerId?: string;
  appId?: string;
  planId?: string;
  dealStageId?: string;
  dealFlowId?: string;
  affiliateId?: string;
  partnershipId?: string;
  acquirerId?: string;
  ownerId?: string;
  contactId?: string;
  stage?: string;
  step?: number;
  minAmount?: number;
  maxAmount?: number;
  minCurrentAmount?: number;
  maxCurrentAmount?: number;
  acquisitionChannel?: string;
  acquisitionSource?: string;
  includeArchived?: boolean;
}

/**
 * Response from listing deals
 */
export interface DealListResponse extends PaginatedResponse {
  deals: Deal[];
}

/**
 * Inline customer data for deal creation/update.
 * Matches existing customers by domain or shopifyDomain.
 * If no match found, creates a new customer.
 */
export interface DealCustomerInput {
  /** The name of the customer */
  name?: string;
  /** The email of the customer */
  email?: string;
  /** The domain of the customer (used for matching existing customers) */
  domain?: string;
  /** The Shopify domain of the customer (used for matching existing customers) */
  shopifyDomain?: string;
  /** The Shopify shop ID */
  shopifyShopId?: string;
  /** Tags to associate with the customer */
  tags?: string[];
  /** Custom fields for the customer */
  customFields?: Record<string, unknown>;
  /** The country code of the customer */
  countryCode?: string;
  /** The preferred currency of the customer */
  preferredCurrency?: string;
  /** Description of the customer */
  description?: string;
}

/**
 * Inline contact data for deal creation/update.
 * Matches existing contacts by email.
 * Contacts are linked to both the customer and the deal.
 */
export interface DealContactInput {
  /** The email of the contact (required, used for matching existing contacts) */
  email: string;
  /** The name of the contact */
  name?: string;
  /** The phone number of the contact */
  phone?: string;
  /** The job title of the contact */
  jobTitle?: string;
  /** The label for the contact relationship (e.g., "primary", "technical") */
  label?: string;
  /** Notes about the contact */
  notes?: string;
  /** Tags for the contact */
  tags?: string[];
}

/**
 * Parameters for creating a deal
 */
export interface DealCreateParams {
  name: string;
  amount?: number;
  amountCurrencyCode?: string;
  acquisitionChannel?: string;
  acquisitionSource?: string;
  firstInteractionAt?: string;
  closingAt?: string;
  closedAt?: string;
  dealFlowId?: string;
  dealStageId?: string;
  /** The ID of an existing customer (alternative to customer object) */
  customerId?: string;
  /**
   * Create or update a customer inline (alternative to customerId).
   * Matches existing customers by domain or shopifyDomain.
   */
  customer?: DealCustomerInput;
  domain?: string;
  shopifyDomain?: string;
  companyId?: string;
  appId?: string;
  planId?: string;
  ownerIds?: string[];
  /** Array of existing contact IDs (alternative to contacts array) */
  contactIds?: string[];
  /**
   * Create or update contacts inline (alternative to contactIds).
   * Matches existing contacts by email. Contacts are linked to both the customer and the deal.
   */
  contacts?: DealContactInput[];
  notes?: string;
  affiliateId?: string;
  partnershipId?: string;
}

/**
 * Parameters for updating a deal
 */
export interface DealUpdateParams extends Partial<DealCreateParams> {}

/**
 * Deal flow entity
 */
export interface DealFlow {
  id: string;
  name: string;
  description?: string;
  stages?: DealStage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Deal stage within a flow
 */
export interface DealStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

/**
 * Parameters for creating a deal flow
 */
export interface DealFlowCreateParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating a deal flow
 */
export interface DealFlowUpdateParams extends Partial<DealFlowCreateParams> {}

/**
 * Deal activity entity
 */
export interface DealActivity {
  id: string;
  name: string;
  dealFlowId: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a deal activity
 */
export interface DealActivityCreateParams {
  name: string;
  dealFlowId: string;
  description?: string;
  order?: number;
}

/**
 * Parameters for updating a deal activity
 */
export interface DealActivityUpdateParams
  extends Partial<Omit<DealActivityCreateParams, 'dealFlowId'>> {}

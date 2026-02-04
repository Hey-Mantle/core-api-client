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
  notes?: string;
  firstInteractionAt?: string | null;
  closingAt?: string | null;
  closedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  dealStage?: {
    id: string;
    name: string;
    stage?: string;
    weight?: number;
  } | null;
  dealFlow?: {
    id: string;
    name: string;
  } | null;
  customer?: {
    id: string;
    name?: string;
    email?: string;
    domain?: string;
    shopifyDomain?: string;
  } | null;
  app?: {
    id: string;
    name: string;
  } | null;
  plan?: {
    id: string;
    name: string;
  } | null;
  affiliate?: {
    id: string;
    name?: string;
  } | null;
  partnership?: {
    id: string;
    name?: string;
    displayName?: string;
  } | null;
  acquirer?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  owners?: Array<{
    id: string;
    userId: string;
    user?: {
      id: string;
      name?: string;
      email?: string;
    } | null;
  }>;
  contacts?: Array<{
    id: string;
    contactId: string;
    contact?: {
      id: string;
      name?: string;
      email?: string;
    } | null;
  }>;
}

/**
 * Parameters for listing deals
 */
export interface DealListParams extends ListParams {
  customerId?: string;
  appId?: string;
  planId?: string;
  dealStageId?: string | string[];
  dealFlowId?: string | string[];
  affiliateId?: string;
  partnershipId?: string;
  acquirerId?: string;
  ownerId?: string;
  contactId?: string;
  stage?: string | string[];
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
 *
 * **Customer Linking Options** (use only one approach):
 * - `customerId` - Link to an existing customer by ID
 * - `customer` - Create/update a customer inline (matches by domain or shopifyDomain)
 * - `domain`/`shopifyDomain` alone - Find or create a customer by domain
 *
 * Note: `domain` and `shopifyDomain` can be provided alongside `customerId` or `customer`
 * to update the customer's domain fields if they are not already set.
 *
 * **Contact Linking Options** (use only one approach):
 * - `contactIds` - Link to existing contacts by their IDs
 * - `contacts` - Create/update contacts inline (matches by email)
 */
export interface DealCreateParams {
  /** The name of the deal */
  name: string;
  /** The monetary value of the deal */
  amount?: number;
  /** The currency code for the deal amount (e.g., 'USD', 'EUR') */
  amountCurrencyCode?: string;
  /** The channel through which the deal was acquired */
  acquisitionChannel?: string;
  /** The specific source of the deal acquisition */
  acquisitionSource?: string;
  /** The timestamp of the first interaction with the prospect */
  firstInteractionAt?: string;
  /** The expected closing date for the deal */
  closingAt?: string;
  /** The actual closing date for the deal */
  closedAt?: string;
  /** The ID of the deal flow */
  dealFlowId?: string;
  /** The ID of the deal stage within the flow */
  dealStageId?: string;
  /**
   * Link to an existing customer by ID.
   * Cannot be used together with `customer` object.
   */
  customerId?: string;
  /**
   * Create or update a customer inline.
   * Matches existing customers by `domain` or `shopifyDomain`.
   * Cannot be used together with `customerId`.
   */
  customer?: DealCustomerInput;
  /**
   * The domain of the customer (e.g., 'acme.com').
   * URLs are automatically normalized (protocol and path stripped).
   * Used to find/create a customer if no `customerId` or `customer` provided,
   * or to update the customer's domain if not already set.
   */
  domain?: string;
  /**
   * The Shopify domain of the customer (e.g., 'acme.myshopify.com').
   * URLs are automatically normalized (protocol and path stripped).
   * Used to find/create a customer if no `customerId` or `customer` provided,
   * or to update the customer's shopifyDomain if not already set.
   */
  shopifyDomain?: string;
  /** The ID of the company to associate with the deal */
  companyId?: string;
  /** The ID of the app to associate with the deal */
  appId?: string;
  /** The ID of the plan to associate with the deal */
  planId?: string;
  /** Array of user IDs to assign as deal owners */
  ownerIds?: string[];
  /**
   * Link to existing contacts by their IDs.
   * Cannot be used together with `contacts` array.
   */
  contactIds?: string[];
  /**
   * Create or update contacts inline.
   * Matches existing contacts by email.
   * Contacts are automatically linked to both the customer and the deal.
   * Cannot be used together with `contactIds`.
   */
  contacts?: DealContactInput[];
  /** Additional notes about the deal */
  notes?: string;
  /** The ID of the affiliate to associate with the deal */
  affiliateId?: string;
  /** The ID of the partnership to associate with the deal */
  partnershipId?: string;
}

/**
 * Parameters for updating a deal
 *
 * All fields are optional. See {@link DealCreateParams} for detailed documentation
 * on customer and contact linking options.
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

/**
 * Deal event entity
 */
export interface DealEvent {
  id: string;
  type: string;
  notes?: string;
  occurredAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  previousDealStage?: {
    id: string;
    name: string;
  } | null;
  dealStage?: {
    id: string;
    name: string;
  } | null;
  dealActivity?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    name?: string;
  } | null;
  appEvent?: {
    id: string;
  } | null;
}

/**
 * Parameters for creating a deal event
 */
export interface DealEventCreateParams {
  /** Notes or description for the event */
  notes?: string;
  /** Associated deal activity ID */
  dealActivityId?: string;
  /** Custom activity name (for ad-hoc activities not in the predefined list) */
  customActivityName?: string;
  /** Stage to progress the deal to */
  dealStageId?: string;
  /** Associated task ID */
  taskId?: string;
  /** Associated app event ID */
  appEventId?: string;
  /** When the event occurred (default: now) */
  occurredAt?: string;
  /** User ID who created the event (default: authenticated user) */
  userId?: string;
}

/**
 * Response from listing deal events
 */
export interface DealEventListResponse extends PaginatedResponse {
  events: DealEvent[];
}

/**
 * Response from creating a deal event
 */
export interface DealEventCreateResponse {
  event: DealEvent;
  /** Whether the deal was progressed to a new stage */
  dealProgressed?: boolean;
  /** The updated deal if progression occurred */
  deal?: Deal;
}

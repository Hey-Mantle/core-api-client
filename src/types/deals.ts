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

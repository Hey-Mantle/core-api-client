import type { ListParams, PaginatedResponse } from './common';

/**
 * Company entity
 */
export interface Company {
  id: string;
  name: string;
  parentCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  parentCustomer?: {
    id: string;
    name?: string;
  };
}

/**
 * Parameters for listing companies
 */
export interface CompanyListParams extends ListParams {}

/**
 * Response from listing companies
 */
export interface CompanyListResponse extends PaginatedResponse {
  companies: Company[];
}

/**
 * Parameters for creating a company
 */
export interface CompanyCreateParams {
  name: string;
  parentCustomerId?: string;
}

/**
 * Parameters for updating a company
 */
export interface CompanyUpdateParams extends Partial<CompanyCreateParams> {}

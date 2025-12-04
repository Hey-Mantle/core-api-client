import { BaseResource } from './base';
import type {
  Company,
  CompanyListParams,
  CompanyListResponse,
  CompanyCreateParams,
  CompanyUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing companies
 */
export class CompaniesResource extends BaseResource {
  /**
   * List companies with optional pagination
   */
  async list(params?: CompanyListParams): Promise<CompanyListResponse> {
    const response = await this.get<CompanyListResponse>('/companies', params);
    return {
      companies: response.companies || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single company by ID
   */
  async retrieve(companyId: string): Promise<{ company: Company }> {
    return this.get<{ company: Company }>(`/companies/${companyId}`);
  }

  /**
   * Create a new company
   */
  async create(data: CompanyCreateParams): Promise<{ company: Company }> {
    return this.post<{ company: Company }>('/companies', data);
  }

  /**
   * Update an existing company
   */
  async update(
    companyId: string,
    data: CompanyUpdateParams
  ): Promise<{ company: Company }> {
    return this.put<{ company: Company }>(`/companies/${companyId}`, data);
  }

  /**
   * Delete a company
   */
  async del(companyId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/companies/${companyId}`);
  }
}

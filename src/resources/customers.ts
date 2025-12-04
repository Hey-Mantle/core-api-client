import { BaseResource } from './base';
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerCreateParams,
  CustomerUpdateParams,
  CustomerRetrieveParams,
  TimelineListParams,
  TimelineListResponse,
  AccountOwnersListResponse,
  CustomField,
  CustomFieldCreateParams,
  CustomFieldUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing customers
 */
export class CustomersResource extends BaseResource {
  /**
   * List customers with optional filters and pagination
   */
  async list(params?: CustomerListParams): Promise<CustomerListResponse> {
    const response = await this.get<CustomerListResponse>('/customers', params);
    return {
      customers: response.customers || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single customer by ID
   */
  async retrieve(
    customerId: string,
    params?: CustomerRetrieveParams
  ): Promise<{ customer: Customer }> {
    return this.get<{ customer: Customer }>(
      `/customers/${customerId}`,
      params
    );
  }

  /**
   * Create a new customer
   */
  async create(data: CustomerCreateParams): Promise<{ customer: Customer }> {
    return this.post<{ customer: Customer }>('/customers', data);
  }

  /**
   * Update an existing customer
   */
  async update(
    customerId: string,
    data: CustomerUpdateParams
  ): Promise<{ customer: Customer }> {
    return this.put<{ customer: Customer }>(
      `/customers/${customerId}`,
      data
    );
  }

  /**
   * Add tags to a customer
   */
  async addTags(
    customerId: string,
    tags: string[]
  ): Promise<{ customer: Customer }> {
    return this.post<{ customer: Customer }>(
      `/customers/${customerId}/addTags`,
      { tags }
    );
  }

  /**
   * Remove tags from a customer
   */
  async removeTags(
    customerId: string,
    tags: string[]
  ): Promise<{ customer: Customer }> {
    return this.post<{ customer: Customer }>(
      `/customers/${customerId}/removeTags`,
      { tags }
    );
  }

  /**
   * Get customer activity timeline
   */
  async getTimeline(
    customerId: string,
    params?: TimelineListParams
  ): Promise<TimelineListResponse> {
    const response = await this.get<TimelineListResponse>(
      `/customers/${customerId}/timeline`,
      { limit: 25, ...params }
    );
    return {
      events: response.events || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * List account owners for a customer
   */
  async listAccountOwners(
    customerId: string
  ): Promise<AccountOwnersListResponse> {
    return this.get<AccountOwnersListResponse>(
      `/customers/${customerId}/account_owners`
    );
  }

  /**
   * Add an account owner to a customer
   */
  async addAccountOwner(
    customerId: string,
    data: { email: string; name?: string }
  ): Promise<{ accountOwner: { id: string; email: string; name?: string } }> {
    return this.post<{
      accountOwner: { id: string; email: string; name?: string };
    }>(`/customers/${customerId}/account_owners`, data);
  }

  /**
   * Remove an account owner from a customer
   */
  async removeAccountOwner(
    customerId: string,
    ownerId: string
  ): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/customers/${customerId}/account_owners/${ownerId}`
    );
  }

  /**
   * List custom fields
   */
  async listCustomFields(params?: {
    appId?: string;
  }): Promise<{ customFields: CustomField[] }> {
    return this.get<{ customFields: CustomField[] }>(
      '/customers/custom_fields',
      params
    );
  }

  /**
   * Create a custom field
   */
  async createCustomField(
    data: CustomFieldCreateParams
  ): Promise<{ customField: CustomField }> {
    return this.post<{ customField: CustomField }>(
      '/customers/custom_fields',
      data
    );
  }

  /**
   * Retrieve a custom field by ID
   */
  async retrieveCustomField(
    fieldId: string
  ): Promise<{ customField: CustomField }> {
    return this.get<{ customField: CustomField }>(
      `/customers/custom_fields/${fieldId}`
    );
  }

  /**
   * Update a custom field
   */
  async updateCustomField(
    fieldId: string,
    data: CustomFieldUpdateParams
  ): Promise<{ customField: CustomField }> {
    return this.put<{ customField: CustomField }>(
      `/customers/custom_fields/${fieldId}`,
      data
    );
  }

  /**
   * Delete a custom field
   */
  async deleteCustomField(fieldId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/customers/custom_fields/${fieldId}`
    );
  }
}

import { BaseResource } from './base';
import type {
  Contact,
  ContactListParams,
  ContactListResponse,
  ContactCreateParams,
  ContactUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing contacts
 */
export class ContactsResource extends BaseResource {
  /**
   * List contacts with optional filters and pagination
   */
  async list(params?: ContactListParams): Promise<ContactListResponse> {
    const response = await this.get<ContactListResponse>('/contacts', params);
    return {
      contacts: response.contacts || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single contact by ID
   */
  async retrieve(contactId: string): Promise<{ contact: Contact }> {
    return this.get<{ contact: Contact }>(`/contacts/${contactId}`);
  }

  /**
   * Create a new contact
   */
  async create(data: ContactCreateParams): Promise<{ contact: Contact }> {
    return this.post<{ contact: Contact }>('/contacts', data);
  }

  /**
   * Update an existing contact
   */
  async update(
    contactId: string,
    data: ContactUpdateParams
  ): Promise<{ contact: Contact }> {
    return this.put<{ contact: Contact }>(`/contacts/${contactId}`, data);
  }

  /**
   * Delete a contact
   */
  async del(contactId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/contacts/${contactId}`);
  }

  /**
   * Add tags to a contact
   */
  async addTags(
    contactId: string,
    tags: string[]
  ): Promise<{ contact: Contact }> {
    return this.post<{ contact: Contact }>(
      `/contacts/${contactId}/addTags`,
      { tags }
    );
  }

  /**
   * Remove tags from a contact
   */
  async removeTags(
    contactId: string,
    tags: string[]
  ): Promise<{ contact: Contact }> {
    return this.post<{ contact: Contact }>(
      `/contacts/${contactId}/removeTags`,
      { tags }
    );
  }
}

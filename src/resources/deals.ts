import { BaseResource } from './base';
import type {
  Deal,
  DealListParams,
  DealListResponse,
  DealCreateParams,
  DealUpdateParams,
  TimelineListResponse,
  DealEventCreateParams,
  DealEventListResponse,
  DealEventCreateResponse,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing deals
 */
export class DealsResource extends BaseResource {
  /**
   * List deals with optional filters and pagination
   */
  async list(params?: DealListParams): Promise<DealListResponse> {
    const response = await this.get<DealListResponse>('/deals', params);
    return {
      deals: response.deals || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single deal by ID
   */
  async retrieve(dealId: string): Promise<{ deal: Deal }> {
    return this.get<{ deal: Deal }>(`/deals/${dealId}`);
  }

  /**
   * Create a new deal
   *
   * **Linking a Customer:**
   * There are three ways to associate a customer with a deal (use only one):
   *
   * 1. `customerId` - Link to an existing customer by ID
   * 2. `customer` - Create or update a customer inline. Matches existing customers
   *    by `domain` or `shopifyDomain`. If no match, creates a new customer.
   * 3. `domain` and/or `shopifyDomain` - Find an existing customer by domain,
   *    or create a minimal customer record if not found.
   *
   * If `domain` or `shopifyDomain` are provided alongside `customerId` or `customer`,
   * they will be used to update the customer's domain fields only if not already set.
   *
   * **Linking Contacts:**
   * There are two ways to associate contacts with a deal (use only one):
   *
   * 1. `contactIds` - Link to existing contacts by their IDs
   * 2. `contacts` - Create or update contacts inline. Matches existing contacts
   *    by email. Contacts are automatically linked to both the customer and the deal.
   *
   * @example
   * // Using an existing customer
   * await client.deals.create({ name: 'Deal', customerId: 'cust_123', dealFlowId: '...', dealStageId: '...' });
   *
   * // Creating a customer inline
   * await client.deals.create({
   *   name: 'Deal',
   *   customer: { name: 'Acme Corp', domain: 'acme.com', email: 'info@acme.com' },
   *   contacts: [{ email: 'john@acme.com', name: 'John Doe', jobTitle: 'CEO' }],
   *   dealFlowId: '...',
   *   dealStageId: '...',
   * });
   *
   * // Using domain to find/create customer
   * await client.deals.create({ name: 'Deal', shopifyDomain: 'acme.myshopify.com', dealFlowId: '...', dealStageId: '...' });
   */
  async create(data: DealCreateParams): Promise<{ deal: Deal }> {
    return this.post<{ deal: Deal }>('/deals', data);
  }

  /**
   * Update an existing deal
   *
   * **Updating Customer Association:**
   * There are three ways to change or update the customer (use only one):
   *
   * 1. `customerId` - Change to a different existing customer
   * 2. `customer` - Update the linked customer inline, or create/link a new one.
   *    Matches existing customers by `domain` or `shopifyDomain`.
   * 3. `domain` and/or `shopifyDomain` - Find a different customer by domain,
   *    or create a minimal customer record if not found.
   *
   * If `domain` or `shopifyDomain` are provided alongside `customerId` or `customer`,
   * they will be used to update the customer's domain fields only if not already set.
   *
   * **Updating Contacts:**
   * There are two ways to update contacts (use only one):
   *
   * 1. `contactIds` - Replace deal contacts with the specified contact IDs
   * 2. `contacts` - Create or update contacts inline. Matches existing contacts
   *    by email. Contacts are automatically linked to both the customer and the deal.
   *
   * @example
   * // Update customer's domain if not set
   * await client.deals.update('deal_123', { customerId: 'cust_456', domain: 'newdomain.com' });
   *
   * // Update customer and contacts inline
   * await client.deals.update('deal_123', {
   *   customer: { name: 'Updated Name', domain: 'acme.com' },
   *   contacts: [{ email: 'new@acme.com', name: 'New Contact' }],
   * });
   */
  async update(
    dealId: string,
    data: DealUpdateParams
  ): Promise<{ deal: Deal }> {
    return this.put<{ deal: Deal }>(`/deals/${dealId}`, data);
  }

  /**
   * Archive (soft delete) a deal
   */
  async del(dealId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/deals/${dealId}`);
  }

  /**
   * Get deal activity timeline
   */
  async timeline(dealId: string): Promise<TimelineListResponse> {
    const response = await this.get<TimelineListResponse>(
      `/deals/${dealId}/timeline`
    );
    return {
      events: response.events || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * List deal events
   */
  async listEvents(dealId: string): Promise<DealEventListResponse> {
    const response = await this.get<DealEventListResponse>(
      `/deals/${dealId}/events`
    );
    return {
      events: response.events || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Create a deal event
   *
   * Creates an event on a deal. If `dealStageId` is provided, the deal will
   * progress to that stage. If `dealActivityId` is provided and the activity
   * is configured for a future stage, the deal will automatically progress.
   *
   * @example
   * // Create a simple note
   * await client.deals.createEvent('deal_123', { notes: 'Follow-up call completed' });
   *
   * // Create an event and progress to a new stage
   * await client.deals.createEvent('deal_123', {
   *   dealStageId: 'stage_456',
   *   notes: 'Moving to negotiation phase',
   * });
   */
  async createEvent(
    dealId: string,
    data: DealEventCreateParams
  ): Promise<DealEventCreateResponse> {
    return this.post<DealEventCreateResponse>(`/deals/${dealId}/events`, data);
  }
}

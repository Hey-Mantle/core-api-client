import { BaseResource } from './base';
import type {
  Deal,
  DealListParams,
  DealListResponse,
  DealCreateParams,
  DealUpdateParams,
  TimelineListResponse,
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
   */
  async create(data: DealCreateParams): Promise<{ deal: Deal }> {
    return this.post<{ deal: Deal }>('/deals', data);
  }

  /**
   * Update an existing deal
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
  async getTimeline(dealId: string): Promise<TimelineListResponse> {
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
   * Get deal events
   */
  async getEvents(dealId: string): Promise<{ events: unknown[] }> {
    return this.get<{ events: unknown[] }>(`/deals/${dealId}/events`);
  }
}

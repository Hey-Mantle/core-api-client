import { BaseResource } from './base';
import type {
  DealActivity,
  DealActivityCreateParams,
  DealActivityUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing deal activities
 */
export class DealActivitiesResource extends BaseResource {
  /**
   * List all deal activities
   */
  async list(): Promise<{ dealActivities: DealActivity[] }> {
    return this.get<{ dealActivities: DealActivity[] }>('/deal_activities');
  }

  /**
   * Retrieve a single deal activity by ID
   */
  async retrieve(
    dealActivityId: string
  ): Promise<{ dealActivity: DealActivity }> {
    return this.get<{ dealActivity: DealActivity }>(
      `/deal_activities/${dealActivityId}`
    );
  }

  /**
   * Create a new deal activity
   */
  async create(
    data: DealActivityCreateParams
  ): Promise<{ dealActivity: DealActivity }> {
    return this.post<{ dealActivity: DealActivity }>('/deal_activities', data);
  }

  /**
   * Update an existing deal activity
   */
  async update(
    dealActivityId: string,
    data: DealActivityUpdateParams
  ): Promise<{ dealActivity: DealActivity }> {
    return this.put<{ dealActivity: DealActivity }>(
      `/deal_activities/${dealActivityId}`,
      data
    );
  }

  /**
   * Delete a deal activity
   */
  async del(dealActivityId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/deal_activities/${dealActivityId}`);
  }
}

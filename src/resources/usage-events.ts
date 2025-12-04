import { BaseResource } from './base';
import type {
  UsageEventListParams,
  UsageEventListResponse,
  UsageEventCreateParams,
  UsageEventCreateResponse,
} from '../types';

/**
 * Resource for managing usage events
 */
export class UsageEventsResource extends BaseResource {
  /**
   * List usage events with optional filters and pagination
   */
  async list(params?: UsageEventListParams): Promise<UsageEventListResponse> {
    const response = await this.get<UsageEventListResponse>(
      '/usage_events',
      params
    );
    return {
      usageEvents: response.usageEvents || response.events || [],
      events: response.events,
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Create usage event(s)
   *
   * @example
   * // Single event
   * await client.usageEvents.create({
   *   eventName: 'api_call',
   *   customerId: 'cust_123',
   *   appId: 'app_456',
   *   properties: { endpoint: '/users' },
   * });
   *
   * @example
   * // Multiple events
   * await client.usageEvents.create({
   *   events: [
   *     { eventName: 'api_call', customerId: 'cust_123', appId: 'app_456' },
   *     { eventName: 'api_call', customerId: 'cust_789', appId: 'app_456' },
   *   ],
   * });
   */
  async create(
    data: UsageEventCreateParams
  ): Promise<UsageEventCreateResponse> {
    return this.post<UsageEventCreateResponse>('/usage_events', data);
  }
}

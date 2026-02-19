import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing usage events
 */
export class UsageEventsResource extends BaseResource {
  /**
   * List usage events with optional filters and pagination
   */
  async list(params?: paths['/usage_events']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/usage_events', { params: { query: params } }));
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
  async create(data?: NonNullable<paths['/usage_events']['post']['requestBody']>['content']['application/json']) {
    return this.unwrap(this.api.POST('/usage_events', { body: data }));
  }
}

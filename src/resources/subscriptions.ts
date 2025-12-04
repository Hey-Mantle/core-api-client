import { BaseResource } from './base';
import type {
  Subscription,
  SubscriptionListParams,
  SubscriptionListResponse,
} from '../types';

/**
 * Resource for managing subscriptions
 */
export class SubscriptionsResource extends BaseResource {
  /**
   * List subscriptions with optional filters and pagination
   */
  async list(
    params?: SubscriptionListParams
  ): Promise<SubscriptionListResponse> {
    const response = await this.get<SubscriptionListResponse>(
      '/subscriptions',
      params
    );
    return {
      subscriptions: response.subscriptions || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single subscription by ID
   */
  async retrieve(
    subscriptionId: string
  ): Promise<{ subscription: Subscription }> {
    return this.get<{ subscription: Subscription }>(
      `/subscriptions/${subscriptionId}`
    );
  }
}

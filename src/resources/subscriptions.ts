import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing subscriptions
 */
export class SubscriptionsResource extends BaseResource {
  /**
   * List subscriptions with optional filters and pagination
   */
  async list(params?: paths['/subscriptions']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/subscriptions', { params: { query: params } }));
  }

  /**
   * Retrieve a single subscription by ID
   */
  async retrieve(subscriptionId: string) {
    return this.unwrap(this.api.GET('/subscriptions/{id}', { params: { path: { id: subscriptionId } } }));
  }
}

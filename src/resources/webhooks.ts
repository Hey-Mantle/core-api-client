import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing webhooks
 */
export class WebhooksResource extends BaseResource {
  /**
   * List all webhooks
   */
  async list() {
    return this.unwrap(this.api.GET('/webhooks'));
  }

  /**
   * Create a new webhook
   */
  async create(data: paths['/webhooks']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/webhooks', { body: data }));
  }

  /**
   * Update an existing webhook
   */
  async update(webhookId: string, data: paths['/webhooks/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/webhooks/{id}', { params: { path: { id: webhookId } }, body: data }));
  }

  /**
   * Delete a webhook
   */
  async del(webhookId: string) {
    return this.unwrap(this.api.DELETE('/webhooks/{id}', { params: { path: { id: webhookId } } }));
  }
}

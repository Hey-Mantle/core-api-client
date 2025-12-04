import { BaseResource } from './base';
import type {
  Webhook,
  WebhookListResponse,
  WebhookCreateParams,
  WebhookUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing webhooks
 */
export class WebhooksResource extends BaseResource {
  /**
   * List all webhooks
   */
  async list(): Promise<WebhookListResponse> {
    const response = await this.get<WebhookListResponse>('/webhooks');
    return {
      webhooks: response.webhooks || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
    };
  }

  /**
   * Retrieve a single webhook by ID
   */
  async retrieve(webhookId: string): Promise<{ webhook: Webhook }> {
    return this.get<{ webhook: Webhook }>(`/webhooks/${webhookId}`);
  }

  /**
   * Create a new webhook
   */
  async create(data: WebhookCreateParams): Promise<{ webhook: Webhook }> {
    return this.post<{ webhook: Webhook }>('/webhooks', data);
  }

  /**
   * Update an existing webhook
   */
  async update(
    webhookId: string,
    data: WebhookUpdateParams
  ): Promise<{ webhook: Webhook }> {
    return this.put<{ webhook: Webhook }>(`/webhooks/${webhookId}`, data);
  }

  /**
   * Delete a webhook
   */
  async del(webhookId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/webhooks/${webhookId}`);
  }
}

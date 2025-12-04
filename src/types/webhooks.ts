import type { PaginatedResponse } from './common';

/**
 * Webhook topic types
 */
export type WebhookTopic =
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'usage_event.created'
  | 'app_event.created'
  | 'deal.created'
  | 'deal.updated'
  | 'deal.deleted'
  | 'ticket.created'
  | 'ticket.updated';

/**
 * Webhook filter configuration
 */
export interface WebhookFilter {
  eventName?: string;
}

/**
 * Webhook entity
 */
export interface Webhook {
  id: string;
  topic: WebhookTopic | string;
  address: string;
  appIds?: string[];
  filter?: WebhookFilter;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from listing webhooks
 */
export interface WebhookListResponse extends PaginatedResponse {
  webhooks: Webhook[];
}

/**
 * Parameters for creating a webhook
 */
export interface WebhookCreateParams {
  topic: WebhookTopic | string;
  address: string;
  appIds?: string[];
  filter?: WebhookFilter;
}

/**
 * Parameters for updating a webhook
 */
export interface WebhookUpdateParams extends Partial<WebhookCreateParams> {}

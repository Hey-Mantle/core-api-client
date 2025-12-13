import { BaseResource } from './base';
import type {
  Ticket,
  TicketListParams,
  TicketListResponse,
  TicketCreateParams,
  TicketUpdateParams,
  TicketMessage,
  TicketMessageCreateParams,
  TicketMessageUpdateParams,
  TicketMessagesListParams,
  TicketMessagesListResponse,
  TicketMessageBulkInput,
  TicketEvent,
  TicketEventCreateParams,
  TicketEventListParams,
  TicketEventListResponse,
  TicketEventBulkInput,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing tickets and ticket messages
 */
export class TicketsResource extends BaseResource {
  /**
   * List tickets with optional filters and pagination
   */
  async list(params?: TicketListParams): Promise<TicketListResponse> {
    const response = await this.get<TicketListResponse>('/tickets', params);
    return {
      tickets: response.tickets || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single ticket by ID
   */
  async retrieve(ticketId: string): Promise<{ ticket: Ticket }> {
    return this.get<{ ticket: Ticket }>(`/tickets/${ticketId}`);
  }

  /**
   * Create a new ticket
   */
  async create(data: TicketCreateParams): Promise<{ ticket: Ticket }> {
    return this.post<{ ticket: Ticket }>('/tickets', data);
  }

  /**
   * Update an existing ticket
   */
  async update(
    ticketId: string,
    data: TicketUpdateParams
  ): Promise<{ ticket: Ticket }> {
    return this.put<{ ticket: Ticket }>(`/tickets/${ticketId}`, data);
  }

  /**
   * Delete a ticket
   */
  async del(ticketId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/tickets/${ticketId}`);
  }

  // ========== Messages ==========

  /**
   * List messages for a ticket with optional pagination
   */
  async listMessages(
    ticketId: string,
    params?: TicketMessagesListParams
  ): Promise<TicketMessagesListResponse> {
    const response = await this.get<TicketMessagesListResponse>(
      `/tickets/${ticketId}/messages`,
      params
    );
    return {
      messages: response.messages || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single message
   */
  async retrieveMessage(
    ticketId: string,
    messageId: string
  ): Promise<{ message: TicketMessage }> {
    return this.get<{ message: TicketMessage }>(
      `/tickets/${ticketId}/messages/${messageId}`
    );
  }

  /**
   * Create a new message on a ticket
   */
  async createMessage(
    ticketId: string,
    data: TicketMessageCreateParams
  ): Promise<{ message: TicketMessage }> {
    return this.post<{ message: TicketMessage }>(
      `/tickets/${ticketId}/messages`,
      data
    );
  }

  /**
   * Update a message
   */
  async updateMessage(
    ticketId: string,
    messageId: string,
    data: TicketMessageUpdateParams
  ): Promise<{ message: TicketMessage }> {
    return this.put<{ message: TicketMessage }>(
      `/tickets/${ticketId}/messages/${messageId}`,
      data
    );
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    ticketId: string,
    messageId: string
  ): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/tickets/${ticketId}/messages/${messageId}`
    );
  }

  /**
   * Bulk upsert messages for a ticket
   * Messages with an id will be updated, messages without id will be created.
   * Messages not included in the array will be deleted.
   */
  async bulkUpsertMessages(
    ticketId: string,
    messages: TicketMessageBulkInput[]
  ): Promise<{ messages: TicketMessage[] }> {
    return this.put<{ messages: TicketMessage[] }>(
      `/tickets/${ticketId}/messages`,
      messages
    );
  }

  // ========== Events ==========

  /**
   * List events for a ticket
   */
  async listEvents(
    ticketId: string,
    params?: TicketEventListParams
  ): Promise<TicketEventListResponse> {
    const response = await this.get<TicketEventListResponse>(
      `/tickets/${ticketId}/events`,
      params
    );
    return {
      events: response.events || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Create an event for a ticket
   * Events are idempotent. If a duplicate is detected, the existing event is returned.
   */
  async createEvent(
    ticketId: string,
    data: TicketEventCreateParams
  ): Promise<{ event: TicketEvent }> {
    return this.post<{ event: TicketEvent }>(
      `/tickets/${ticketId}/events`,
      data
    );
  }

  /**
   * Bulk upsert events for a ticket
   * Events with an id will be updated, events without id will be created.
   * Events not included in the array will be deleted.
   */
  async bulkUpsertEvents(
    ticketId: string,
    events: TicketEventBulkInput[]
  ): Promise<{ events: TicketEvent[] }> {
    return this.put<{ events: TicketEvent[] }>(
      `/tickets/${ticketId}/events`,
      events
    );
  }
}

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
   * List messages for a ticket
   */
  async listMessages(ticketId: string): Promise<{ messages: TicketMessage[] }> {
    return this.get<{ messages: TicketMessage[] }>(
      `/tickets/${ticketId}/messages`
    );
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
}

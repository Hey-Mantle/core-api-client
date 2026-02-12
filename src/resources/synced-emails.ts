import { BaseResource } from './base';
import type {
  SyncedEmail,
  SyncedEmailListParams,
  SyncedEmailListResponse,
  SyncedEmailCreateParams,
  SyncedEmailUpdateParams,
  SyncedEmailAddMessagesParams,
  SyncedEmailMessage,
} from '../types/synced-emails';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing synced email threads and messages
 *
 * Synced emails represent email threads that have been pushed from external
 * email providers (Gmail, Outlook) into Mantle. They can be associated with
 * contacts, customers, and deals.
 *
 * @example
 * ```typescript
 * // Sync an email thread from Gmail
 * const syncedEmail = await client.syncedEmails.create({
 *   emailData: {
 *     externalId: 'gmail-thread-id-123',
 *     subject: 'Re: Partnership Discussion',
 *     source: 'gmail',
 *     customerId: 'cust_456',
 *   },
 *   messages: [
 *     {
 *       externalId: 'gmail-msg-1',
 *       fromEmail: 'partner@example.com',
 *       fromName: 'Jane Partner',
 *       toEmails: ['you@company.com'],
 *       subject: 'Partnership Discussion',
 *       bodyText: 'Hi, I wanted to discuss...',
 *       date: '2024-01-15T10:00:00Z',
 *       isInbound: true,
 *     },
 *   ],
 * });
 * ```
 */
export class SyncedEmailsResource extends BaseResource {
  /**
   * List synced email threads with optional filters and pagination
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of synced email threads
   *
   * @example
   * ```typescript
   * // List all synced emails
   * const { syncedEmails } = await client.syncedEmails.list();
   *
   * // List synced emails for a specific customer
   * const { syncedEmails } = await client.syncedEmails.list({ customerId: 'cust_123' });
   *
   * // List Gmail synced emails
   * const { syncedEmails } = await client.syncedEmails.list({ source: 'gmail' });
   * ```
   */
  async list(params?: SyncedEmailListParams): Promise<SyncedEmailListResponse> {
    const response = await this.get<SyncedEmailListResponse>('/synced_emails', params);
    return {
      syncedEmails: response.syncedEmails || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  }

  /**
   * Retrieve a single synced email thread by ID with all messages
   *
   * @param syncedEmailId - The synced email thread ID
   * @returns The synced email with all messages
   *
   * @example
   * ```typescript
   * const syncedEmail = await client.syncedEmails.retrieve('se_123');
   * console.log(syncedEmail.messages?.length);
   * ```
   */
  async retrieve(syncedEmailId: string): Promise<SyncedEmail> {
    return this.get<SyncedEmail>(`/synced_emails/${syncedEmailId}`);
  }

  /**
   * Create or sync a synced email thread
   *
   * If `emailData.externalId` is provided, performs an upsert: updates the
   * existing thread and adds new messages if a thread with that externalId
   * already exists. Otherwise creates a new thread.
   *
   * @param data - Email thread and messages data
   * @returns The created or updated synced email thread
   *
   * @example
   * ```typescript
   * // Create a new thread (or upsert if externalId matches)
   * const syncedEmail = await client.syncedEmails.create({
   *   emailData: {
   *     externalId: 'gmail-thread-123',
   *     subject: 'Sales Discussion',
   *     source: 'gmail',
   *   },
   *   messages: [
   *     {
   *       externalId: 'msg-1',
   *       fromEmail: 'prospect@example.com',
   *       subject: 'Sales Discussion',
   *       bodyText: 'Interested in your product...',
   *       date: new Date().toISOString(),
   *       isInbound: true,
   *     },
   *   ],
   * });
   * ```
   */
  async create(data: SyncedEmailCreateParams): Promise<SyncedEmail> {
    return this.post<SyncedEmail>('/synced_emails', data);
  }

  /**
   * Update synced email thread metadata
   *
   * @param syncedEmailId - The synced email thread ID
   * @param data - Fields to update
   * @returns The updated synced email thread
   *
   * @example
   * ```typescript
   * // Link email to a deal
   * const syncedEmail = await client.syncedEmails.update('se_123', {
   *   dealId: 'deal_456',
   * });
   * ```
   */
  async update(
    syncedEmailId: string,
    data: SyncedEmailUpdateParams
  ): Promise<SyncedEmail> {
    return this.put<SyncedEmail>(`/synced_emails/${syncedEmailId}`, data);
  }

  /**
   * Archive (soft delete) a synced email thread
   *
   * @param syncedEmailId - The synced email thread ID
   * @returns Success response
   *
   * @example
   * ```typescript
   * await client.syncedEmails.del('se_123');
   * ```
   */
  async del(syncedEmailId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/synced_emails/${syncedEmailId}`);
  }

  /**
   * Add messages to an existing synced email thread
   *
   * @param syncedEmailId - The synced email thread ID
   * @param data - Messages to add
   * @returns The synced email thread with all messages
   *
   * @example
   * ```typescript
   * const syncedEmail = await client.syncedEmails.addMessages('se_123', {
   *   messages: [
   *     {
   *       externalId: 'msg-2',
   *       fromEmail: 'you@company.com',
   *       toEmails: ['prospect@example.com'],
   *       subject: 'Re: Sales Discussion',
   *       bodyText: 'Thanks for your interest...',
   *       date: new Date().toISOString(),
   *       isInbound: false,
   *     },
   *   ],
   * });
   * ```
   */
  async addMessages(
    syncedEmailId: string,
    data: SyncedEmailAddMessagesParams
  ): Promise<SyncedEmail> {
    return this.post<SyncedEmail>(
      `/synced_emails/${syncedEmailId}/messages`,
      data
    );
  }

  /**
   * Get messages for a synced email thread
   *
   * @param syncedEmailId - The synced email thread ID
   * @returns List of messages in the thread
   *
   * @example
   * ```typescript
   * const { messages } = await client.syncedEmails.getMessages('se_123');
   * ```
   */
  async getMessages(
    syncedEmailId: string
  ): Promise<{ messages: SyncedEmailMessage[] }> {
    return this.get<{ messages: SyncedEmailMessage[] }>(
      `/synced_emails/${syncedEmailId}/messages`
    );
  }
}

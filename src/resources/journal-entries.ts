import { BaseResource } from './base';
import type {
  JournalEntry,
  JournalEntryListParams,
  JournalEntryListResponse,
  JournalEntryCreateParams,
  JournalEntryUpdateParams,
} from '../types/journal-entries';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing journal entries
 */
export class JournalEntriesResource extends BaseResource {
  /**
   * List journal entries with optional filters and pagination
   */
  async list(
    params?: JournalEntryListParams
  ): Promise<JournalEntryListResponse> {
    const response = await this.get<JournalEntryListResponse>(
      '/journal_entries',
      params
    );
    return {
      journalEntries: response.journalEntries || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single journal entry by ID
   */
  async retrieve(entryId: string): Promise<{ journalEntry: JournalEntry }> {
    return this.get<{ journalEntry: JournalEntry }>(
      `/journal_entries/${entryId}`
    );
  }

  /**
   * Create a new journal entry
   */
  async create(
    data: JournalEntryCreateParams
  ): Promise<{ journalEntry: JournalEntry }> {
    return this.post<{ journalEntry: JournalEntry }>('/journal_entries', data);
  }

  /**
   * Update an existing journal entry
   */
  async update(
    entryId: string,
    data: JournalEntryUpdateParams
  ): Promise<{ journalEntry: JournalEntry }> {
    return this.put<{ journalEntry: JournalEntry }>(
      `/journal_entries/${entryId}`,
      data
    );
  }

  /**
   * Delete a journal entry
   */
  async del(entryId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/journal_entries/${entryId}`);
  }
}

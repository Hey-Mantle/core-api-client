import type { ListParams, PaginatedResponse } from './common';

/**
 * File attached to a journal entry
 */
export interface JournalEntryFile {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

/**
 * Journal entry entity
 */
export interface JournalEntry {
  id: string;
  appId?: string;
  date: string;
  title?: string;
  description: string;
  tags: string[];
  url?: string;
  emoji?: string;
  files: JournalEntryFile[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing journal entries
 */
export interface JournalEntryListParams extends ListParams {
  appId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

/**
 * Response from listing journal entries
 */
export interface JournalEntryListResponse extends PaginatedResponse {
  journalEntries: JournalEntry[];
}

/**
 * Parameters for creating a journal entry
 */
export interface JournalEntryCreateParams {
  appId?: string;
  date: string;
  title?: string;
  description: string;
  tags?: string[];
  url?: string;
  emoji?: string;
}

/**
 * Parameters for updating a journal entry
 */
export interface JournalEntryUpdateParams
  extends Partial<JournalEntryCreateParams> {}

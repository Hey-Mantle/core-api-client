import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing journal entries
 */
export class JournalEntriesResource extends BaseResource {
  /**
   * List journal entries with optional filters and pagination
   */
  async list(params?: paths['/journal_entries']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/journal_entries', { params: { query: params } }));
  }

  /**
   * Get a single journal entry by ID
   */
  async get(entryId: string, params?: paths['/journal_entries/{id}']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/journal_entries/{id}', { params: { path: { id: entryId }, query: params } }));
  }

  /**
   * Create a new journal entry
   */
  async create(data: paths['/journal_entries']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/journal_entries', { body: data }));
  }

  /**
   * Update an existing journal entry
   */
  async update(entryId: string, data: paths['/journal_entries/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/journal_entries/{id}', { params: { path: { id: entryId } }, body: data }));
  }

  /**
   * Delete a journal entry
   */
  async del(entryId: string) {
    return this.unwrap(this.api.DELETE('/journal_entries/{id}', { params: { path: { id: entryId } } }));
  }
}

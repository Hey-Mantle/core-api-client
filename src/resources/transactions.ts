import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing transactions
 */
export class TransactionsResource extends BaseResource {
  /**
   * List transactions with optional filters and pagination
   */
  async list(params?: paths['/transactions']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/transactions', { params: { query: params } }));
  }

  /**
   * Get a single transaction by ID
   */
  async get(transactionId: string) {
    return this.unwrap(this.api.GET('/transactions/{id}', { params: { path: { id: transactionId } } }));
  }
}

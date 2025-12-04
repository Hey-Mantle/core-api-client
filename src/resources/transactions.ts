import { BaseResource } from './base';
import type {
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from '../types';

/**
 * Resource for managing transactions
 */
export class TransactionsResource extends BaseResource {
  /**
   * List transactions with optional filters and pagination
   */
  async list(params?: TransactionListParams): Promise<TransactionListResponse> {
    const response = await this.get<TransactionListResponse>(
      '/transactions',
      params
    );
    return {
      transactions: response.transactions || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single transaction by ID
   */
  async retrieve(transactionId: string): Promise<{ transaction: Transaction }> {
    return this.get<{ transaction: Transaction }>(
      `/transactions/${transactionId}`
    );
  }
}

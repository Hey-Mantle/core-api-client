import { BaseResource } from './base';
import type { ChargeListParams, ChargeListResponse } from '../types';

/**
 * Resource for managing charges
 */
export class ChargesResource extends BaseResource {
  /**
   * List charges with optional filters and pagination
   */
  async list(params?: ChargeListParams): Promise<ChargeListResponse> {
    const response = await this.get<ChargeListResponse>('/charges', params);
    return {
      charges: response.charges || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }
}

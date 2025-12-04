import { BaseResource } from './base';
import type {
  AffiliatePayout,
  AffiliatePayoutListParams,
  AffiliatePayoutListResponse,
} from '../types';

/**
 * Resource for managing affiliate payouts
 */
export class AffiliatePayoutsResource extends BaseResource {
  /**
   * List affiliate payouts with optional filters and pagination
   */
  async list(
    params?: AffiliatePayoutListParams
  ): Promise<AffiliatePayoutListResponse> {
    const response = await this.get<AffiliatePayoutListResponse>(
      '/affiliate_payouts',
      params
    );
    return {
      payouts: response.payouts || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single affiliate payout by ID
   */
  async retrieve(payoutId: string): Promise<{ payout: AffiliatePayout }> {
    return this.get<{ payout: AffiliatePayout }>(
      `/affiliate_payouts/${payoutId}`
    );
  }
}

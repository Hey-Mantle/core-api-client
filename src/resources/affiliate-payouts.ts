import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing affiliate payouts
 */
export class AffiliatePayoutsResource extends BaseResource {
  /**
   * List affiliate payouts with optional filters and pagination
   */
  async list(params?: paths['/affiliate_payouts']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/affiliate_payouts', { params: { query: params } }));
  }

  /**
   * Retrieve a single affiliate payout by ID
   */
  async retrieve(payoutId: string) {
    return this.unwrap(this.api.GET('/affiliate_payouts/{id}', { params: { path: { id: payoutId } } }));
  }
}

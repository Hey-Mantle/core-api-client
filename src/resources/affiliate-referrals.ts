import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing affiliate referrals
 */
export class AffiliateReferralsResource extends BaseResource {
  /**
   * List affiliate referrals with optional filters and pagination
   */
  async list(params?: paths['/affiliate_referrals']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/affiliate_referrals', { params: { query: params } }));
  }

  /**
   * Retrieve a single affiliate referral by ID
   */
  async retrieve(referralId: string) {
    return this.unwrap(this.api.GET('/affiliate_referrals/{id}', { params: { path: { id: referralId } } }));
  }
}

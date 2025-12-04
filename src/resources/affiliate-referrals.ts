import { BaseResource } from './base';
import type {
  AffiliateReferral,
  AffiliateReferralListParams,
  AffiliateReferralListResponse,
} from '../types';

/**
 * Resource for managing affiliate referrals
 */
export class AffiliateReferralsResource extends BaseResource {
  /**
   * List affiliate referrals with optional filters and pagination
   */
  async list(
    params?: AffiliateReferralListParams
  ): Promise<AffiliateReferralListResponse> {
    const response = await this.get<AffiliateReferralListResponse>(
      '/affiliate_referrals',
      params
    );
    return {
      referrals: response.referrals || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single affiliate referral by ID
   */
  async retrieve(referralId: string): Promise<{ referral: AffiliateReferral }> {
    return this.get<{ referral: AffiliateReferral }>(
      `/affiliate_referrals/${referralId}`
    );
  }
}

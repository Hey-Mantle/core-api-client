import { BaseResource } from './base';
import type {
  AffiliateCommission,
  AffiliateCommissionListParams,
  AffiliateCommissionListResponse,
} from '../types';

/**
 * Resource for managing affiliate commissions
 */
export class AffiliateCommissionsResource extends BaseResource {
  /**
   * List affiliate commissions with optional filters and pagination
   */
  async list(
    params?: AffiliateCommissionListParams
  ): Promise<AffiliateCommissionListResponse> {
    const response = await this.get<AffiliateCommissionListResponse>(
      '/affiliate_commissions',
      params
    );
    return {
      commissions: response.commissions || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single affiliate commission by ID
   */
  async retrieve(
    commissionId: string
  ): Promise<{ commission: AffiliateCommission }> {
    return this.get<{ commission: AffiliateCommission }>(
      `/affiliate_commissions/${commissionId}`
    );
  }
}

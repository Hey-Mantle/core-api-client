import { BaseResource } from './base';
import type {
  Affiliate,
  AffiliateListParams,
  AffiliateListResponse,
  AffiliateUpdateParams,
} from '../types';

/**
 * Resource for managing affiliates
 */
export class AffiliatesResource extends BaseResource {
  /**
   * List affiliates with optional filters and pagination
   */
  async list(params?: AffiliateListParams): Promise<AffiliateListResponse> {
    const response = await this.get<AffiliateListResponse>(
      '/affiliates',
      params
    );
    return {
      affiliates: response.affiliates || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single affiliate by ID
   */
  async retrieve(affiliateId: string): Promise<{ affiliate: Affiliate }> {
    return this.get<{ affiliate: Affiliate }>(`/affiliates/${affiliateId}`);
  }

  /**
   * Update an existing affiliate
   */
  async update(
    affiliateId: string,
    data: AffiliateUpdateParams
  ): Promise<{ affiliate: Affiliate }> {
    return this.put<{ affiliate: Affiliate }>(
      `/affiliates/${affiliateId}`,
      data
    );
  }
}

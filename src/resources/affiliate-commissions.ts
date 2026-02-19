import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing affiliate commissions
 */
export class AffiliateCommissionsResource extends BaseResource {
  /**
   * List affiliate commissions with optional filters and pagination
   */
  async list(params?: paths['/affiliate_commissions']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/affiliate_commissions', { params: { query: params } }));
  }

  /**
   * Retrieve a single affiliate commission by ID
   */
  async retrieve(commissionId: string) {
    return this.unwrap(this.api.GET('/affiliate_commissions/{id}', { params: { path: { id: commissionId } } }));
  }
}

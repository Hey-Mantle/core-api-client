import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing affiliates
 */
export class AffiliatesResource extends BaseResource {
  /**
   * List affiliates with optional filters and pagination
   */
  async list(params?: paths['/affiliates']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/affiliates', { params: { query: params } }));
  }

  /**
   * Get a single affiliate by ID
   */
  async get(affiliateId: string) {
    return this.unwrap(this.api.GET('/affiliates/{id}', { params: { path: { id: affiliateId } } }));
  }

  /**
   * Update an existing affiliate
   * Note: PUT not in OpenAPI spec but kept for backwards compatibility
   */
  async update(affiliateId: string, data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.PUT('/affiliates/{id}', { params: { path: { id: affiliateId } }, body: data }));
  }
}

import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing customer segments
 */
export class CustomerSegmentsResource extends BaseResource {
  /**
   * List public customer segments with optional pagination
   */
  async list(params?: paths['/customer_segments']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/customer_segments', { params: { query: params } }));
  }

  /**
   * Get a single customer segment by ID
   */
  async get(segmentId: string) {
    return this.unwrap(this.api.GET('/customer_segments/{id}', { params: { path: { id: segmentId } } }));
  }
}

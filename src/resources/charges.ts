import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing charges
 */
export class ChargesResource extends BaseResource {
  /**
   * List charges with optional filters and pagination
   */
  async list(params?: paths['/charges']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/charges', { params: { query: params } }));
  }
}

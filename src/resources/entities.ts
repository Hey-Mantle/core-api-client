import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for unified entity search across contacts and customers
 */
export class EntitiesResource extends BaseResource {
  /**
   * Search across contacts and customers
   * Returns entities with a _type discriminator field
   */
  async search(params?: paths['/entities']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/entities', { params: { query: params } }));
  }
}

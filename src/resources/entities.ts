import { BaseResource } from './base';
import type { EntitiesSearchParams, EntitiesSearchResponse } from '../types';

/**
 * Resource for unified entity search across contacts and customers
 */
export class EntitiesResource extends BaseResource {
  /**
   * Search across contacts and customers
   * Returns entities with a _type discriminator field
   */
  async search(params?: EntitiesSearchParams): Promise<EntitiesSearchResponse> {
    const response = await this.get<EntitiesSearchResponse>('/entities', params);
    return {
      entities: response.entities || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }
}

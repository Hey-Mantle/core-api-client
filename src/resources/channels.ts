import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing CX channels
 */
export class ChannelsResource extends BaseResource {
  /**
   * List CX channels with optional filters
   */
  async list(params?: paths['/channels']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/channels', { params: { query: params } }));
  }

  /**
   * Create a new CX channel
   */
  async create(data: paths['/channels']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/channels', { body: data }));
  }
}

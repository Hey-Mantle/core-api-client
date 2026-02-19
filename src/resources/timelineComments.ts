import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing timeline comments
 */
export class TimelineCommentsResource extends BaseResource {
  /**
   * List timeline comments with optional filters and pagination
   */
  async list(params?: paths['/timeline_comments']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/timeline_comments', { params: { query: params } }));
  }

  /**
   * Retrieve a single timeline comment by ID
   */
  async retrieve(id: string) {
    return this.unwrap(this.api.GET('/timeline_comments/{id}', { params: { path: { id } } }));
  }

  /**
   * Create a new timeline comment
   */
  async create(data: paths['/timeline_comments']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/timeline_comments', { body: data }));
  }

  /**
   * Update an existing timeline comment
   */
  async update(id: string, data: paths['/timeline_comments/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/timeline_comments/{id}', { params: { path: { id } }, body: data }));
  }

  /**
   * Delete a timeline comment
   */
  async del(id: string, data?: NonNullable<paths['/timeline_comments/{id}']['delete']['requestBody']>['content']['application/json']) {
    return this.unwrap(this.api.DELETE('/timeline_comments/{id}', { params: { path: { id } }, body: data }));
  }
}

import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing organization users
 */
export class UsersResource extends BaseResource {
  /**
   * List organization users with optional pagination
   */
  async list(params?: paths['/users']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/users', { params: { query: params } }));
  }

  /**
   * Retrieve a single user by ID
   */
  async retrieve(userId: string) {
    return this.unwrap(this.api.GET('/users/{id}', { params: { path: { id: userId } } }));
  }
}

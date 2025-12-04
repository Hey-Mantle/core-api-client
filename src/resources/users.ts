import { BaseResource } from './base';
import type { User, UserListParams, UserListResponse } from '../types';

/**
 * Resource for managing organization users
 */
export class UsersResource extends BaseResource {
  /**
   * List organization users with optional pagination
   */
  async list(params?: UserListParams): Promise<UserListResponse> {
    const response = await this.get<UserListResponse>('/users', params);
    return {
      users: response.users || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single user by ID
   */
  async retrieve(userId: string): Promise<{ user: User }> {
    return this.get<{ user: User }>(`/users/${userId}`);
  }
}

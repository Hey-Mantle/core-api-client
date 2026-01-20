import { BaseResource } from './base';
import type {
  List,
  ListListParams,
  ListListResponse,
  ListRetrieveParams,
  ListRetrieveResponse,
  ListCreateParams,
  ListUpdateParams,
  ListAddEntitiesParams,
  ListAddEntitiesResponse,
  ListRemoveEntitiesParams,
  ListRemoveEntitiesResponse,
} from '../types';
import type { DeleteResponse } from '../types/common';

export class ListsResource extends BaseResource {
  /**
   * List all lists
   *
   * @param params - Optional list parameters
   * @returns Paginated list of lists
   */
  async list(params?: ListListParams): Promise<ListListResponse> {
    const response = await this.get<ListListResponse>('/lists', params);
    return {
      lists: response.lists || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
    };
  }

  /**
   * Retrieve a specific list with its entities
   *
   * @param listId - The ID of the list
   * @param params - Optional parameters to filter entities
   * @returns The list with its entities
   */
  async retrieve(listId: string, params?: ListRetrieveParams): Promise<ListRetrieveResponse> {
    const response = await this.get<ListRetrieveResponse>(`/lists/${listId}`, params);
    return {
      list: response.list,
      entities: response.entities || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
    };
  }

  /**
   * Create a new list
   *
   * @param data - List creation parameters
   * @returns The created list
   */
  async create(data: ListCreateParams): Promise<{ list: List }> {
    return this.post<{ list: List }>('/lists', data);
  }

  /**
   * Update an existing list
   *
   * @param listId - The ID of the list to update
   * @param data - List update parameters
   * @returns The updated list
   */
  async update(listId: string, data: ListUpdateParams): Promise<{ list: List }> {
    return this.put<{ list: List }>(`/lists/${listId}`, data);
  }

  /**
   * Delete a list
   *
   * @param listId - The ID of the list to delete
   * @returns Delete confirmation
   */
  async del(listId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/lists/${listId}`);
  }

  /**
   * Add customers and/or contacts to a list
   *
   * @param listId - The ID of the list
   * @param data - IDs of customers and/or contacts to add
   * @returns Count of added and skipped entities
   */
  async addEntities(listId: string, data: ListAddEntitiesParams): Promise<ListAddEntitiesResponse> {
    return this.post<ListAddEntitiesResponse>(`/lists/${listId}/add`, data);
  }

  /**
   * Remove customers and/or contacts from a list
   *
   * @param listId - The ID of the list
   * @param data - IDs of customers and/or contacts to remove
   * @returns Count of removed entities
   */
  async removeEntities(listId: string, data: ListRemoveEntitiesParams): Promise<ListRemoveEntitiesResponse> {
    return this.post<ListRemoveEntitiesResponse>(`/lists/${listId}/remove`, data);
  }
}

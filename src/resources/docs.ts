import { BaseResource } from './base';
import type {
  DocCollection,
  DocCollectionCreateParams,
  DocCollectionUpdateParams,
  DocGroup,
  DocGroupCreateParams,
  DocGroupUpdateParams,
  DocPage,
  DocPageListParams,
  DocPageListResponse,
  DocPageCreateParams,
  DocPageUpdateParams,
  DocTreeResponse,
  DocRepository,
  DocRepositoryListParams,
  DocRepositoryListResponse,
  DocRepositoryRetrieveParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing documentation (collections, groups, pages)
 */
export class DocsResource extends BaseResource {
  // ========== Collections ==========

  /**
   * List all doc collections
   */
  async listCollections(): Promise<{ collections: DocCollection[] }> {
    return this.get<{ collections: DocCollection[] }>('/docs/collections');
  }

  /**
   * Retrieve a single doc collection
   */
  async retrieveCollection(
    collectionId: string
  ): Promise<{ collection: DocCollection }> {
    return this.get<{ collection: DocCollection }>(
      `/docs/collections/${collectionId}`
    );
  }

  /**
   * Create a new doc collection
   */
  async createCollection(
    data: DocCollectionCreateParams
  ): Promise<{ collection: DocCollection }> {
    return this.post<{ collection: DocCollection }>('/docs/collections', data);
  }

  /**
   * Update a doc collection
   */
  async updateCollection(
    collectionId: string,
    data: DocCollectionUpdateParams
  ): Promise<{ collection: DocCollection }> {
    return this.put<{ collection: DocCollection }>(
      `/docs/collections/${collectionId}`,
      data
    );
  }

  /**
   * Delete a doc collection
   */
  async deleteCollection(collectionId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/docs/collections/${collectionId}`);
  }

  // ========== Groups ==========

  /**
   * List all doc groups
   */
  async listGroups(): Promise<{ groups: DocGroup[] }> {
    return this.get<{ groups: DocGroup[] }>('/docs/groups');
  }

  /**
   * Retrieve a single doc group
   */
  async retrieveGroup(groupId: string): Promise<{ group: DocGroup }> {
    return this.get<{ group: DocGroup }>(`/docs/groups/${groupId}`);
  }

  /**
   * Create a new doc group
   */
  async createGroup(data: DocGroupCreateParams): Promise<{ group: DocGroup }> {
    return this.post<{ group: DocGroup }>('/docs/groups', data);
  }

  /**
   * Update a doc group
   */
  async updateGroup(
    groupId: string,
    data: DocGroupUpdateParams
  ): Promise<{ group: DocGroup }> {
    return this.put<{ group: DocGroup }>(`/docs/groups/${groupId}`, data);
  }

  /**
   * Delete a doc group
   */
  async deleteGroup(groupId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/docs/groups/${groupId}`);
  }

  // ========== Pages ==========

  /**
   * List doc pages with optional filters
   */
  async listPages(params?: DocPageListParams): Promise<DocPageListResponse> {
    const response = await this.get<DocPageListResponse>('/docs/pages', params);
    return {
      pages: response.pages || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
    };
  }

  /**
   * Retrieve a single doc page
   */
  async retrievePage(pageId: string): Promise<{ page: DocPage }> {
    return this.get<{ page: DocPage }>(`/docs/pages/${pageId}`);
  }

  /**
   * Create a new doc page
   */
  async createPage(data: DocPageCreateParams): Promise<{ page: DocPage }> {
    return this.post<{ page: DocPage }>('/docs/pages', data);
  }

  /**
   * Update a doc page
   */
  async updatePage(
    pageId: string,
    data: DocPageUpdateParams
  ): Promise<{ page: DocPage }> {
    return this.put<{ page: DocPage }>(`/docs/pages/${pageId}`, data);
  }

  /**
   * Publish a doc page
   */
  async publishPage(pageId: string): Promise<{ page: DocPage }> {
    return this.post<{ page: DocPage }>(`/docs/pages/${pageId}/publish`, {});
  }

  /**
   * Archive a doc page
   */
  async archivePage(pageId: string): Promise<{ page: DocPage }> {
    return this.post<{ page: DocPage }>(`/docs/pages/${pageId}/archive`, {});
  }

  /**
   * Delete a doc page
   */
  async deletePage(pageId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/docs/pages/${pageId}`);
  }

  // ========== Tree ==========

  /**
   * Get the full documentation tree structure
   */
  async getTree(): Promise<DocTreeResponse> {
    return this.get<DocTreeResponse>('/docs/tree');
  }

  // ========== Repositories ==========

  /**
   * List all doc repositories
   */
  async listRepositories(
    params?: DocRepositoryListParams
  ): Promise<DocRepositoryListResponse> {
    const response = await this.get<DocRepositoryListResponse>(
      '/docs/repositories',
      params
    );
    return {
      repositories: response.repositories || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single doc repository
   */
  async retrieveRepository(
    repositoryId: string,
    params?: DocRepositoryRetrieveParams
  ): Promise<{ repository: DocRepository }> {
    return this.get<{ repository: DocRepository }>(
      `/docs/repositories/${repositoryId}`,
      params
    );
  }
}

import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class DocsResource extends BaseResource {
  // Collections
  async listCollections(params: paths['/docs/collections']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/docs/collections', { params: { query: params } }));
  }

  async createCollection(data: paths['/docs/collections']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/docs/collections', { body: data }));
  }

  async updateCollection(collectionId: string, data: paths['/docs/collections/{collection_id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/docs/collections/{collection_id}', { params: { path: { collection_id: collectionId } }, body: data }));
  }

  async deleteCollection(collectionId: string) {
    return this.unwrap(this.api.DELETE('/docs/collections/{collection_id}', { params: { path: { collection_id: collectionId } } }));
  }

  // Groups
  async listGroups(params: paths['/docs/groups']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/docs/groups', { params: { query: params } }));
  }

  async createGroup(data: paths['/docs/groups']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/docs/groups', { body: data }));
  }

  async updateGroup(groupId: string, data: paths['/docs/groups/{group_id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/docs/groups/{group_id}', { params: { path: { group_id: groupId } }, body: data }));
  }

  async deleteGroup(groupId: string) {
    return this.unwrap(this.api.DELETE('/docs/groups/{group_id}', { params: { path: { group_id: groupId } } }));
  }

  // Pages
  async listPages(params?: paths['/docs/pages']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/docs/pages', { params: { query: params } }));
  }

  async getPage(pageId: string) {
    return this.unwrap(this.api.GET('/docs/pages/{page_id}', { params: { path: { page_id: pageId } } }));
  }

  async createPage(data: paths['/docs/pages']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/docs/pages', { body: data }));
  }

  async updatePage(pageId: string, data: paths['/docs/pages/{page_id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/docs/pages/{page_id}', { params: { path: { page_id: pageId } }, body: data }));
  }

  async deletePage(pageId: string) {
    return this.unwrap(this.api.DELETE('/docs/pages/{page_id}', { params: { path: { page_id: pageId } } }));
  }

  // Repositories
  async listRepositories(params?: paths['/docs/repositories']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/docs/repositories', { params: { query: params } }));
  }

  async getRepository(repositoryId: string, params?: paths['/docs/repositories/{id}']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/docs/repositories/{id}', { params: { path: { id: repositoryId }, query: params } }));
  }
}

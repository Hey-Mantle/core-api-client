import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class ListsResource extends BaseResource {
  async list(params?: paths['/lists']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/lists', { params: { query: params } }));
  }

  async retrieve(listId: string) {
    return this.unwrap(this.api.GET('/lists/{id}', { params: { path: { id: listId } } }));
  }

  async create(data: paths['/lists']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/lists', { body: data }));
  }

  async update(listId: string, data: paths['/lists/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/lists/{id}', { params: { path: { id: listId } }, body: data }));
  }

  async del(listId: string) {
    return this.unwrap(this.api.DELETE('/lists/{id}', { params: { path: { id: listId } } }));
  }

  async addEntities(listId: string, data: paths['/lists/{id}/add']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/lists/{id}/add', { params: { path: { id: listId } }, body: data }));
  }

  async removeEntities(listId: string, data: paths['/lists/{id}/remove']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/lists/{id}/remove', { params: { path: { id: listId } }, body: data }));
  }
}

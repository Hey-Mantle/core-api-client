import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class ContactsResource extends BaseResource {
  async list(params?: paths['/contacts']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/contacts', { params: { query: params } }));
  }

  async get(contactId: string) {
    return this.unwrap(this.api.GET('/contacts/{id}', { params: { path: { id: contactId } } }));
  }

  async create(data: paths['/contacts']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/contacts', { body: data }));
  }

  async update(contactId: string, data: paths['/contacts/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/contacts/{id}', { params: { path: { id: contactId } }, body: data }));
  }

  async del(contactId: string) {
    return this.unwrap(this.api.DELETE('/contacts/{id}', { params: { path: { id: contactId } } }));
  }

  async addTags(contactId: string, tags: string[]) {
    return this.unwrap(this.api.POST('/contacts/{id}/addTags', { params: { path: { id: contactId } }, body: { tags } as never }));
  }

  async removeTags(contactId: string, tags: string[]) {
    return this.unwrap(this.api.POST('/contacts/{id}/removeTags', { params: { path: { id: contactId } }, body: { tags } as never }));
  }
}

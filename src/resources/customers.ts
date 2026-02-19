import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class CustomersResource extends BaseResource {
  async list(params?: paths['/customers']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/customers', { params: { query: params } }));
  }

  async retrieve(customerId: string) {
    return this.unwrap(this.api.GET('/customers/{id}', { params: { path: { id: customerId } } }));
  }

  async create(data: NonNullable<paths['/customers']['post']['requestBody']>['content']['application/json']) {
    return this.unwrap(this.api.POST('/customers', { body: data }));
  }

  async update(customerId: string, data: NonNullable<paths['/customers/{id}']['put']['requestBody']>['content']['application/json']) {
    return this.unwrap(this.api.PUT('/customers/{id}', { params: { path: { id: customerId } }, body: data }));
  }

  async addTags(customerId: string, tags: string[]) {
    return this.unwrap(this.api.POST('/customers/{id}/addTags', { params: { path: { id: customerId } }, body: { tags } as never }));
  }

  async removeTags(customerId: string, tags: string[]) {
    return this.unwrap(this.api.POST('/customers/{id}/removeTags', { params: { path: { id: customerId } }, body: { tags } as never }));
  }

  async getTimeline(customerId: string, params?: paths['/customers/{id}/timeline']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/customers/{id}/timeline', { params: { path: { id: customerId }, query: params } }));
  }

  async listAccountOwners(customerId: string) {
    return this.unwrap(this.api.GET('/customers/{id}/account_owners', { params: { path: { id: customerId } } }));
  }

  async addAccountOwner(customerId: string, data: paths['/customers/{id}/account_owners']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/customers/{id}/account_owners', { params: { path: { id: customerId } }, body: data }));
  }

  async removeAccountOwner(customerId: string, ownerId: string) {
    return this.unwrap(this.api.DELETE('/customers/{id}/account_owners/{ownerId}', { params: { path: { id: customerId, ownerId } } }));
  }

  async listCustomFields(params?: paths['/customers/custom_fields']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/customers/custom_fields', { params: { query: params } }));
  }

  async createCustomField(data: paths['/customers/custom_fields']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/customers/custom_fields', { body: data }));
  }

  async retrieveCustomField(fieldId: string) {
    return this.unwrap(this.api.GET('/customers/custom_fields/{id}', { params: { path: { id: fieldId } } }));
  }

  async updateCustomField(fieldId: string, data: paths['/customers/custom_fields/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/customers/custom_fields/{id}', { params: { path: { id: fieldId } }, body: data }));
  }

  async deleteCustomField(fieldId: string) {
    return this.unwrap(this.api.DELETE('/customers/custom_fields/{id}', { params: { path: { id: fieldId } } }));
  }
}

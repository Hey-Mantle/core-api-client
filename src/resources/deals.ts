import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class DealsResource extends BaseResource {
  async list(params?: paths['/deals']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/deals', { params: { query: params } }));
  }

  async retrieve(dealId: string) {
    return this.unwrap(this.api.GET('/deals/{id}', { params: { path: { id: dealId } } }));
  }

  async create(data: paths['/deals']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/deals', { body: data }));
  }

  async update(dealId: string, data: paths['/deals/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/deals/{id}', { params: { path: { id: dealId } }, body: data }));
  }

  async del(dealId: string) {
    return this.unwrap(this.api.DELETE('/deals/{id}', { params: { path: { id: dealId } } }));
  }

  async timeline(dealId: string) {
    return this.unwrap(this.api.GET('/deals/{id}/timeline', { params: { path: { id: dealId } } }));
  }

  async listEvents(dealId: string) {
    return this.unwrap(this.api.GET('/deals/{id}/events', { params: { path: { id: dealId } } }));
  }

  async createEvent(dealId: string, data: paths['/deals/{id}/events']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/deals/{id}/events', { params: { path: { id: dealId } }, body: data }));
  }
}

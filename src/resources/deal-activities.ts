import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class DealActivitiesResource extends BaseResource {
  async list(params?: paths['/deal_activities']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/deal_activities', { params: { query: params } }));
  }

  async retrieve(dealActivityId: string) {
    return this.unwrap(this.api.GET('/deal_activities/{id}', { params: { path: { id: dealActivityId } } }));
  }

  async create(data: paths['/deal_activities']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/deal_activities', { body: data }));
  }

  async update(dealActivityId: string, data: paths['/deal_activities/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/deal_activities/{id}', { params: { path: { id: dealActivityId } }, body: data }));
  }

  async del(dealActivityId: string) {
    return this.unwrap(this.api.DELETE('/deal_activities/{id}', { params: { path: { id: dealActivityId } } }));
  }
}

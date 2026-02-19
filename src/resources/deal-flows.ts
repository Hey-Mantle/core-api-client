import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class DealFlowsResource extends BaseResource {
  async list(params?: paths['/deal_flows']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/deal_flows', { params: { query: params } }));
  }

  async get(dealFlowId: string) {
    return this.unwrap(this.api.GET('/deal_flows/{id}', { params: { path: { id: dealFlowId } } }));
  }

  async create(data: paths['/deal_flows']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/deal_flows', { body: data }));
  }

  async update(dealFlowId: string, data: paths['/deal_flows/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/deal_flows/{id}', { params: { path: { id: dealFlowId } }, body: data }));
  }

  async del(dealFlowId: string) {
    return this.unwrap(this.api.DELETE('/deal_flows/{id}', { params: { path: { id: dealFlowId } } }));
  }
}

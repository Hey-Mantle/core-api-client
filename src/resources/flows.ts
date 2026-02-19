import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing flows (email/automation)
 */
export class FlowsResource extends BaseResource {
  /**
   * List flows with optional filters and pagination
   */
  async list(params?: paths['/flows']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/flows', { params: { query: params } }));
  }

  /**
   * Get a single flow by ID
   */
  async get(flowId: string) {
    return this.unwrap(this.api.GET('/flows/{id}', { params: { path: { id: flowId } } }));
  }

  /**
   * Create a new flow
   */
  async create(data: paths['/flows']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/flows', { body: data }));
  }

  /**
   * Update an existing flow
   */
  async update(flowId: string, data: paths['/flows/{id}']['patch']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PATCH('/flows/{id}', { params: { path: { id: flowId } }, body: data }));
  }

  /**
   * Delete a flow
   */
  async del(flowId: string) {
    return this.unwrap(this.api.DELETE('/flows/{id}', { params: { path: { id: flowId } } }));
  }
}

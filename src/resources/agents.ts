import { BaseResource } from './base';

/**
 * Resource for CX support agents.
 * Note: /agents is not yet in the OpenAPI spec.
 */
export class AgentsResource extends BaseResource {
  async list() {
    return this.unwrap(this.untypedApi.GET('/agents', {}));
  }

  async get(agentId: string) {
    return this.unwrap(this.untypedApi.GET('/agents/{id}', { params: { path: { id: agentId } } }));
  }

  async create(params: { email: string; name?: string }) {
    return this.unwrap(this.untypedApi.POST('/agents', { body: params }));
  }

  async findOrCreate(params: { email: string; name?: string }) {
    return this.unwrap(this.untypedApi.POST('/agents/find_or_create', { body: params }));
  }
}

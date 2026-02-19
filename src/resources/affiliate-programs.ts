import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing affiliate programs
 */
export class AffiliateProgramsResource extends BaseResource {
  /**
   * List affiliate programs with optional filters and pagination
   */
  async list(params?: paths['/affiliate_programs']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/affiliate_programs', { params: { query: params } }));
  }

  /**
   * Get a single affiliate program by ID
   */
  async get(programId: string) {
    return this.unwrap(this.api.GET('/affiliate_programs/{id}', { params: { path: { id: programId } } }));
  }

  /**
   * Create a new affiliate program
   * Note: POST not yet in OpenAPI spec
   */
  async create(data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.POST('/affiliate_programs', { body: data }));
  }

  /**
   * Update an existing affiliate program
   * Note: PUT not yet in OpenAPI spec
   */
  async update(programId: string, data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.PUT('/affiliate_programs/{id}', { params: { path: { id: programId } }, body: data }));
  }

  /**
   * Delete an affiliate program
   * Note: DELETE not yet in OpenAPI spec
   */
  async del(programId: string) {
    return this.unwrap(this.untypedApi.DELETE('/affiliate_programs/{id}', { params: { path: { id: programId } } }));
  }
}

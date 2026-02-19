import { BaseResource } from './base';
import type { paths } from '../generated/api';

/**
 * Resource for managing companies
 */
export class CompaniesResource extends BaseResource {
  /**
   * List companies with optional pagination
   */
  async list(params?: paths['/companies']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/companies', { params: { query: params } }));
  }

  /**
   * Retrieve a single company by ID
   */
  async retrieve(companyId: string) {
    return this.unwrap(this.api.GET('/companies/{id}', { params: { path: { id: companyId } } }));
  }

  /**
   * Create a new company
   */
  async create(data: paths['/companies']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/companies', { body: data }));
  }

  /**
   * Update an existing company
   */
  async update(companyId: string, data: paths['/companies/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/companies/{id}', { params: { path: { id: companyId } }, body: data }));
  }

  /**
   * Delete a company
   */
  async del(companyId: string) {
    return this.unwrap(this.api.DELETE('/companies/{id}', { params: { path: { id: companyId } } }));
  }
}

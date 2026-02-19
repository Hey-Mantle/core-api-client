import { BaseResource } from './base';

/**
 * Resource for getting organization info
 */
export class OrganizationResource extends BaseResource {
  /**
   * Get organization details
   */
  async get() {
    return this.unwrap(this.api.GET('/organization'));
  }
}

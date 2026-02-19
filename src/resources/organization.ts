import { BaseResource } from './base';

/**
 * Resource for retrieving organization info
 */
export class OrganizationResource extends BaseResource {
  /**
   * Get organization details
   */
  async retrieve() {
    return this.unwrap(this.api.GET('/organization'));
  }
}

import { BaseResource } from './base';
import type { Organization } from '../types';

/**
 * Resource for retrieving organization info
 */
export class OrganizationResource extends BaseResource {
  /**
   * Get organization details
   */
  async retrieve(): Promise<{ organization: Organization }> {
    return this.client.get<{ organization: Organization }>('/organization');
  }
}

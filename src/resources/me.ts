import { BaseResource } from './base';

/**
 * Resource for the current user endpoint.
 * Note: /me is not yet in the OpenAPI spec.
 */
export class MeResource extends BaseResource {
  async retrieve() {
    return this.unwrap(this.untypedApi.GET('/me', {}));
  }
}

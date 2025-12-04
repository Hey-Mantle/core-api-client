import { BaseResource } from './base';
import type { MeResponse } from '../types';

/**
 * Resource for retrieving current user and organization info
 */
export class MeResource extends BaseResource {
  /**
   * Get current user and organization info
   */
  async retrieve(): Promise<MeResponse> {
    return this.client.get<MeResponse>('/me');
  }
}

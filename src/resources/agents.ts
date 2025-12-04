import { BaseResource } from './base';
import type { AgentListResponse } from '../types';

/**
 * Resource for managing support agents
 */
export class AgentsResource extends BaseResource {
  /**
   * List support agents
   */
  async list(): Promise<AgentListResponse> {
    return this.get<AgentListResponse>('/agents');
  }
}

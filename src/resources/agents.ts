import { BaseResource } from './base';
import type {
  AgentListResponse,
  AgentCreateParams,
  AgentResponse,
} from '../types';
import { MantleAPIError } from '../utils/errors';

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

  /**
   * Retrieve a specific agent by ID
   */
  async retrieve(agentId: string): Promise<AgentResponse> {
    return this.get<AgentResponse>(`/agents/${agentId}`);
  }

  /**
   * Create a new agent
   */
  async create(params: AgentCreateParams): Promise<AgentResponse> {
    return this.post<AgentResponse>('/agents', params);
  }

  /**
   * Find an existing agent by email, or create one if not found.
   * This is useful for sync operations where you want to ensure
   * an agent exists without duplicating.
   *
   * @param params - Agent data (email required, name optional)
   * @returns The existing or newly created agent
   */
  async findOrCreate(params: AgentCreateParams): Promise<AgentResponse> {
    try {
      // First, try to create the agent
      return await this.create(params);
    } catch (error) {
      // If we get a 409 (conflict), the agent already exists
      if (error instanceof MantleAPIError && error.statusCode === 409) {
        // Search for the agent by email
        const { agents } = await this.list();
        const existingAgent = agents.find(
          (agent) => agent.email.toLowerCase() === params.email.toLowerCase()
        );

        if (existingAgent) {
          return { agent: existingAgent };
        }
      }

      // Re-throw any other error
      throw error;
    }
  }
}

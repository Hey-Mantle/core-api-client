import { BaseResource } from './base';
import type {
  AgentRun,
  AgentRunCreateParams,
  AgentRunCreateResponse,
  AgentRunRetrieveResponse,
} from '../types/ai-agents';

/**
 * Resource for managing AI agent runs
 */
export class AIAgentRunsResource extends BaseResource {
  /**
   * Create a new AI agent run
   * Returns 202 Accepted as the run executes asynchronously
   * Poll the retrieve endpoint to check for completion
   */
  async create(
    agentId: string,
    data?: AgentRunCreateParams
  ): Promise<AgentRunCreateResponse> {
    return this.post<AgentRunCreateResponse>(
      `/ai/agents/${agentId}/runs`,
      data || {}
    );
  }

  /**
   * Retrieve the status and results of an AI agent run
   * Use this to poll for completion after creating a run
   */
  async retrieve(
    agentId: string,
    runId: string
  ): Promise<AgentRunRetrieveResponse> {
    return this.get<AgentRunRetrieveResponse>(
      `/ai/agents/${agentId}/runs/${runId}`
    );
  }

  /**
   * Create a run and poll until completion
   * Convenience method that handles the async polling pattern
   *
   * @param agentId - The ID of the AI agent
   * @param data - Optional parameters for the run
   * @param options - Polling options
   * @returns The completed agent run
   */
  async createAndWait(
    agentId: string,
    data?: AgentRunCreateParams,
    options?: {
      /** Maximum time to wait in milliseconds (default: 60000) */
      timeout?: number;
      /** Polling interval in milliseconds (default: 1000) */
      pollInterval?: number;
    }
  ): Promise<AgentRun> {
    const timeout = options?.timeout ?? 60000;
    const pollInterval = options?.pollInterval ?? 1000;
    const startTime = Date.now();

    const { run } = await this.create(agentId, data);

    while (Date.now() - startTime < timeout) {
      const { run: currentRun } = await this.retrieve(agentId, run.id);

      if (currentRun.status === 'completed' || currentRun.status === 'error') {
        return currentRun;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Agent run ${run.id} did not complete within ${timeout}ms timeout`
    );
  }
}

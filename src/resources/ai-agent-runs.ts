import { BaseResource } from './base';
import type { paths, components } from '../generated/api';

export class AiAgentRunsResource extends BaseResource {
  async create(agentId: string, data?: paths['/ai/agents/{agentId}/runs']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/ai/agents/{agentId}/runs', { params: { path: { agentId } }, body: data as never }));
  }

  async retrieve(agentId: string, runId: string) {
    return this.unwrap(this.api.GET('/ai/agents/{agentId}/runs/{runId}', { params: { path: { agentId, runId } } }));
  }

  /**
   * Create an agent run and poll until it completes or errors.
   */
  async createAndWait(
    agentId: string,
    data?: paths['/ai/agents/{agentId}/runs']['post']['requestBody']['content']['application/json'],
    options?: { timeout?: number; pollInterval?: number }
  ): Promise<components['schemas']['AgentRun']> {
    const { timeout = 300000, pollInterval = 2000 } = options || {};
    const result = await this.create(agentId, data);
    const run = (result as { run: components['schemas']['AgentRun'] }).run;
    if (!run?.id) throw new Error('Agent run ID not returned');

    const start = Date.now();
    while (Date.now() - start < timeout) {
      const response = await this.retrieve(agentId, run.id);
      const agentRun = (response as { run: components['schemas']['AgentRun'] }).run;
      if (agentRun.status === 'completed' || agentRun.status === 'error') {
        return agentRun;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    throw new Error(`Agent run timed out after ${timeout}ms`);
  }
}

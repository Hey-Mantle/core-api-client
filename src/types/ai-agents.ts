/**
 * Status of an AI agent run
 */
export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'error';

/**
 * Token usage statistics for an AI agent run
 */
export interface AgentRunTokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/**
 * AI agent run entity
 */
export interface AgentRun {
  id: string;
  agentId: string;
  status: AgentRunStatus;
  response?: string;
  structuredResponse?: Record<string, unknown>;
  error?: string;
  tokenUsage?: AgentRunTokenUsage;
  createdAt: string;
  completedAt?: string;
}

/**
 * Parameters for creating an AI agent run
 */
export interface AgentRunCreateParams {
  /** Input data to pass to the agent */
  input?: Record<string, unknown>;
  /** Context or additional instructions for the agent */
  context?: string;
  /** Variables to substitute in the agent prompt */
  variables?: Record<string, string>;
}

/**
 * Response from creating an AI agent run (returns 202 Accepted)
 */
export interface AgentRunCreateResponse {
  run: AgentRun;
}

/**
 * Response from retrieving an AI agent run
 */
export interface AgentRunRetrieveResponse {
  run: AgentRun;
}

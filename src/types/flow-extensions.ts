import type { ListParams, PaginatedResponse } from './common';

/**
 * Status of a flow action run
 */
export type FlowActionRunStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Flow extension action entity
 */
export interface FlowExtensionAction {
  id: string;
  name: string;
  description?: string;
  key: string;
  schema?: Record<string, unknown>;
  callbackUrl?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flow action run entity
 */
export interface FlowActionRun {
  id: string;
  actionId: string;
  status: FlowActionRunStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing flow extension actions
 */
export interface FlowExtensionActionListParams extends ListParams {
  enabled?: boolean;
}

/**
 * Response from listing flow extension actions
 */
export interface FlowExtensionActionListResponse extends PaginatedResponse {
  actions: FlowExtensionAction[];
}

/**
 * Parameters for creating a flow extension action
 */
export interface FlowExtensionActionCreateParams {
  name: string;
  description?: string;
  key: string;
  schema?: Record<string, unknown>;
  callbackUrl?: string;
  enabled?: boolean;
}

/**
 * Parameters for updating a flow extension action
 */
export interface FlowExtensionActionUpdateParams
  extends Partial<FlowExtensionActionCreateParams> {}

/**
 * Parameters for updating a flow action run status
 */
export interface FlowActionRunUpdateParams {
  status: FlowActionRunStatus;
  output?: Record<string, unknown>;
  error?: string;
}

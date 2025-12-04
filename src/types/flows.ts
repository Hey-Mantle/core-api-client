import type { ListParams, PaginatedResponse } from './common';

/**
 * Flow status
 */
export type FlowStatus = 'draft' | 'active' | 'paused' | 'archived';

/**
 * Flow entity (email/automation)
 */
export interface Flow {
  id: string;
  name: string;
  status: FlowStatus;
  allowRepeatRuns?: boolean;
  blockRepeatsTimeValue?: number;
  blockRepeatsTimeUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing flows
 */
export interface FlowListParams extends ListParams {
  status?: FlowStatus;
}

/**
 * Response from listing flows
 */
export interface FlowListResponse extends PaginatedResponse {
  flows: Flow[];
}

/**
 * Parameters for creating a flow
 */
export interface FlowCreateParams {
  name: string;
  allowRepeatRuns?: boolean;
  blockRepeatsTimeValue?: number;
  blockRepeatsTimeUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
}

/**
 * Parameters for updating a flow
 */
export interface FlowUpdateParams extends Partial<FlowCreateParams> {
  status?: FlowStatus;
}

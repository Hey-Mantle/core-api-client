import { BaseResource } from './base';
import type {
  Flow,
  FlowListParams,
  FlowListResponse,
  FlowCreateParams,
  FlowUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing flows (email/automation)
 */
export class FlowsResource extends BaseResource {
  /**
   * List flows with optional filters and pagination
   */
  async list(params?: FlowListParams): Promise<FlowListResponse> {
    const response = await this.get<FlowListResponse>('/flows', params);
    return {
      flows: response.flows || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single flow by ID
   */
  async retrieve(flowId: string): Promise<{ flow: Flow }> {
    return this.get<{ flow: Flow }>(`/flows/${flowId}`);
  }

  /**
   * Create a new flow
   */
  async create(data: FlowCreateParams): Promise<{ flow: Flow }> {
    return this.post<{ flow: Flow }>('/flows', data);
  }

  /**
   * Update an existing flow
   */
  async update(flowId: string, data: FlowUpdateParams): Promise<{ flow: Flow }> {
    return this.put<{ flow: Flow }>(`/flows/${flowId}`, data);
  }

  /**
   * Delete a flow
   */
  async del(flowId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/flows/${flowId}`);
  }
}

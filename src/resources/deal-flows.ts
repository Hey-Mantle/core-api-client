import { BaseResource } from './base';
import type {
  DealFlow,
  DealFlowCreateParams,
  DealFlowUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing deal flows
 */
export class DealFlowsResource extends BaseResource {
  /**
   * List all deal flows
   */
  async list(): Promise<{ dealFlows: DealFlow[] }> {
    return this.get<{ dealFlows: DealFlow[] }>('/deal_flows');
  }

  /**
   * Retrieve a single deal flow by ID
   */
  async retrieve(dealFlowId: string): Promise<{ dealFlow: DealFlow }> {
    return this.get<{ dealFlow: DealFlow }>(`/deal_flows/${dealFlowId}`);
  }

  /**
   * Create a new deal flow
   */
  async create(data: DealFlowCreateParams): Promise<{ dealFlow: DealFlow }> {
    return this.post<{ dealFlow: DealFlow }>('/deal_flows', data);
  }

  /**
   * Update an existing deal flow
   */
  async update(
    dealFlowId: string,
    data: DealFlowUpdateParams
  ): Promise<{ dealFlow: DealFlow }> {
    return this.put<{ dealFlow: DealFlow }>(
      `/deal_flows/${dealFlowId}`,
      data
    );
  }

  /**
   * Delete a deal flow
   */
  async del(dealFlowId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/deal_flows/${dealFlowId}`);
  }
}

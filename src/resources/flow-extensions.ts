import { BaseResource } from './base';
import type {
  FlowExtensionAction,
  FlowExtensionActionListParams,
  FlowExtensionActionListResponse,
  FlowExtensionActionCreateParams,
  FlowExtensionActionUpdateParams,
  FlowActionRun,
  FlowActionRunUpdateParams,
} from '../types/flow-extensions';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing flow extension actions and action runs
 */
export class FlowExtensionsResource extends BaseResource {
  // ========== Actions ==========

  /**
   * List flow extension actions
   */
  async listActions(
    params?: FlowExtensionActionListParams
  ): Promise<FlowExtensionActionListResponse> {
    const response = await this.get<FlowExtensionActionListResponse>(
      '/flow/extensions/actions',
      params
    );
    return {
      actions: response.actions || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single flow extension action
   */
  async retrieveAction(
    actionId: string
  ): Promise<{ action: FlowExtensionAction }> {
    return this.get<{ action: FlowExtensionAction }>(
      `/flow/extensions/actions/${actionId}`
    );
  }

  /**
   * Create a new flow extension action
   */
  async createAction(
    data: FlowExtensionActionCreateParams
  ): Promise<{ action: FlowExtensionAction }> {
    return this.post<{ action: FlowExtensionAction }>(
      '/flow/extensions/actions',
      data
    );
  }

  /**
   * Update an existing flow extension action
   */
  async updateAction(
    actionId: string,
    data: FlowExtensionActionUpdateParams
  ): Promise<{ action: FlowExtensionAction }> {
    return this.put<{ action: FlowExtensionAction }>(
      `/flow/extensions/actions/${actionId}`,
      data
    );
  }

  /**
   * Delete a flow extension action
   */
  async deleteAction(actionId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/flow/extensions/actions/${actionId}`
    );
  }

  // ========== Action Runs ==========

  /**
   * Update a flow action run status
   * Used to report completion or failure of async action execution
   */
  async updateActionRun(
    runId: string,
    data: FlowActionRunUpdateParams
  ): Promise<{ run: FlowActionRun }> {
    return this.put<{ run: FlowActionRun }>(`/flow/actions/runs/${runId}`, data);
  }
}

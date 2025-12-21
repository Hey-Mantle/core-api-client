import { BaseResource } from './base';
import type {
  CustomDataSetParams,
  CustomDataGetParams,
  CustomDataResponse,
  CustomDataDeleteParams,
} from '../types/custom-data';

/**
 * Resource for managing custom data on entities.
 * Custom data allows storing arbitrary key-value pairs on tickets, customers, and contacts.
 */
export class CustomDataResource extends BaseResource {
  /**
   * Set custom data on a resource.
   * This will create or update the value for the given key.
   *
   * @param params - The custom data parameters
   */
  async set(params: CustomDataSetParams): Promise<void> {
    await this.put<void>('/custom_data', params);
  }

  /**
   * Get custom data from a resource.
   *
   * @param params - Parameters identifying the custom data to retrieve
   * @returns The custom data value
   */
  async getValue(params: CustomDataGetParams): Promise<CustomDataResponse> {
    const { resourceType, resourceId, key } = params;
    return this.get<CustomDataResponse>(
      `/custom_data/${resourceType}/${resourceId}/${encodeURIComponent(key)}`
    );
  }

  /**
   * Delete custom data from a resource.
   *
   * @param params - Parameters identifying the custom data to delete
   */
  async del(params: CustomDataDeleteParams): Promise<void> {
    const { resourceType, resourceId, key } = params;
    await this._delete<void>(
      `/custom_data/${resourceType}/${resourceId}/${encodeURIComponent(key)}`
    );
  }
}

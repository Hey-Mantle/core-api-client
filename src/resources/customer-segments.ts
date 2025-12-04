import { BaseResource } from './base';
import type {
  CustomerSegment,
  CustomerSegmentListParams,
  CustomerSegmentListResponse,
} from '../types';

/**
 * Resource for managing customer segments
 */
export class CustomerSegmentsResource extends BaseResource {
  /**
   * List public customer segments with optional pagination
   */
  async list(
    params?: CustomerSegmentListParams
  ): Promise<CustomerSegmentListResponse> {
    const response = await this.get<CustomerSegmentListResponse>(
      '/customer_segments',
      params
    );
    return {
      customerSegments: response.customerSegments || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single customer segment by ID
   */
  async retrieve(
    segmentId: string
  ): Promise<{ customerSegment: CustomerSegment }> {
    return this.get<{ customerSegment: CustomerSegment }>(
      `/customer_segments/${segmentId}`
    );
  }
}

import type { ListParams, PaginatedResponse } from './common';

/**
 * Customer segment entity
 */
export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  filters?: Record<string, unknown>;
  customerCount?: number;
  public?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing customer segments
 */
export interface CustomerSegmentListParams extends ListParams {}

/**
 * Response from listing customer segments
 */
export interface CustomerSegmentListResponse extends PaginatedResponse {
  customerSegments: CustomerSegment[];
}

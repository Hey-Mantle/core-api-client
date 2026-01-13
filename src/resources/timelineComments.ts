import { BaseResource } from './base';
import type {
  TimelineComment,
  TimelineCommentListParams,
  TimelineCommentListResponse,
  TimelineCommentCreateParams,
  TimelineCommentCreateResponse,
  TimelineCommentUpdateParams,
  TimelineCommentUpdateResponse,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing timeline comments
 */
export class TimelineCommentsResource extends BaseResource {
  /**
   * List timeline comments with optional filters and pagination
   */
  async list(
    params?: TimelineCommentListParams
  ): Promise<TimelineCommentListResponse> {
    const response = await this.get<TimelineCommentListResponse>(
      '/timeline_comments',
      params
    );
    return {
      timelineComments: response.timelineComments || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single timeline comment by ID
   */
  async retrieve(id: string): Promise<{ timelineComment: TimelineComment }> {
    return this.get<{ timelineComment: TimelineComment }>(
      `/timeline_comments/${id}`
    );
  }

  /**
   * Create a new timeline comment
   */
  async create(
    data: TimelineCommentCreateParams
  ): Promise<TimelineCommentCreateResponse> {
    return this.post<TimelineCommentCreateResponse>('/timeline_comments', data);
  }

  /**
   * Update an existing timeline comment
   */
  async update(
    id: string,
    data: TimelineCommentUpdateParams
  ): Promise<TimelineCommentUpdateResponse> {
    return this.put<TimelineCommentUpdateResponse>(
      `/timeline_comments/${id}`,
      data
    );
  }

  /**
   * Delete a timeline comment
   */
  async del(id: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/timeline_comments/${id}`);
  }
}

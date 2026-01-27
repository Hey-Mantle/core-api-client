import { BaseResource } from './base';
import type {
  Meeting,
  MeetingListParams,
  MeetingListResponse,
  MeetingCreateParams,
  MeetingUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing meetings
 */
export class MeetingsResource extends BaseResource {
  /**
   * List meetings with optional filters and pagination
   */
  async list(params?: MeetingListParams): Promise<MeetingListResponse> {
    const response = await this.get<MeetingListResponse>('/meetings', params);
    return {
      meetings: response.meetings || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single meeting by ID
   */
  async retrieve(meetingId: string): Promise<{ meeting: Meeting }> {
    return this.get<{ meeting: Meeting }>(`/meetings/${meetingId}`);
  }

  /**
   * Create a meeting with optional transcript and attendees
   */
  async create(data: MeetingCreateParams): Promise<{ meeting: Meeting }> {
    return this.post<{ meeting: Meeting }>('/meetings', data);
  }

  /**
   * Update an existing meeting
   */
  async update(
    meetingId: string,
    data: MeetingUpdateParams
  ): Promise<{ meeting: Meeting }> {
    return this.put<{ meeting: Meeting }>(`/meetings/${meetingId}`, data);
  }

  /**
   * Archive (soft delete) a meeting
   */
  async del(meetingId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/meetings/${meetingId}`);
  }
}

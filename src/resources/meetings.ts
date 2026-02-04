import { BaseResource } from './base';
import type {
  Meeting,
  MeetingListParams,
  MeetingListResponse,
  MeetingCreateParams,
  MeetingUpdateParams,
  MeetingUploadUrlResponse,
  MeetingTranscribeParams,
  MeetingTranscriptionStatusResponse,
  MeetingAttendeeUpdateParams,
  MeetingAttendeeUpdateResponse,
} from '../types/meetings';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing meetings and their transcriptions
 *
 * Meetings capture video call recordings and their transcriptions with speaker
 * attribution. They can be associated with deals and customers.
 *
 * @example
 * ```typescript
 * // Create a meeting when recording starts
 * const { meeting } = await client.meetings.create({
 *   meetingData: {
 *     platform: 'google_meet',
 *     title: 'Sales Call with Acme Corp',
 *     meetingUrl: 'https://meet.google.com/abc-defg-hij',
 *     startTime: new Date().toISOString(),
 *   }
 * });
 *
 * // Get a signed URL to upload the recording
 * const { uploadUrl, recordingKey } = await client.meetings.getUploadUrl(meeting.id);
 *
 * // Upload the recording directly to S3
 * await fetch(uploadUrl, { method: 'PUT', body: recordingBlob });
 *
 * // Start server-side transcription
 * await client.meetings.startTranscription(meeting.id, { recordingKey });
 *
 * // Poll for transcription completion
 * const status = await client.meetings.getTranscriptionStatus(meeting.id);
 * ```
 */
export class MeetingsResource extends BaseResource {
  /**
   * List meetings with optional filters and pagination
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of meetings
   *
   * @example
   * ```typescript
   * // List all meetings
   * const { meetings } = await client.meetings.list();
   *
   * // List meetings for a specific deal
   * const { meetings } = await client.meetings.list({ dealId: 'deal_123' });
   *
   * // List meetings from Google Meet
   * const { meetings } = await client.meetings.list({ platform: 'google_meet' });
   * ```
   */
  async list(params?: MeetingListParams): Promise<MeetingListResponse> {
    const response = await this.get<MeetingListResponse>('/meetings', params);
    return {
      meetings: response.meetings || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  }

  /**
   * Retrieve a single meeting by ID with full transcript and attendee data
   *
   * @param meetingId - The meeting ID
   * @returns The meeting with all related data
   *
   * @example
   * ```typescript
   * const { meeting } = await client.meetings.retrieve('meeting_123');
   * console.log(meeting.transcript?.fullText);
   * ```
   */
  async retrieve(meetingId: string): Promise<Meeting> {
    return this.get<Meeting>(`/meetings/${meetingId}`);
  }

  /**
   * Create a new meeting
   *
   * Typically called when a recording starts in the browser extension.
   * The meeting can be created with optional transcript and attendee data,
   * or these can be added later via transcription.
   *
   * @param data - Meeting creation parameters
   * @returns The created meeting
   *
   * @example
   * ```typescript
   * // Create meeting when recording starts
   * const meeting = await client.meetings.create({
   *   meetingData: {
   *     platform: 'zoom',
   *     title: 'Weekly Sync',
   *     meetingUrl: 'https://zoom.us/j/123456789',
   *     startTime: new Date().toISOString(),
   *     recordingStatus: 'pending',
   *   }
   * });
   *
   * // Create meeting with transcript (from local transcription)
   * const meeting = await client.meetings.create({
   *   meetingData: { ... },
   *   transcript: {
   *     fullText: 'Hello, this is the transcript...',
   *     utterances: [
   *       { attendeeId: 'A', text: 'Hello', startTime: 0, endTime: 500 },
   *     ],
   *   },
   *   attendees: [
   *     { externalId: 'A', name: 'John Doe', email: 'john@example.com' },
   *   ],
   * });
   * ```
   */
  async create(data: MeetingCreateParams): Promise<Meeting> {
    return this.post<Meeting>('/meetings', data);
  }

  /**
   * Update an existing meeting
   *
   * @param meetingId - The meeting ID
   * @param data - Fields to update
   * @returns The updated meeting
   *
   * @example
   * ```typescript
   * // Update meeting title and link to a deal
   * const meeting = await client.meetings.update('meeting_123', {
   *   title: 'Updated Meeting Title',
   *   dealId: 'deal_456',
   * });
   * ```
   */
  async update(
    meetingId: string,
    data: MeetingUpdateParams
  ): Promise<Meeting> {
    return this.put<Meeting>(`/meetings/${meetingId}`, data);
  }

  /**
   * Archive (soft delete) a meeting
   *
   * @param meetingId - The meeting ID
   * @returns Success response
   *
   * @example
   * ```typescript
   * await client.meetings.del('meeting_123');
   * ```
   */
  async del(meetingId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/meetings/${meetingId}`);
  }

  /**
   * Get a signed URL to upload a meeting recording
   *
   * Returns a pre-signed S3 URL that can be used to upload the recording
   * directly from the client. After uploading, call `startTranscription`
   * to begin server-side transcription.
   *
   * @param meetingId - The meeting ID
   * @param filename - Optional filename (default: "recording.webm")
   * @returns Upload URL and recording key
   *
   * @example
   * ```typescript
   * const { uploadUrl, recordingKey } = await client.meetings.getUploadUrl('meeting_123');
   *
   * // Upload the recording blob directly to S3
   * const response = await fetch(uploadUrl, {
   *   method: 'PUT',
   *   body: recordingBlob,
   *   headers: { 'Content-Type': 'audio/webm' },
   * });
   *
   * // Then start transcription
   * await client.meetings.startTranscription('meeting_123', { recordingKey });
   * ```
   */
  async getUploadUrl(
    meetingId: string,
    filename?: string
  ): Promise<MeetingUploadUrlResponse> {
    return this.post<MeetingUploadUrlResponse>(
      `/meetings/${meetingId}/transcribe/upload`,
      filename ? { filename } : {}
    );
  }

  /**
   * Start server-side transcription for a meeting
   *
   * The recording must first be uploaded using the URL from `getUploadUrl`.
   * Transcription is processed asynchronously - poll `getTranscriptionStatus`
   * or retrieve the meeting to check for completion.
   *
   * @param meetingId - The meeting ID
   * @param params - Transcription parameters including the recording key
   * @returns The meeting with pending transcription status
   *
   * @example
   * ```typescript
   * // Start transcription after uploading
   * const meeting = await client.meetings.startTranscription('meeting_123', {
   *   recordingKey: 'meeting-recordings/org-id/meeting-123/uuid/recording.webm',
   * });
   *
   * // meeting.recordingStatus will be 'pending' or 'processing'
   * ```
   */
  async startTranscription(
    meetingId: string,
    params: MeetingTranscribeParams
  ): Promise<Meeting> {
    return this.post<Meeting>(`/meetings/${meetingId}/transcribe`, params);
  }

  /**
   * Get the current transcription status for a meeting
   *
   * Use this to poll for transcription completion after calling
   * `startTranscription`.
   *
   * @param meetingId - The meeting ID
   * @returns Current transcription status
   *
   * @example
   * ```typescript
   * // Poll for completion
   * const poll = async () => {
   *   const status = await client.meetings.getTranscriptionStatus('meeting_123');
   *
   *   if (status.recordingStatus === 'ready') {
   *     // Transcription complete - fetch the full meeting
   *     const meeting = await client.meetings.retrieve('meeting_123');
   *     return meeting;
   *   }
   *
   *   if (status.recordingStatus === 'failed') {
   *     throw new Error('Transcription failed');
   *   }
   *
   *   // Still processing - wait and retry
   *   await new Promise(r => setTimeout(r, 5000));
   *   return poll();
   * };
   * ```
   */
  async getTranscriptionStatus(
    meetingId: string
  ): Promise<MeetingTranscriptionStatusResponse> {
    return this.get<MeetingTranscriptionStatusResponse>(
      `/meetings/${meetingId}/transcribe`
    );
  }

  /**
   * Update a meeting attendee
   *
   * Updates attendee details such as name or links the attendee to a Mantle contact.
   * This is useful for speaker identification in transcripts.
   *
   * @param meetingId - The meeting ID
   * @param attendeeId - The attendee ID (or externalId if useExternalId option is set)
   * @param data - Fields to update
   * @param options - Additional options
   * @param options.useExternalId - If true, treat attendeeId as the externalId (e.g., "A", "B" from browser extension)
   * @returns The updated attendee
   *
   * @example
   * ```typescript
   * // Update attendee name by server ID
   * const { attendee } = await client.meetings.updateAttendee(
   *   'meeting_123',
   *   'attendee_456',
   *   { name: 'John Doe' }
   * );
   *
   * // Update attendee name by external ID (e.g., from browser extension)
   * const { attendee } = await client.meetings.updateAttendee(
   *   'meeting_123',
   *   'A',
   *   { name: 'John Doe' },
   *   { useExternalId: true }
   * );
   *
   * // Link attendee to a contact
   * const { attendee } = await client.meetings.updateAttendee(
   *   'meeting_123',
   *   'attendee_456',
   *   { contactId: 'contact_789' }
   * );
   * ```
   */
  async updateAttendee(
    meetingId: string,
    attendeeId: string,
    data: MeetingAttendeeUpdateParams,
    options?: { useExternalId?: boolean }
  ): Promise<MeetingAttendeeUpdateResponse> {
    const queryParams = options?.useExternalId ? '?useExternalId=true' : '';
    return this.put<MeetingAttendeeUpdateResponse>(
      `/meetings/${meetingId}/attendees/${attendeeId}${queryParams}`,
      data
    );
  }
}

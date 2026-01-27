import type { ListParams, PaginatedResponse } from './common';

/**
 * Meeting platform types
 */
export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams';

/**
 * Recording status types
 */
export type RecordingStatus = 'pending' | 'processing' | 'ready' | 'failed';

/**
 * Transcript status types
 */
export type TranscriptStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Word-level timing data in a transcript utterance
 */
export interface MeetingTranscriptWord {
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

/**
 * Reference to an attendee in an utterance
 */
export interface MeetingAttendeeRef {
  id: string;
  name?: string;
  email?: string;
}

/**
 * A single utterance in a meeting transcript
 */
export interface MeetingUtterance {
  id: string;
  attendeeId?: string;
  attendee?: MeetingAttendeeRef;
  text: string;
  startTime: number;
  endTime: number;
  sequence: number;
  confidence?: number;
  words?: MeetingTranscriptWord[];
}

/**
 * Meeting transcript with utterances
 */
export interface MeetingTranscript {
  id: string;
  language?: string;
  status?: TranscriptStatus;
  fullText?: string;
  externalId?: string;
  utterances?: MeetingUtterance[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Reference to a user in the meeting
 */
export interface MeetingUser {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Reference to a contact in the meeting
 */
export interface MeetingContactRef {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Meeting attendee
 */
export interface MeetingAttendee {
  id: string;
  externalId?: string;
  name?: string;
  email?: string;
  color?: string;
  talkTime?: number;
  wordCount?: number;
  user?: MeetingUser;
  contact?: MeetingContactRef;
}

/**
 * Reference to a deal associated with the meeting
 */
export interface MeetingDeal {
  id: string;
  name?: string;
}

/**
 * Reference to a customer associated with the meeting
 */
export interface MeetingCustomer {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Meeting entity
 */
export interface Meeting {
  id: string;
  externalId?: string;
  title?: string;
  summary?: string;
  platform?: MeetingPlatform;
  platformMeetingId?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  recordingStatus?: RecordingStatus;
  deal?: MeetingDeal;
  customer?: MeetingCustomer;
  createdBy?: MeetingUser;
  attendees?: MeetingAttendee[];
  transcript?: MeetingTranscript;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parameters for listing meetings
 */
export interface MeetingListParams extends ListParams {
  /** Filter by deal ID */
  dealId?: string;
  /** Filter by customer ID */
  customerId?: string;
  /** Filter by platform */
  platform?: MeetingPlatform;
  /** Filter by start time (from) */
  startTimeFrom?: string;
  /** Filter by start time (to) */
  startTimeTo?: string;
  /** Include archived meetings */
  includeArchived?: boolean;
}

/**
 * Response from listing meetings
 */
export interface MeetingListResponse extends PaginatedResponse {
  meetings: Meeting[];
}

/**
 * Input for creating an attendee
 */
export interface MeetingAttendeeInput {
  externalId?: string;
  name?: string;
  email?: string;
  color?: string;
  talkTime?: number;
  wordCount?: number;
  userId?: string;
  contactId?: string;
}

/**
 * Input for an utterance when creating a transcript
 */
export interface MeetingUtteranceInput {
  attendeeId?: string;
  text: string;
  startTime?: number;
  endTime?: number;
  sequence?: number;
  confidence?: number;
  words?: MeetingTranscriptWord[];
}

/**
 * Input for creating a transcript
 */
export interface MeetingTranscriptInput {
  language?: string;
  status?: TranscriptStatus;
  fullText?: string;
  externalId?: string;
  utterances?: MeetingUtteranceInput[];
}

/**
 * Parameters for creating a meeting
 */
export interface MeetingCreateParams {
  externalId?: string;
  title?: string;
  summary?: string;
  platform?: MeetingPlatform;
  platformMeetingId?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  recordingStatus?: RecordingStatus;
  dealId?: string;
  customerId?: string;
  attendees?: MeetingAttendeeInput[];
  transcript?: MeetingTranscriptInput;
}

/**
 * Parameters for updating a meeting
 */
export interface MeetingUpdateParams {
  title?: string;
  summary?: string;
  platform?: MeetingPlatform;
  platformMeetingId?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  recordingStatus?: RecordingStatus;
  dealId?: string;
  customerId?: string;
}

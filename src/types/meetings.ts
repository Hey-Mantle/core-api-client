import type { ListParams, PaginatedResponse } from './common';

/**
 * Meeting attendee entity
 */
export interface MeetingAttendee {
  id: string;
  /** External ID from the browser extension (e.g., "A", "B") */
  externalId?: string | null;
  name?: string | null;
  email?: string | null;
  /** Hex color for UI display */
  color?: string | null;
  /** Total talk time in milliseconds */
  talkTime?: number | null;
  /** Total word count */
  wordCount?: number | null;
  /** Attendee sentiment score (-1 to 1). Populated by AI enrichment. */
  sentiment?: number | null;
  /** Attendee engagement score (0 to 1). Populated by AI enrichment. */
  engagementScore?: number | null;
  /** Associated Mantle user */
  user?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  /** Associated Mantle contact */
  contact?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

/**
 * Meeting transcript utterance (a single spoken segment)
 */
export interface MeetingUtterance {
  id: string;
  attendeeId?: string | null;
  attendee?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  text: string;
  /** Start time in milliseconds from meeting start */
  startTime: number;
  /** End time in milliseconds from meeting start */
  endTime: number;
  /** Sequence number for ordering */
  sequence: number;
  /** Transcription confidence score */
  confidence?: number | null;
  /** Word-level timing data */
  words?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence?: number;
  }> | null;
}

/**
 * Meeting transcript entity
 */
export interface MeetingTranscript {
  id: string;
  /** Language code (e.g., "en") */
  language?: string | null;
  /** Transcript status: pending, processing, completed, failed */
  status?: string | null;
  /** Full text of the transcript */
  fullText?: string | null;
  /** External transcript ID (e.g., AssemblyAI) */
  externalId?: string | null;
  /** Individual utterances with speaker attribution */
  utterances?: MeetingUtterance[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Meeting entity
 */
export interface Meeting {
  id: string;
  /** External ID from the browser extension */
  externalId?: string | null;
  title?: string | null;
  /** AI-generated or manual summary */
  summary?: string | null;
  /** Meeting platform: google_meet, zoom, teams */
  platform?: string | null;
  /** Platform-specific meeting ID */
  platformMeetingId?: string | null;
  /** URL to join the meeting */
  meetingUrl?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  /** Duration in seconds */
  duration?: number | null;
  /** URL to the recording (e.g., S3/CDN URL) */
  recordingUrl?: string | null;
  /** Recording status: pending, processing, ready, failed */
  recordingStatus?: string | null;
  /** AI enrichment status: pending, processing, completed, failed */
  aiEnrichmentStatus?: string | null;
  /** When AI enrichment was last completed */
  aiEnrichedAt?: string | null;
  /** AI-generated meeting summary */
  aiSummary?: string | null;
  /** AI-extracted key points */
  aiKeyPoints?: MeetingKeyPoint[];
  /** AI-extracted decisions */
  aiDecisions?: MeetingDecision[];
  /** AI-extracted open questions */
  aiOpenQuestions?: MeetingOpenQuestion[];
  /** AI-extracted topics */
  aiTopics?: MeetingTopic[];
  /** Overall meeting sentiment (-1 to 1) */
  overallSentiment?: number | null;
  /** Sentiment over time */
  sentimentTrend?: SentimentDataPoint[];
  /** AI-extracted deal insights */
  aiDealInsights?: MeetingDealInsights | null;
  /** AI-suggested tasks */
  taskSuggestions?: MeetingTaskSuggestion[];
  deal?: {
    id: string;
    name?: string;
  } | null;
  customer?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  attendees?: MeetingAttendee[];
  transcript?: MeetingTranscript | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Parameters for listing meetings
 */
export interface MeetingListParams extends ListParams {
  /** Filter by deal ID */
  dealId?: string;
  /** Filter by customer ID */
  customerId?: string;
  /** Filter by platform (google_meet, zoom, teams) */
  platform?: string;
  /** Filter meetings starting from this date */
  startTimeFrom?: string;
  /** Filter meetings starting before this date */
  startTimeTo?: string;
  /** Search meetings by title or transcript content */
  search?: string;
  /** Include archived (soft-deleted) meetings */
  includeArchived?: boolean;
}

/**
 * Response from listing meetings
 */
export interface MeetingListResponse extends PaginatedResponse {
  meetings: Meeting[];
  /** Current page number (0-indexed) */
  page?: number;
  /** Total number of pages */
  totalPages?: number;
}

/**
 * Attendee input for creating/updating meetings
 */
export interface MeetingAttendeeInput {
  /** External ID from the browser extension (e.g., "A", "B") */
  externalId?: string;
  name?: string;
  email?: string;
  /** Hex color for UI display */
  color?: string;
  /** Total talk time in milliseconds */
  talkTime?: number;
  /** Total word count */
  wordCount?: number;
  /** Link to existing Mantle user */
  userId?: string;
  /** Link to existing Mantle contact */
  contactId?: string;
}

/**
 * Utterance input for creating/updating transcripts
 */
export interface MeetingUtteranceInput {
  /** Attendee external ID (e.g., "A", "B") to link to attendee */
  attendeeId?: string;
  text: string;
  /** Start time in milliseconds from meeting start */
  startTime: number;
  /** End time in milliseconds from meeting start */
  endTime: number;
  /** Sequence number for ordering */
  sequence?: number;
  /** Transcription confidence score */
  confidence?: number;
  /** Word-level timing data */
  words?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence?: number;
  }>;
}

/**
 * Transcript input for creating/updating meetings
 */
export interface MeetingTranscriptInput {
  /** Language code (default: "en") */
  language?: string;
  /** Transcript status (default: "completed") */
  status?: string;
  /** Full text of the transcript */
  fullText?: string;
  /** External transcript ID (e.g., AssemblyAI) */
  externalId?: string;
  /** Individual utterances */
  utterances?: MeetingUtteranceInput[];
}

/**
 * Parameters for creating a meeting
 */
export interface MeetingCreateParams {
  /** Meeting data */
  meetingData?: {
    /** External ID from the browser extension */
    externalId?: string;
    title?: string;
    summary?: string;
    /** Meeting platform: google_meet, zoom, teams */
    platform?: string;
    /** Platform-specific meeting ID */
    platformMeetingId?: string;
    /** URL to join the meeting */
    meetingUrl?: string;
    startTime?: string;
    endTime?: string;
    /** Duration in seconds */
    duration?: number;
    /** URL to the recording */
    recordingUrl?: string;
    /** Recording status: pending, processing, ready, failed */
    recordingStatus?: string;
    /** Associate with a deal */
    dealId?: string;
    /** Associate with a customer */
    customerId?: string;
  };
  /** Optional transcript data */
  transcript?: MeetingTranscriptInput;
  /** Optional attendee data */
  attendees?: MeetingAttendeeInput[];
}

/**
 * Parameters for updating a meeting
 */
export interface MeetingUpdateParams {
  title?: string;
  summary?: string;
  platform?: string;
  platformMeetingId?: string;
  meetingUrl?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  recordingStatus?: string;
  dealId?: string | null;
  customerId?: string | null;
}

/**
 * Response from getting a signed upload URL
 */
export interface MeetingUploadUrlResponse {
  /** Pre-signed S3 URL for uploading the recording */
  uploadUrl: string;
  /** S3 key for the recording (pass to /transcribe endpoint) */
  recordingKey: string;
  /** Time in seconds until the upload URL expires */
  expiresIn: number;
}

/**
 * Parameters for starting transcription
 */
export interface MeetingTranscribeParams {
  /** S3 key for the recording (from upload URL response) */
  recordingKey: string;
}

/**
 * Response from getting transcription status
 */
export interface MeetingTranscriptionStatusResponse {
  meetingId: string;
  /** Recording status: pending, processing, ready, failed */
  recordingStatus?: string | null;
  transcript?: {
    id: string;
    /** Transcript status: pending, processing, completed, failed */
    status?: string;
    /** AssemblyAI transcript ID */
    externalId?: string;
  } | null;
}

/**
 * Parameters for updating a meeting attendee
 */
export interface MeetingAttendeeUpdateParams {
  /** Updated attendee name */
  name?: string;
  /** Updated attendee email */
  email?: string;
  /** Link attendee to a Mantle contact (null to unlink) */
  contactId?: string | null;
}

/**
 * Response from updating an attendee
 */
export interface MeetingAttendeeUpdateResponse {
  attendee: MeetingAttendee;
}

// --- AI Enrichment Types ---

/**
 * A key point extracted from the meeting by AI
 */
export interface MeetingKeyPoint {
  point: string;
  speaker?: string | null;
  timestampMs?: number | null;
}

/**
 * A decision extracted from the meeting by AI
 */
export interface MeetingDecision {
  decision: string;
  context?: string | null;
}

/**
 * An open question extracted from the meeting by AI
 */
export interface MeetingOpenQuestion {
  question: string;
  askedBy?: string | null;
}

/**
 * A topic discussed in the meeting, extracted by AI
 */
export interface MeetingTopic {
  topic: string;
  relevance: number;
}

/**
 * A sentiment data point representing sentiment at a point in time
 */
export interface SentimentDataPoint {
  timestampMs: number;
  sentiment: number;
}

/**
 * Deal-related insights extracted by AI
 */
export interface MeetingDealInsights {
  objections: Array<{
    objection: string;
    speaker?: string | null;
    severity: string;
  }>;
  competitorMentions: Array<{
    competitor: string;
    context: string;
    sentiment: string;
  }>;
  budgetDiscussions: Array<{ quote: string; implication: string }>;
  timelineMentions: Array<{ quote: string; inferredDate?: string | null }>;
  buyingSignals: string[];
  riskIndicators: string[];
}

/**
 * An AI-generated task suggestion from a meeting
 */
export interface MeetingTaskSuggestion {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  suggestedAssigneeId?: string | null;
  suggestedDueDate?: string | null;
  triggerPhrase?: string | null;
  status: string;
  createdTaskId?: string | null;
  createdAt?: string | null;
}

/**
 * Parameters for accepting a task suggestion with optional overrides
 */
export interface AcceptTaskSuggestionParams {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
}

/**
 * Response from accepting a task suggestion
 */
export interface AcceptTaskSuggestionResponse {
  task: { id: string; title: string };
  suggestion: MeetingTaskSuggestion;
}

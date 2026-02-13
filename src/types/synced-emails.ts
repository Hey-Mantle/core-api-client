import type { ListParams, PaginatedResponse } from './common';

/**
 * A single message within a synced email thread
 */
export interface SyncedEmailMessage {
  id: string;
  /** External message ID from the email provider (e.g., Gmail message ID) */
  externalId?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  toEmails?: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  subject?: string | null;
  snippet?: string | null;
  /** Plain text body of the email */
  bodyText?: string | null;
  /** HTML body of the email */
  bodyHtml?: string | null;
  /** When the email was sent/received */
  date?: string | null;
  /** Whether the email was received (true) or sent (false) */
  isInbound?: boolean;
  labelIds?: string[];
  createdAt?: string | null;
}

/**
 * A synced email thread with messages
 */
export interface SyncedEmail {
  id: string;
  /** External thread ID from the email provider (e.g., Gmail thread ID) */
  externalId?: string | null;
  subject?: string | null;
  /** Preview snippet of the email thread */
  snippet?: string | null;
  /** Source of the synced email: gmail, outlook, manual */
  source?: string | null;
  /** Timestamp of the most recent message */
  lastMessageAt?: string | null;
  /** Number of messages in the thread */
  messageCount?: number;
  contact?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  customer?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  deal?: {
    id: string;
    name?: string;
  } | null;
  syncedBy?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  messages?: SyncedEmailMessage[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Parameters for listing synced emails
 */
export interface SyncedEmailListParams extends ListParams {
  /** Filter by contact ID */
  contactId?: string;
  /** Filter by customer ID */
  customerId?: string;
  /** Filter by deal ID */
  dealId?: string;
  /** Filter by source (gmail, outlook, manual) */
  source?: string;
  /** Search by subject or snippet */
  search?: string;
  /** Filter emails with last message after this date */
  dateFrom?: string;
  /** Filter emails with last message before this date */
  dateTo?: string;
  /** Include archived (soft-deleted) email threads */
  includeArchived?: boolean;
}

/**
 * Response from listing synced emails
 */
export interface SyncedEmailListResponse extends PaginatedResponse {
  syncedEmails: SyncedEmail[];
  /** Current page number (0-indexed) */
  page?: number;
  /** Total number of pages */
  totalPages?: number;
}

/**
 * Input for a single email message when creating/syncing
 */
export interface SyncedEmailMessageInput {
  /** External message ID from the email provider */
  externalId?: string;
  fromEmail?: string;
  fromName?: string;
  toEmails?: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  subject?: string;
  snippet?: string;
  /** Plain text body */
  bodyText?: string;
  /** HTML body */
  bodyHtml?: string;
  /** When the email was sent/received */
  date?: string;
  /** Whether the email was received (true) or sent (false) */
  isInbound?: boolean;
  labelIds?: string[];
}

/**
 * Parameters for creating or syncing a synced email thread
 */
export interface SyncedEmailCreateParams {
  /** Email thread data */
  emailData?: {
    /** External thread ID (enables upsert behavior) */
    externalId?: string;
    subject?: string;
    snippet?: string;
    /** Source: gmail, outlook, manual */
    source?: string;
    /** Associate with a contact */
    contactId?: string;
    /** Associate with a customer */
    customerId?: string;
    /** Associate with a deal */
    dealId?: string;
  };
  /** Messages in the thread */
  messages?: SyncedEmailMessageInput[];
}

/**
 * Parameters for updating a synced email thread
 */
export interface SyncedEmailUpdateParams {
  subject?: string;
  snippet?: string;
  source?: string;
  contactId?: string | null;
  customerId?: string | null;
  dealId?: string | null;
}

/**
 * Response from adding messages to a thread
 */
export interface SyncedEmailAddMessagesParams {
  messages: SyncedEmailMessageInput[];
}

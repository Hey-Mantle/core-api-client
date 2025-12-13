import type { ListParams, PaginatedResponse } from './common';

/**
 * Actor type for messages and events
 */
export type ActorType = 'customer' | 'agent' | 'system';

/**
 * Content type for message content
 */
export type ContentType = 'markdown' | 'html' | 'text';

/**
 * Thread event types for ticket timeline events
 */
export type ThreadEventType =
  | 'contact_added'
  | 'contact_removed'
  | 'agent_assigned'
  | 'customer_assigned'
  | 'app_assigned'
  | 'status_changed'
  | 'priority_changed'
  | 'channel_changed'
  | 'loop_opened'
  | 'loop_closed'
  | 'loop_reopened'
  | 'authenticated'
  | 'unauthenticated'
  | 'message'
  | 'internal_note';

/**
 * Inline contact for upsert operations
 */
export interface InlineContact {
  email: string;
  name?: string;
}

/**
 * Ticket entity
 */
export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  contactId?: string;
  customerId?: string;
  channelId?: string;
  appId?: string;
  assignedToId?: string;
  readOnly?: boolean;
  managedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  messageCount?: number;
  contact?: {
    id: string;
    name?: string;
    email?: string;
  };
  customer?: {
    id: string;
    name?: string;
  };
  assignedTo?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * Parameters for listing tickets
 */
export interface TicketListParams extends ListParams {
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedToId?: string;
  appId?: string;
  customerId?: string;
  contactId?: string;
  channelId?: string;
  tags?: string[];
}

/**
 * Response from listing tickets
 */
export interface TicketListResponse extends PaginatedResponse {
  tickets: Ticket[];
}

/**
 * Contact data for ticket creation
 * @deprecated Use InlineContact instead
 */
export interface TicketContactData {
  email: string;
  name?: string;
}

/**
 * Enhanced attachment input for bulk operations
 */
export interface TicketAttachmentInput {
  url: string;
  name?: string;
  contentType?: string;
  sizeBytes?: number;
}

/**
 * Message input for bulk upsert operations
 */
export interface TicketMessageBulkInput {
  /** Message ID (if provided, message will be updated; otherwise created) */
  id?: string;
  /** Actor type */
  actorType?: ActorType;
  /** Message content */
  content?: string;
  /** Full message content (for long messages) */
  fullContent?: string;
  /** Content format */
  contentType?: ContentType;
  /** Whether this is an internal note */
  isInternal?: boolean;
  /** Contact ID */
  contactId?: string;
  /** Agent ID */
  agentId?: string;
  /** When the message occurred */
  occurredAt?: string;
  /** RFC-5322 Message-ID header */
  messageId?: string;
  /** RFC-5322 In-Reply-To header */
  inReplyToId?: string;
  /** RFC-5322 References header */
  referencesIds?: string[];
  /** Attachments */
  attachments?: TicketAttachmentInput[];
  /** Inline contact to upsert */
  contact?: InlineContact;
}

/**
 * Event input for bulk upsert operations
 */
export interface TicketEventBulkInput {
  /** Event ID (if provided, event will be updated; otherwise created) */
  id?: string;
  /** Event type */
  type: ThreadEventType;
  /** Previous value before change */
  oldValue?: Record<string, unknown>;
  /** New value after change */
  newValue?: Record<string, unknown>;
  /** Actor type */
  actorType: ActorType;
  /** Agent ID (required if actorType is 'agent') */
  agentId?: string;
  /** Contact ID (required if actorType is 'customer') */
  contactId?: string;
  /** Associated thread message ID */
  threadMessageId?: string;
  /** When the event occurred */
  occurredAt?: string;
}

/**
 * Parameters for creating a ticket
 */
export interface TicketCreateParams {
  subject: string;
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  contactId?: string;
  /** Array of contact IDs to associate with the ticket */
  contactIds?: string[];
  customerId?: string;
  channelId?: string;
  appId?: string;
  assignedToId?: string;
  /** Inline contact to upsert */
  contact?: InlineContact;
  /** When the ticket was created */
  createdAt?: string;
  /** When the ticket was last updated */
  updatedAt?: string;
  /** When the last message was sent */
  lastMessageAt?: string;
  /** Whether the ticket is read-only */
  readOnly?: boolean;
  /** What manages this ticket (e.g., "intercom", "zendesk") */
  managedBy?: string;
  /** Array of messages to bulk upsert on create */
  messages?: TicketMessageBulkInput[];
  /** Array of events to bulk upsert on create */
  events?: TicketEventBulkInput[];
}

/**
 * Parameters for updating a ticket
 */
export interface TicketUpdateParams {
  subject?: string;
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  assignedToId?: string;
  contactId?: string;
  customerId?: string;
  channelId?: string;
  appId?: string;
  /** When the ticket was last updated */
  updatedAt?: string;
  /** When the last message was sent */
  lastMessageAt?: string;
  /** Whether the ticket is read-only */
  readOnly?: boolean;
  /** What manages this ticket */
  managedBy?: string;
  /** Inline contact to upsert */
  contact?: InlineContact;
  /** Array of messages to bulk upsert */
  messages?: TicketMessageBulkInput[];
  /** Array of events to bulk upsert */
  events?: TicketEventBulkInput[];
}

/**
 * Ticket message attachment
 */
export interface MessageAttachment {
  id?: string;
  name?: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
}

/**
 * Ticket message entity
 */
export interface TicketMessage {
  id: string;
  ticketId: string;
  /** Actor type */
  actorType: ActorType;
  /** Message content */
  content: string;
  /** Full message content (for long messages) */
  fullContent?: string;
  /** Content format */
  contentType: ContentType;
  /** Whether this is an internal note */
  isInternal: boolean;
  /** RFC-5322 Message-ID header */
  messageId?: string;
  /** RFC-5322 In-Reply-To header */
  inReplyToId?: string;
  /** RFC-5322 References header */
  referencesIds?: string[];
  attachments?: MessageAttachment[];
  /** When the message occurred */
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name?: string;
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null;
  contact?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

/**
 * Parameters for creating a ticket message
 */
export interface TicketMessageCreateParams {
  /** Actor type */
  actorType?: ActorType;
  /** Message content */
  content?: string;
  /** Full message content (for long messages) */
  fullContent?: string;
  /** Content format */
  contentType?: ContentType;
  /** Whether this is an internal note */
  isInternal?: boolean;
  /** Contact ID */
  contactId?: string;
  /** Agent ID */
  agentId?: string;
  /** When the message occurred */
  occurredAt?: string;
  /** RFC-5322 Message-ID header */
  messageId?: string;
  /** RFC-5322 In-Reply-To header */
  inReplyToId?: string;
  /** RFC-5322 References header */
  referencesIds?: string[];
  /** Attachments */
  attachments?: TicketAttachmentInput[];
  /** Inline contact to upsert */
  contact?: InlineContact;
}

/**
 * Parameters for updating a ticket message
 */
export interface TicketMessageUpdateParams {
  content?: string;
}

/**
 * Parameters for listing ticket messages
 */
export interface TicketMessagesListParams {
  /** Cursor for pagination */
  cursor?: string;
  /** Number of items per page */
  take?: number;
  /** Field to sort by */
  sort?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response from listing ticket messages
 */
export interface TicketMessagesListResponse extends PaginatedResponse {
  messages: TicketMessage[];
}

/**
 * Ticket event entity
 */
export interface TicketEvent {
  id: string;
  type: ThreadEventType;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  actorType: ActorType;
  agent?: {
    id: string;
    name?: string;
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null;
  contact?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  threadMessageId?: string | null;
  occurredAt: string;
  createdAt: string;
}

/**
 * Parameters for creating a ticket event
 */
export interface TicketEventCreateParams {
  /** Event type */
  type: ThreadEventType;
  /** Previous value before change */
  oldValue?: Record<string, unknown>;
  /** New value after change */
  newValue?: Record<string, unknown>;
  /** Actor type */
  actorType: ActorType;
  /** Agent ID (required if actorType is 'agent') */
  agentId?: string;
  /** Contact ID (required if actorType is 'customer') */
  contactId?: string;
  /** Associated thread message ID */
  threadMessageId?: string;
  /** When the event occurred */
  occurredAt?: string;
}

/**
 * Parameters for listing ticket events
 */
export interface TicketEventListParams {
  /** Cursor for pagination */
  cursor?: string;
  /** Number of items per page */
  take?: number;
  /** Field to sort by */
  sort?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response from listing ticket events
 */
export interface TicketEventListResponse extends PaginatedResponse {
  events: TicketEvent[];
}

/**
 * Channel entity (email or chat)
 */
export interface Channel {
  id: string;
  type: 'email' | 'chat';
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing channels
 */
export interface ChannelListParams {
  type?: 'email' | 'chat';
}

/**
 * Parameters for creating a channel
 */
export interface ChannelCreateParams {
  type: 'email' | 'chat';
  name: string;
}

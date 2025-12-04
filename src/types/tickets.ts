import type { ListParams, PaginatedResponse } from './common';

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
  createdAt: string;
  updatedAt: string;
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
 */
export interface TicketContactData {
  email: string;
  name?: string;
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
  customerId?: string;
  channelId?: string;
  appId?: string;
  assignedToId?: string;
  contact?: TicketContactData;
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
}

/**
 * Ticket message attachment
 */
export interface MessageAttachment {
  id?: string;
  filename: string;
  url: string;
  contentType?: string;
  size?: number;
}

/**
 * Ticket message entity
 */
export interface TicketMessage {
  id: string;
  ticketId: string;
  body: string;
  from: 'customer' | 'agent';
  attachments?: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * Parameters for creating a ticket message
 */
export interface TicketMessageCreateParams {
  body: string;
  from: 'customer' | 'agent';
  attachments?: Omit<MessageAttachment, 'id'>[];
}

/**
 * Parameters for updating a ticket message
 */
export interface TicketMessageUpdateParams {
  body?: string;
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

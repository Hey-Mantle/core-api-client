import type { ListParams, PaginatedResponse } from './common';

/**
 * User information attached to a timeline comment
 */
export interface TimelineCommentUser {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Attachment on a timeline comment
 */
export interface TimelineCommentAttachment {
  id: string;
  fileName: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  url?: string;
}

/**
 * Tagged user on a timeline comment
 */
export interface TimelineCommentTaggedUser {
  id: string;
  userId: string;
}

/**
 * Timeline comment entity
 */
export interface TimelineComment {
  id: string;
  comment?: string;
  commentHtml?: string;
  appInstallationId?: string | null;
  customerId?: string | null;
  dealId?: string | null;
  userId?: string | null;
  user?: TimelineCommentUser | null;
  originalCommentId?: string | null;
  attachments?: TimelineCommentAttachment[];
  taggedUsers?: TimelineCommentTaggedUser[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing timeline comments
 */
export interface TimelineCommentListParams extends ListParams {
  /** Filter by app installation ID */
  appInstallationId?: string;
  /** Filter by customer ID */
  customerId?: string;
  /** Filter by deal ID */
  dealId?: string;
}

/**
 * Response from listing timeline comments
 */
export interface TimelineCommentListResponse extends PaginatedResponse {
  timelineComments: TimelineComment[];
}

/**
 * Attachment input for creating a timeline comment
 */
export interface TimelineCommentAttachmentInput {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Tagged user input for creating a timeline comment
 */
export interface TimelineCommentTaggedUserInput {
  id: string;
}

/**
 * Parameters for creating a timeline comment
 */
export interface TimelineCommentCreateParams {
  /** App installation to associate with the comment */
  appInstallationId?: string;
  /** Customer to associate with the comment */
  customerId?: string;
  /** Deal to associate with the comment */
  dealId?: string;
  /** Plain text version of the comment */
  comment?: string;
  /** HTML content of the comment (required) */
  commentHtml: string;
  /** File attachments */
  attachments?: TimelineCommentAttachmentInput[];
  /** Users to tag in the comment */
  taggedUsers?: TimelineCommentTaggedUserInput[];
}

/**
 * Parameters for updating a timeline comment
 */
export interface TimelineCommentUpdateParams {
  /** Updated HTML content of the comment */
  commentHtml: string;
  /** App event ID to update (optional) */
  appEventId?: string;
  /** Deal event ID to update (optional) */
  dealEventId?: string;
}

/**
 * Response from creating a timeline comment
 */
export interface TimelineCommentCreateResponse {
  timelineComment: TimelineComment;
  appEventId?: string | null;
  dealEventId?: string | null;
}

/**
 * Response from updating a timeline comment
 */
export interface TimelineCommentUpdateResponse {
  timelineComment: TimelineComment;
  appEventId?: string | null;
  dealEventId?: string | null;
}

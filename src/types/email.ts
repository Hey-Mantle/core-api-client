import type { ListParams, PaginatedResponse } from './common';

/**
 * Email unsubscribe group entity
 */
export interface EmailUnsubscribeGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Member of an email unsubscribe group
 */
export interface EmailUnsubscribeGroupMember {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Parameters for listing email unsubscribe groups
 */
export interface EmailUnsubscribeGroupListParams extends ListParams {}

/**
 * Response from listing email unsubscribe groups
 */
export interface EmailUnsubscribeGroupListResponse extends PaginatedResponse {
  unsubscribeGroups: EmailUnsubscribeGroup[];
}

/**
 * Parameters for listing members of an unsubscribe group
 */
export interface EmailUnsubscribeGroupMemberListParams extends ListParams {}

/**
 * Response from listing members of an unsubscribe group
 */
export interface EmailUnsubscribeGroupMemberListResponse
  extends PaginatedResponse {
  members: EmailUnsubscribeGroupMember[];
}

/**
 * Parameters for adding members to an unsubscribe group
 */
export interface EmailUnsubscribeGroupAddMembersParams {
  emails: string[];
}

/**
 * Response from adding members to an unsubscribe group
 */
export interface EmailUnsubscribeGroupAddMembersResponse {
  added: number;
  members: EmailUnsubscribeGroupMember[];
}

/**
 * Parameters for removing members from an unsubscribe group
 */
export interface EmailUnsubscribeGroupRemoveMembersParams {
  emails: string[];
}

/**
 * Response from removing members from an unsubscribe group
 */
export interface EmailUnsubscribeGroupRemoveMembersResponse {
  removed: number;
}

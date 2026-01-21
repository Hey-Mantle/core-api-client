import { BaseResource } from './base';
import type {
  EmailUnsubscribeGroup,
  EmailUnsubscribeGroupListParams,
  EmailUnsubscribeGroupListResponse,
  EmailUnsubscribeGroupMemberListParams,
  EmailUnsubscribeGroupMemberListResponse,
  EmailUnsubscribeGroupAddMembersParams,
  EmailUnsubscribeGroupAddMembersResponse,
  EmailUnsubscribeGroupRemoveMembersParams,
  EmailUnsubscribeGroupRemoveMembersResponse,
} from '../types/email';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing email unsubscribe groups and their members
 */
export class EmailUnsubscribeGroupsResource extends BaseResource {
  /**
   * List all email unsubscribe groups
   */
  async list(
    params?: EmailUnsubscribeGroupListParams
  ): Promise<EmailUnsubscribeGroupListResponse> {
    const response = await this.get<EmailUnsubscribeGroupListResponse>(
      '/email/unsubscribe_groups',
      params
    );
    return {
      unsubscribeGroups: response.unsubscribeGroups || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single unsubscribe group
   */
  async retrieve(
    groupId: string
  ): Promise<{ unsubscribeGroup: EmailUnsubscribeGroup }> {
    return this.get<{ unsubscribeGroup: EmailUnsubscribeGroup }>(
      `/email/unsubscribe_groups/${groupId}`
    );
  }

  // ========== Members ==========

  /**
   * List members of an unsubscribe group
   */
  async listMembers(
    groupId: string,
    params?: EmailUnsubscribeGroupMemberListParams
  ): Promise<EmailUnsubscribeGroupMemberListResponse> {
    const response = await this.get<EmailUnsubscribeGroupMemberListResponse>(
      `/email/unsubscribe_groups/${groupId}/members`,
      params
    );
    return {
      members: response.members || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Add members to an unsubscribe group by email addresses
   */
  async addMembers(
    groupId: string,
    data: EmailUnsubscribeGroupAddMembersParams
  ): Promise<EmailUnsubscribeGroupAddMembersResponse> {
    return this.post<EmailUnsubscribeGroupAddMembersResponse>(
      `/email/unsubscribe_groups/${groupId}/members`,
      data
    );
  }

  /**
   * Remove members from an unsubscribe group by email addresses
   */
  async removeMembers(
    groupId: string,
    data: EmailUnsubscribeGroupRemoveMembersParams
  ): Promise<EmailUnsubscribeGroupRemoveMembersResponse> {
    return this._delete<EmailUnsubscribeGroupRemoveMembersResponse>(
      `/email/unsubscribe_groups/${groupId}/members?emails=${encodeURIComponent(data.emails.join(','))}`
    );
  }

  /**
   * Remove a single member from an unsubscribe group by member ID
   */
  async removeMember(groupId: string, memberId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(
      `/email/unsubscribe_groups/${groupId}/members/${memberId}`
    );
  }
}

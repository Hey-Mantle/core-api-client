import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class EmailUnsubscribeGroupsResource extends BaseResource {
  async list(params?: paths['/email/unsubscribe_groups']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/email/unsubscribe_groups', { params: { query: params } }));
  }

  async listMembers(groupId: string, params?: paths['/email/unsubscribe_groups/{id}/members']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/email/unsubscribe_groups/{id}/members', { params: { path: { id: groupId }, query: params } }));
  }

  async addMembers(groupId: string, data: paths['/email/unsubscribe_groups/{id}/members']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/email/unsubscribe_groups/{id}/members', { params: { path: { id: groupId } }, body: data }));
  }

  async removeMembers(groupId: string, data: paths['/email/unsubscribe_groups/{id}/members']['delete']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.DELETE('/email/unsubscribe_groups/{id}/members', { params: { path: { id: groupId } }, body: data }));
  }

  async removeMember(groupId: string, memberId: string) {
    return this.unwrap(this.api.DELETE('/email/unsubscribe_groups/{id}/members/{member_id}', { params: { path: { id: groupId, member_id: memberId } } }));
  }
}

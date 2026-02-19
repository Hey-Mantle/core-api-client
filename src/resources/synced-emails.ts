import { BaseResource } from './base';

/**
 * Resource for synced email threads.
 * Note: /synced_emails is not yet in the OpenAPI spec.
 */
export class SyncedEmailsResource extends BaseResource {
  async list(params?: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.GET('/synced_emails', { params: { query: params } }));
  }

  async retrieve(syncedEmailId: string) {
    return this.unwrap(this.untypedApi.GET('/synced_emails/{id}', { params: { path: { id: syncedEmailId } } }));
  }

  async create(data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.POST('/synced_emails', { body: data }));
  }

  async update(syncedEmailId: string, data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.PUT('/synced_emails/{id}', { params: { path: { id: syncedEmailId } }, body: data }));
  }

  async del(syncedEmailId: string) {
    return this.unwrap(this.untypedApi.DELETE('/synced_emails/{id}', { params: { path: { id: syncedEmailId } } }));
  }

  async addMessages(syncedEmailId: string, data: Record<string, unknown>) {
    return this.unwrap(this.untypedApi.POST('/synced_emails/{id}/messages', { params: { path: { id: syncedEmailId } }, body: data }));
  }

  async getMessages(syncedEmailId: string) {
    return this.unwrap(this.untypedApi.GET('/synced_emails/{id}/messages', { params: { path: { id: syncedEmailId } } }));
  }
}

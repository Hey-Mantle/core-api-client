import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class TicketsResource extends BaseResource {
  // Tickets
  async list(params?: paths['/tickets']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/tickets', { params: { query: params } }));
  }

  async get(ticketId: string) {
    return this.unwrap(this.api.GET('/tickets/{id}', { params: { path: { id: ticketId } } }));
  }

  async create(data: paths['/tickets']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/tickets', { body: data }));
  }

  async update(ticketId: string, data: paths['/tickets/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/tickets/{id}', { params: { path: { id: ticketId } }, body: data }));
  }

  // Messages
  async listMessages(ticketId: string, params?: paths['/tickets/{id}/messages']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/tickets/{id}/messages', { params: { path: { id: ticketId }, query: params } }));
  }

  async getMessage(ticketId: string, messageId: string) {
    return this.unwrap(this.api.GET('/tickets/{id}/messages/{messageId}', { params: { path: { id: ticketId, messageId } } }));
  }

  async createMessage(ticketId: string, data: paths['/tickets/{id}/messages']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/tickets/{id}/messages', { params: { path: { id: ticketId } }, body: data }));
  }

  async updateMessage(ticketId: string, data: paths['/tickets/{id}/messages']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/tickets/{id}/messages', { params: { path: { id: ticketId } }, body: data }));
  }

  // Events
  async listEvents(ticketId: string, params?: paths['/tickets/{id}/events']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/tickets/{id}/events', { params: { path: { id: ticketId }, query: params } }));
  }

  async createEvent(ticketId: string, data: paths['/tickets/{id}/events']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/tickets/{id}/events', { params: { path: { id: ticketId } }, body: data }));
  }

  // Loops
  async listLoops(ticketId: string) {
    return this.unwrap(this.api.GET('/tickets/{id}/loops', { params: { path: { id: ticketId } } }));
  }

  async getLoop(ticketId: string, loopId: string) {
    return this.unwrap(this.api.GET('/tickets/{id}/loops/{loopId}', { params: { path: { id: ticketId, loopId } } }));
  }
}

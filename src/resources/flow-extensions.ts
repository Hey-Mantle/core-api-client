import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class FlowExtensionsResource extends BaseResource {
  // Actions
  async listActions(params?: paths['/flow/extensions/actions']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/flow/extensions/actions', { params: { query: params } }));
  }

  async createAction(data: paths['/flow/extensions/actions']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/flow/extensions/actions', { body: data }));
  }

  async updateAction(actionId: string, data: paths['/flow/extensions/actions/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/flow/extensions/actions/{id}', { params: { path: { id: actionId } }, body: data }));
  }

  async deleteAction(actionId: string) {
    return this.unwrap(this.api.DELETE('/flow/extensions/actions/{id}', { params: { path: { id: actionId } } }));
  }

  // Action Runs
  async updateActionRun(runId: string, data: paths['/flow/actions/runs/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/flow/actions/runs/{id}', { params: { path: { id: runId } }, body: data }));
  }

  // Triggers
  async listTriggers() {
    return this.unwrap(this.api.GET('/flow/extensions/triggers'));
  }

  async retrieveTrigger(handle: string) {
    return this.unwrap(this.api.GET('/flow/extensions/triggers/{handle}', { params: { path: { handle } } }));
  }

  async createTrigger(data: paths['/flow/extensions/triggers']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/flow/extensions/triggers', { body: data }));
  }

  async updateTrigger(handle: string, data: paths['/flow/extensions/triggers/{handle}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/flow/extensions/triggers/{handle}', { params: { path: { handle } }, body: data }));
  }

  async deleteTrigger(handle: string) {
    return this.unwrap(this.api.DELETE('/flow/extensions/triggers/{handle}', { params: { path: { handle } } }));
  }

  async fireTrigger(handle: string, data?: NonNullable<paths['/flow/extensions/triggers/{handle}/fire']['post']['requestBody']>['content']['application/json']) {
    return this.unwrap(this.api.POST('/flow/extensions/triggers/{handle}/fire', { params: { path: { handle } }, body: data }));
  }
}

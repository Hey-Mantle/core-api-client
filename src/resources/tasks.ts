import { BaseResource } from './base';
import type { paths } from '../generated/api';

export class TasksResource extends BaseResource {
  // Tasks
  async list(params?: paths['/tasks']['get']['parameters']['query']) {
    return this.unwrap(this.api.GET('/tasks', { params: { query: params } }));
  }

  async get(taskId: string) {
    return this.unwrap(this.api.GET('/tasks/{id}', { params: { path: { id: taskId } } }));
  }

  async create(data: paths['/tasks']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/tasks', { body: data }));
  }

  async update(taskId: string, data: paths['/tasks/{id}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/tasks/{id}', { params: { path: { id: taskId } }, body: data }));
  }

  async del(taskId: string) {
    return this.unwrap(this.api.DELETE('/tasks/{id}', { params: { path: { id: taskId } } }));
  }

  // Todo Items
  async listTodoItems(taskId: string) {
    return this.unwrap(this.api.GET('/tasks/{id}/todo-items', { params: { path: { id: taskId } } }));
  }

  async getTodoItem(taskId: string, itemId: string) {
    return this.unwrap(this.api.GET('/tasks/{id}/todo-items/{itemId}', { params: { path: { id: taskId, itemId } } }));
  }

  async createTodoItem(taskId: string, data: paths['/tasks/{id}/todo-items']['post']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.POST('/tasks/{id}/todo-items', { params: { path: { id: taskId } }, body: data }));
  }

  async updateTodoItem(taskId: string, itemId: string, data: paths['/tasks/{id}/todo-items/{itemId}']['put']['requestBody']['content']['application/json']) {
    return this.unwrap(this.api.PUT('/tasks/{id}/todo-items/{itemId}', { params: { path: { id: taskId, itemId } }, body: data }));
  }

  async deleteTodoItem(taskId: string, itemId: string) {
    return this.unwrap(this.api.DELETE('/tasks/{id}/todo-items/{itemId}', { params: { path: { id: taskId, itemId } } }));
  }
}

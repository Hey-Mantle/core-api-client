import { BaseResource } from './base';
import type {
  Task,
  TaskListParams,
  TaskListResponse,
  TaskCreateParams,
  TaskUpdateParams,
} from '../types';
import type { DeleteResponse } from '../types/common';

/**
 * Resource for managing tasks
 */
export class TasksResource extends BaseResource {
  /**
   * List tasks with optional filters and pagination
   */
  async list(params?: TaskListParams): Promise<TaskListResponse> {
    const response = await this.get<TaskListResponse>('/tasks', params);
    return {
      tasks: response.tasks || [],
      hasNextPage: response.hasNextPage || false,
      hasPreviousPage: response.hasPreviousPage || false,
      total: response.total,
      cursor: response.cursor,
    };
  }

  /**
   * Retrieve a single task by ID
   */
  async retrieve(taskId: string): Promise<{ task: Task }> {
    return this.get<{ task: Task }>(`/tasks/${taskId}`);
  }

  /**
   * Create a new task
   */
  async create(data: TaskCreateParams): Promise<{ task: Task }> {
    return this.post<{ task: Task }>('/tasks', data);
  }

  /**
   * Update an existing task
   */
  async update(taskId: string, data: TaskUpdateParams): Promise<{ task: Task }> {
    return this.put<{ task: Task }>(`/tasks/${taskId}`, data);
  }

  /**
   * Delete a task
   */
  async del(taskId: string): Promise<DeleteResponse> {
    return this._delete<DeleteResponse>(`/tasks/${taskId}`);
  }
}

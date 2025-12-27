import type { ListParams, PaginatedResponse } from './common';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task todo item entity
 */
export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  completedAt?: string | null;
  displayOrder: number;
}

/**
 * Parameters for creating a todo item (used in task creation/update)
 */
export interface TodoItemInput {
  id?: string;
  content: string;
  completed?: boolean;
  displayOrder?: number;
}

/**
 * Task entity
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  customerId?: string;
  contactId?: string;
  dealId?: string;
  dealActivityId?: string;
  appInstallationId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name?: string;
    email?: string;
  };
  customer?: {
    id: string;
    name?: string;
  };
  contact?: {
    id: string;
    name?: string;
  };
  deal?: {
    id: string;
    name?: string;
  };
  todoItems?: TodoItem[];
}

/**
 * Parameters for listing tasks
 */
export interface TaskListParams extends ListParams {
  dealId?: string;
  customerId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/**
 * Response from listing tasks
 */
export interface TaskListResponse extends PaginatedResponse {
  tasks: Task[];
}

/**
 * Parameters for creating a task
 */
export interface TaskCreateParams {
  title: string;
  description?: string;
  descriptionHtml?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  customerId?: string;
  contactId?: string;
  dealId?: string;
  dealActivityId?: string;
  appInstallationId?: string;
  tags?: string[];
  todoItems?: TodoItemInput[];
}

/**
 * Parameters for updating a task
 */
export interface TaskUpdateParams extends Partial<TaskCreateParams> {}

/**
 * Response from listing todo items
 */
export interface TodoItemListResponse {
  items: TodoItem[];
  total: number;
}

/**
 * Parameters for creating a todo item via the dedicated endpoint
 */
export interface TodoItemCreateParams {
  content: string;
  completed?: boolean;
  displayOrder?: number;
}

/**
 * Parameters for updating a todo item
 */
export interface TodoItemUpdateParams {
  content?: string;
  completed?: boolean;
  displayOrder?: number;
}

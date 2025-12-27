import type { ListParams, PaginatedResponse } from './common';

/**
 * Task status
 */
export type TaskStatus = 'new' | 'in_progress' | 'complete';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high';

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
  completedAt?: string | null;
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
  } | null;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  customer?: {
    id: string;
    name?: string;
  } | null;
  contact?: {
    id: string;
    name?: string;
  } | null;
  deal?: {
    id: string;
    name?: string;
    dealStage?: {
      id: string;
      name?: string;
    } | null;
  } | null;
  dealActivity?: {
    id: string;
    name?: string;
  } | null;
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
 * Deal progression information returned when a task update triggers deal stage change
 */
export interface DealProgression {
  dealId: string;
  dealName: string;
  previousStage: { id: string; name: string } | null;
  nextStage: { id: string; name: string } | null;
}

/**
 * Response from updating a task
 */
export interface TaskUpdateResponse {
  task: Task;
  dealProgressed: boolean;
  dealProgression: DealProgression | null;
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

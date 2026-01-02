export type TaskStatus = 'IN_PROGRESS' | 'DONE' | 'COMPLETE';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  parentId?: string;
}

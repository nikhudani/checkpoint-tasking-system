// This file defines the shape of a Task object for TypeScript type checking.
// It helps prevent errors like assigning wrong types (e.g., string to number).

export interface Task {
  id: number;
  name: string;
  status: 'IN_PROGRESS' | 'DONE';
  parentId: number | null;
}
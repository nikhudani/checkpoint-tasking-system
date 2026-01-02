import type { Task } from '../models/Task';


/**
 * Determines if a task can be marked COMPLETE
 * A task is COMPLETE if:
 * 1. Its status is DONE
 * 2. All of its children (dependencies) are COMPLETE
 */
export function isTaskComplete(task: Task, allTasks: Task[]): boolean {
  if (task.status !== 'DONE') return false;

  const children = allTasks.filter(t => t.parentId === task.id);
  return children.every(child => isTaskComplete(child, allTasks));
}

/**
 * Checks if setting parentId would create a circular dependency.
 * Returns true if circular dependency detected.
 */
export function hasCircularDependency(
  tasks: Task[],
  taskId: string,
  newParentId?: string
): boolean {
  if (!newParentId) return false;

  let currentId: string | undefined = newParentId;

  while (currentId) {
    if (currentId === taskId) {
      // Found a loop
      return true;
    }
    const parent = tasks.find(t => t.id === currentId);
    currentId = parent?.parentId;
  }

  return false;
}

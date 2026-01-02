import React, { useState } from 'react';
import type{ Task } from '../types';

// Helper function to check if a task is COMPLETE.
// Recursive: Checks if DONE and all children are COMPLETE.
const isComplete = (task: Task, allTasks: Task[]): boolean => {
  if (task.status !== 'DONE') return false;
  const children = allTasks.filter((t) => t.parentId === task.id);
  if (children.length === 0) return true;
  return children.every((child) => isComplete(child, allTasks));
};

// Props: tasks array, and function to toggle status.
interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleStatus }) => {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'DONE' | 'COMPLETE'>('ALL');

  // Filter tasks based on selected filter.
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true;
    if (filter === 'IN_PROGRESS') return task.status === 'IN_PROGRESS';
    if (filter === 'DONE') return task.status === 'DONE';
    if (filter === 'COMPLETE') return isComplete(task, tasks);
    return true;
  });

  return (
    <div>
      <h2>Task List</h2>
      <label>
        Filter by Status:
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="ALL">ALL</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="DONE">DONE</option>
          <option value="COMPLETE">COMPLETE</option>
        </select>
      </label>
      <ul>
        {filteredTasks.map((task) => {
            const parent = tasks.find((t) => t.id === task.parentId);
            const indent = task.parentId ? '    → ' : ''; // arrow for sub-tasks
            const parentName = parent ? ` (sub-task of "${parent.name}")` : '';
            const displayStatus = isComplete(task, tasks) ? 'COMPLETE' : task.status;

            return (
            <li key={task.id}>
                {indent}ID: {task.id} | Name: {task.name} | Status: {displayStatus}
                {parentName}
                <input
                type="checkbox"
                checked={task.status === 'DONE'}
                onChange={() => onToggleStatus(task.id)}
                /> (Check to mark DONE)
            </li>
            );
        })}
        </ul>
    </div>
  );
};

export default TaskList;
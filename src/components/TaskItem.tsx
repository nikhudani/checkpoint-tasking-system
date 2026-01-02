import { useContext } from 'react';
import TaskContext from '../context/TaskContext';
import type { Task } from '../models/Task';

export default function TaskItem({ task, visited = new Set<string>() }: { task: Task; visited?: Set<string> }) {
  const context = useContext(TaskContext);
  if (!context) return null;

  const { tasks, dispatch } = context;

  // Prevent infinite loop
  if (visited.has(task.id)) return null;

  const newVisited = new Set(visited);
  newVisited.add(task.id);

  const children = tasks.filter(t => t.parentId === task.id);

  return (
    <li>
      <input
        type="checkbox"
        checked={task.status === 'DONE' || task.status === 'COMPLETE'}
        onChange={() => dispatch({ type: 'TOGGLE_TASK', id: task.id })}
      />
      {task.name} — {task.status}

      {children.length > 0 && (
        <ul style={{ marginLeft: '20px' }}>
          {children.map(child => (
            <TaskItem key={child.id} task={child} visited={newVisited} />
          ))}
        </ul>
      )}
    </li>
  );
}


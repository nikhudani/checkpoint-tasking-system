import { useContext } from 'react';
import TaskContext from '../context/TaskContext';

export default function TaskList() {
  const context = useContext(TaskContext);
  if (!context) return null;

  const { tasks, dispatch } = context;

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.status === 'DONE'}
            onChange={() =>
              dispatch({ type: 'TOGGLE_TASK', id: task.id })
            }
          />
          {task.name} — {task.status}
        </li>
      ))}
    </ul>
  );
}

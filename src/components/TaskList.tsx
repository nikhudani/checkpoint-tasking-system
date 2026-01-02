import { useContext } from 'react';
import TaskContext from '../context/TaskContext';
import TaskItem from './TaskItem';

export default function TaskList() {
  const context = useContext(TaskContext);
  if (!context) return null;

  const { tasks } = context;

  const rootTasks = tasks.filter(task => !task.parentId);

  return (
    <ul>
      {rootTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

import { useContext, useState } from 'react';
import TaskContext from '../context/TaskContext';
import type { Task } from '../models/Task';

export default function TaskForm() {
  const context = useContext(TaskContext);
  const [name, setName] = useState('');

  if (!context) return null;

  const { dispatch } = context;

  const addTask = () => {
    if (!name.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      status: 'IN_PROGRESS',
    };

    dispatch({ type: 'ADD_TASK', task: newTask });
    setName('');
  };

  return (
    <div>
      <input
        placeholder="Task name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
    </div>
  );
}

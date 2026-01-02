import { useContext, useState } from 'react';
import TaskContext from '../context/TaskContext';
import type { Task } from '../models/Task';

export default function TaskForm() {
  const context = useContext(TaskContext);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');

  if (!context) return null;
  const { tasks, dispatch } = context;

  const addTask = () => {
    if (!name.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      status: 'IN_PROGRESS',
      parentId: parentId || undefined,
    };

    dispatch({ type: 'ADD_TASK', task: newTask });
    setName('');
    setParentId('');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        placeholder="Task name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <select
        value={parentId}
        onChange={e => setParentId(e.target.value)}
      >
        <option value="">No Parent</option>
        {tasks.map(task => (
          <option key={task.id} value={task.id}>
            {task.name}
          </option>
        ))}
      </select>

      <button onClick={addTask}>Add Task</button>
    </div>
  );
}

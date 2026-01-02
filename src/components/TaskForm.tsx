import React, { useState } from 'react';

// Props are inputs to the component. Here, onCreate is a function passed from parent (App.tsx) to add a new task.
interface TaskFormProps {
  onCreate: (name: string, parentId: number | null) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [parentIdInput, setParentIdInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Task name is required!');
      return;
    }
    const parentId = parentIdInput.trim() ? parseInt(parentIdInput, 10) : null;
    if (parentId !== null && isNaN(parentId)) {
      alert('Parent ID must be a number!');
      return;
    }
    onCreate(name, parentId);
    setName('');
    setParentIdInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Task</h2>
      <label>
        Task Name (required):
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Parent Task ID (optional):
        <input
          type="text"
          value={parentIdInput}
          onChange={(e) => setParentIdInput(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Create Task</button>
    </form>
  );
};

export default TaskForm;
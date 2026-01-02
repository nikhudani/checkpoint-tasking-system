import React, { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import type{ Task } from './types';
import './App.css'; // Optional: For styles

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextId, setNextId] = useState(1);

  // Function to check for circular dependencies (cycle in parent chain).
  const hasCycleInChain = (proposedParentId: number): boolean => {
    const visited = new Set<number>();
    let current: number | null = proposedParentId;
    while (current !== null) {
      if (visited.has(current)) {
        return true; // Cycle detected
      }
      visited.add(current);
      const parentTask = tasks.find((t) => t.id === current);
      if (!parentTask) {
        return false; // Should not happen if parent exists
      }
      current = parentTask.parentId;
    }
    return false;
  };

  const handleCreate = (name: string, parentId: number | null) => {
    if (parentId !== null) {
      const parentExists = tasks.some((t) => t.id === parentId);
      if (!parentExists) {
        alert('Parent Task ID does not exist!');
        return;
      }
      if (hasCycleInChain(parentId)) {
        alert('Circular dependency detected in the parent chain!');
        return;
      }
    }
    const newTask: Task = {
      id: nextId,
      name,
      status: 'IN_PROGRESS',
      parentId,
    };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
  };

  const handleToggleStatus = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'IN_PROGRESS' ? 'DONE' : 'IN_PROGRESS' }
          : task
      )
    );
  };

  return (
    <div className="App">
      <h1>CheckPointSpot Tasking System</h1>
      <TaskForm onCreate={handleCreate} />
      <TaskList tasks={tasks} onToggleStatus={handleToggleStatus} />
    </div>
  );
};

export default App;
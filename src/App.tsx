// src/App.tsx
import React, { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import type{ Task } from './types';
import './App.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextId, setNextId] = useState(1);

  // Generate displayId like 1, 1.1, 1.1.1 based on parent
  const generateDisplayId = (parentDisplayId?: string): string => {
    if (!parentDisplayId) {
      // New top-level task
      const topLevelCount = tasks.filter(t => !t.parentId).length;
      return (topLevelCount + 1).toString();
    }
    
    // Find parent task
    const parentTask = tasks.find(t => t.displayId === parentDisplayId);
    if (!parentTask) return 'ERROR';
    
    // Count existing children of this parent
    const childCount = tasks.filter(t => t.parentId === parentTask.id).length;
    return `${parentDisplayId}.${childCount + 1}`;
  };

  // Find task by displayId
  const findTaskByDisplayId = (displayId: string): Task | null => {
    return tasks.find(t => t.displayId === displayId) || null;
  };

  const handleCreate = (name: string, parentDisplayId?: string) => {
    let targetParentId: number | null = null;

    if (parentDisplayId) {
      const parentTask = findTaskByDisplayId(parentDisplayId);
      if (!parentTask) {
        alert(`Parent Task ID "${parentDisplayId}" does not exist!`);
        return;
      }
      targetParentId = parentTask.id;
      
      // Check for circular dependency
      if (hasCycle(targetParentId, new Set())) {
        alert('Circular dependency detected!');
        return;
      }
    }

    const displayId = generateDisplayId(parentDisplayId);
    const newTask: Task = {
      id: nextId,
      displayId,
      name,
      status: 'IN_PROGRESS',
      parentId: targetParentId,
    };

    let updatedTasks = [...tasks, newTask];
    if (targetParentId !== null) {
      updatedTasks = downgradeParents(updatedTasks, targetParentId);
    }

    setTasks(updatedTasks);
    setNextId(nextId + 1);
  };

  const hasCycle = (taskId: number, visiting: Set<number>): boolean => {
    if (visiting.has(taskId)) return true;
    visiting.add(taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.parentId) {
      return hasCycle(task.parentId, visiting);
    }
    return false;
  };

  const handleToggleStatus = (id: number) => {
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const index = newTasks.findIndex(t => t.id === id);
      if (index === -1) return newTasks;

      const task = {...newTasks[index]};

      if (task.status === 'IN_PROGRESS') {
        // Toggle to DONE, then upgrade if possible
        task.status = 'DONE';
        newTasks[index] = task;
        return upgradeAndPropagate(newTasks, id);
      } else {
        // Toggle to IN_PROGRESS, then downgrade parents
        task.status = 'IN_PROGRESS';
        newTasks[index] = task;
        return downgradeParents(newTasks, task.parentId);
      }
    });
  };

  // Upgrade a task from DONE to COMPLETE if all children are COMPLETE, and propagate up
  const upgradeAndPropagate = (tasksList: Task[], id: number): Task[] => {
    const newTasks = [...tasksList];
    const index = newTasks.findIndex(t => t.id === id);
    if (index === -1) return newTasks;

    const task = newTasks[index];
    if (task.status !== 'DONE') return newTasks;

    const children = newTasks.filter(t => t.parentId === task.id);
    const allChildrenComplete = children.length === 0 || children.every(c => c.status === 'COMPLETE');

    if (allChildrenComplete) {
      task.status = 'COMPLETE';
      newTasks[index] = task;

      if (task.parentId !== null) {
        return upgradeAndPropagate(newTasks, task.parentId);
      }
    }

    return newTasks;
  };

  // Downgrade parents from COMPLETE to DONE if applicable, propagate up
  const downgradeParents = (tasksList: Task[], parentId: number | null): Task[] => {
    if (parentId === null) return tasksList;

    const newTasks = [...tasksList];
    const index = newTasks.findIndex(t => t.id === parentId);
    if (index === -1) return newTasks;

    const parent = newTasks[index];
    if (parent.status === 'COMPLETE') {
      parent.status = 'DONE';
      newTasks[index] = parent;

      return downgradeParents(newTasks, parent.parentId);
    }

    return newTasks;
  };

  return (
    <div className="App">
      <h1>CheckPointSpot Tasking System</h1>
      <TaskForm onCreate={handleCreate} allTasks={tasks} />
      <TaskList tasks={tasks} onToggleStatus={handleToggleStatus} />
    </div>
  );
};

export default App;
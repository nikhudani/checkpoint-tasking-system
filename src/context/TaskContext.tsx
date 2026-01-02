import { createContext, useReducer, useEffect } from 'react';
import type { Task } from '../models/Task';

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'TOGGLE_TASK'; id: string };

interface TaskContextType {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
}

const TaskContext = createContext<TaskContextType | null>(null);

function reducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.task];
    case 'TOGGLE_TASK':
      return state.map(task =>
        task.id === action.id
          ? {
              ...task,
              status:
                task.status === 'IN_PROGRESS' ? 'DONE' : 'IN_PROGRESS',
            }
          : task
      );
    default:
      return state;
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(
    reducer,
    [],
    () => JSON.parse(localStorage.getItem('tasks') || '[]')
  );

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ tasks, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export default TaskContext;

import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>CheckPointSpot Tasking System</h1>
      <TaskForm />
      <TaskList />
    </div>
  );
}

export default App;

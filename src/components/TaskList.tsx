import React, { useState } from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: number) => void;
  onEditTask: (id: number, updates: { name?: string; parentDisplayId?: string | null }) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleStatus, onEditTask }) => {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'DONE' | 'COMPLETE'>('ALL');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editParentDisplayId, setEditParentDisplayId] = useState('');

  // Build full hierarchy including parents
  const buildHierarchy = (task: Task): Task[] => {
    const children = tasks
      .filter(t => t.parentId === task.id)
      .sort((a, b) => a.displayId.localeCompare(b.displayId));
    const subTrees = children.flatMap(child => buildHierarchy(child));
    return [task, ...subTrees];
  };

  const allHierarchicalTasks = tasks
    .filter(task => task.parentId === null)
    .sort((a, b) => a.displayId.localeCompare(b.displayId))
    .flatMap(root => buildHierarchy(root));

  const filteredTasks = allHierarchicalTasks.filter((task) => {
    if (filter === 'ALL') return true;
    if (filter === 'IN_PROGRESS') return task.status === 'IN_PROGRESS';
    if (filter === 'DONE') return task.status === 'DONE';
    if (filter === 'COMPLETE') return task.status === 'COMPLETE';
    return true;
  });

  const isVisible = (task: Task): boolean => {
    if (task.parentId === null) return true;
    const parent = tasks.find(t => t.id === task.parentId);
    if (!parent || !expanded.has(parent.id)) return false;
    return isVisible(parent);
  };

  const visibleFilteredTasks = filteredTasks.filter(isVisible);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const hasChildren = (taskId: number) => tasks.some(t => t.parentId === taskId);

  const getIndentStyle = (level: number) => ({
    paddingLeft: `${level * 30 + 10}px`,
  });

  const getDependencyStats = (task: Task) => {
    const directChildren = tasks.filter(t => t.parentId === task.id);
    const total = directChildren.length;
    const done = directChildren.filter(c => c.status !== 'IN_PROGRESS').length;
    const complete = directChildren.filter(c => c.status === 'COMPLETE').length;
    return { total, done, complete };
  };

  const getDisplayStatus = (task: Task) => {
    const baseStatus = task.status;
    const hasDeps = hasChildren(task.id);

    let color = 'inherit';
    if (baseStatus === 'COMPLETE') color = '#27ae60'; // green
    else if (baseStatus === 'DONE') color = '#e67e22'; // orange
    else color = '#7f8c8d'; // gray

    if (!hasDeps) {
      return <strong style={{ color }}>{baseStatus}</strong>;
    }

    const { total, done, complete } = getDependencyStats(task);

    return (
      <div style={{ lineHeight: '1.4', textAlign: 'center' }}>
        <strong style={{ color }}>{baseStatus}</strong>
        <br />
        <small style={{ color: '#555', fontSize: '12px' }}>
          Dependencies: {done}/{total} done, {complete}/{total} complete
        </small>
      </div>
    );
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditName(task.name);
    const parent = tasks.find(t => t.id === task.parentId);
    setEditParentDisplayId(parent?.displayId || '');
  };

  const saveEdit = (task: Task) => {
    const newParentDisplayId = editParentDisplayId.trim() || null;

    // Validate parent exists and not self or child
    if (newParentDisplayId) {
      const parentTask = tasks.find(t => t.displayId === newParentDisplayId);
      if (!parentTask) {
        alert(`Parent "${newParentDisplayId}" does not exist!`);
        return;
      }
      if (parentTask.id === task.id) {
        alert("A task cannot be its own parent!");
        return;
      }
      // Simple cycle check: if new parent is a descendant
      const descendants = tasks.filter(t => t.parentId === task.id);
      if (descendants.some(d => d.displayId === newParentDisplayId)) {
        alert("Cannot make a child task the parent (circular dependency)!");
        return;
      }
    }

    onEditTask(task.id, {
      name: editName.trim() || task.name,
      parentDisplayId: newParentDisplayId,
    });

    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditParentDisplayId('');
  };

  return (
    <div>
      <h2>Task List</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Filter by Status:
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} style={{ marginLeft: '5px', padding: '5px' }}>
            <option value="ALL">ALL</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
            <option value="COMPLETE">COMPLETE</option>
          </select>
        </label>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', color: 'white' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', color: 'white' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', color: 'white' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', color: 'white' }}>Action</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', color: 'white' }}>Edit</th>
          </tr>
        </thead>
        <tbody>
          {visibleFilteredTasks.map((task) => {
            const level = task.displayId.split('.').length - 1;
            const isEditing = editingId === task.id;

            return (
              <tr key={task.id} style={{ backgroundColor: level % 2 ? '#f9f9f9' : 'white' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px', ...getIndentStyle(level) }}>
                  {hasChildren(task.id) && (
                    <span
                      style={{ cursor: 'pointer', marginRight: '8px', fontWeight: 'bold', userSelect: 'none' }}
                      onClick={() => toggleExpand(task.id)}
                    >
                      {expanded.has(task.id) ? '▼' : '▶'}
                    </span>
                  )}
                  <strong>{task.displayId}</strong>
                </td>

                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: '90%', padding: '4px' }}
                      autoFocus
                    />
                  ) : (
                    task.name
                  )}
                </td>

                <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                  {getDisplayStatus(task)}
                </td>

                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={task.status !== 'IN_PROGRESS'}
                    onChange={() => onToggleStatus(task.id)}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                </td>

                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(task)} style={{ marginRight: '5px', background: '#27ae60', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                        Save
                      </button>
                      <button onClick={cancelEdit} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(task)}
                      style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  )}
                  {isEditing && (
                    <div style={{ marginTop: '8px' }}>
                      <small>Parent ID:</small><br />
                      <input
                        type="text"
                        value={editParentDisplayId}
                        onChange={(e) => setEditParentDisplayId(e.target.value)}
                        placeholder="Leave empty for top-level"
                        style={{ width: '80%', padding: '4px' }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {visibleFilteredTasks.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px', fontStyle: 'italic' }}>
          No tasks match the selected filter.
        </p>
      )}
    </div>
  );
};

export default TaskList;
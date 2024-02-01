import React, { useState, useEffect, useContext } from 'react';
import './App.css';

// Vytvořte kontext pro správu stavů
const TodoContext = React.createContext();

// Vytvořte vlastní hook pro přístup k kontextu
const useTodoContext = () => {
  return useContext(TodoContext);
};

const TodoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Načtení stavu ze storage po načtení komponenty
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Ukládání stavu do storage při změně stavu úkolů
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const updateTask = (taskId, updatedTask) => {
    setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
  };

  return (
    <TodoContext.Provider value={{ tasks, addTask, removeTask, updateTask }}>
      {children}
    </TodoContext.Provider>
  );
};

const TaskForm = () => {
  const { tasks, addTask } = useTodoContext();
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('General');

  const handleAddTask = () => {
    if (newTask.trim() !== '' && !tasks.some((task) => task.text === newTask && task.category === category)) {
      addTask({ id: Date.now(), text: newTask, completed: false, category });
      setNewTask('');
      setCategory('General');
    }
  };

  return (
    <div className="task-form">
      <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task" />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="General">Ostatní</option>
        <option value="Work">Práce</option>
        <option value="Home">Domov</option>
        <option value="Hobby">Hobby</option>
      </select>
      <button onClick={handleAddTask}>Přidat Úkol</button>
    </div>
  );
};

const TaskList = () => {
  const { tasks, removeTask, updateTask } = useTodoContext();
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedText, setEditedText] = useState('');

  const handleEdit = (taskId, text) => {
    setEditTaskId(taskId);
    setEditedText(text);
  };

  const handleSaveEdit = (taskId) => {
    updateTask(taskId, { ...tasks.find((task) => task.id === taskId), text: editedText });
    setEditTaskId(null);
    setEditedText('');
  };

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => updateTask(task.id, { ...task, completed: !task.completed })}
          />
          {editTaskId === task.id ? (
            <>
              <input type="text" value={editedText} onChange={(e) => setEditedText(e.target.value)} />
              <button onClick={() => handleSaveEdit(task.id)}>Uložit</button>
            </>
          ) : (
            <div className="task-details">
              <span>{task.text}</span>
              <span className="category">{task.category}</span>
            </div>
          )}
          <div className="task-actions">
            {editTaskId !== task.id && <button onClick={() => handleEdit(task.id, task.text)}>Upravit</button>}
            <button onClick={() => removeTask(task.id)}>Odstranit</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const App = () => {
  return (
    <TodoProvider>
      <div className="container">
        <h1>Todo App</h1>
        <TaskForm />
        <TaskList />
      </div>
    </TodoProvider>
  );
};

export default App;

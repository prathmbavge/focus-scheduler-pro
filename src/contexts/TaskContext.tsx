import React, { createContext, useState, useContext } from 'react';
import taskService from '../services/taskService';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const completeTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
      throw new Error('Error completing task');
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, setTasks, completeTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
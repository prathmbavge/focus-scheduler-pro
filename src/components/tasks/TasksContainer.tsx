import React, { useState } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { Task } from '@/context/TaskContext';

const TasksContainer: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset editingTask when the modal is closed to ensure form is always clean on next open
    setTimeout(() => {
      setEditingTask(null);
    }, 300); // Small delay to ensure the form closes before resetting the state
  };

  return (
    <div className="p-6">
      <TaskList 
        onAddTask={handleAddTask} 
        onEditTask={handleEditTask} 
      />
      
      <TaskForm 
        isOpen={showModal}
        onClose={handleCloseModal}
        editingTask={editingTask}
      />
    </div>
  );
};

export default TasksContainer;

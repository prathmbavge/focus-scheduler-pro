import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, useTaskContext } from '@/context/TaskContext';
import CustomButton from '@/components/ui/CustomButton';
import { X } from 'lucide-react';
import { toast } from "sonner";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, editingTask }) => {
  const { addTask, updateTask, loading } = useTaskContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('coding');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');

  // Initialize form with task data when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate.split('T')[0]); // Get only the date part
      setStatus(editingTask.status);
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setCategory('coding');
      setPriority('medium');
      setDueDate('');
      setStatus('todo');
    }
  }, [editingTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    // Ensure dueDate has a value, default to today
    const formattedDueDate = dueDate 
      ? new Date(dueDate).toISOString() 
      : new Date().toISOString();

    try {
      setIsSubmitting(true);
      
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, {
          title,
          description,
          category,
          priority,
          dueDate: formattedDueDate,
          status
        });
      } else {
        // Add new task
        await addTask({
          title,
          description,
          category,
          priority,
          dueDate: formattedDueDate,
          status
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("There was an error saving the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-w/50">
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            disabled={isSubmitting}
          >
            <X size={18} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                focus:ring-2 focus:ring-primary/50 focus:border-primary
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              disabled={isSubmitting}
              required
              placeholder="Enter task title..."
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 
                focus:ring-2 focus:ring-primary/50 focus:border-primary
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                min-h-[100px] resize-y"
              disabled={isSubmitting}
              placeholder="Describe your task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                  focus:ring-2 focus:ring-primary/50 focus:border-primary"
                disabled={isSubmitting}
              >
                <option value="coding">Coding</option>
                <option value="study">Study</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                  focus:ring-2 focus:ring-primary/50 focus:border-primary"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                  focus:ring-2 focus:ring-primary/50 focus:border-primary"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                  focus:ring-2 focus:ring-primary/50 focus:border-primary"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </CustomButton>
            <CustomButton 
              type="submit"
              isLoading={isSubmitting || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

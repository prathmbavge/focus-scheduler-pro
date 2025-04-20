import React, { useState } from 'react';
import { Calendar, Clock, Edit, Trash } from 'lucide-react';
import { Task, TaskPriority } from '@/context/TaskContext';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(task.id);
      // Add a small delay for the animation
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsCompleting(false);
    }
  };

  // Function to get priority styling
  const getPriorityStyles = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // Function to get category styling
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'coding':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30';
      case 'study':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30';
      case 'personal':
        return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // Function to safely get time ago
  const getTimeAgo = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid date';
    }
  };

  // Safely format the due date
  const getDueIn = () => {
    try {
      if (!task.dueDate) {
        return 'No due date';
      }

      // Handle both ISO string and MySQL datetime format
      const date = typeof task.dueDate === 'string' 
        ? parseISO(task.dueDate)
        : new Date(task.dueDate);

      if (!isValid(date)) {
        return 'Invalid date';
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Due date parsing error:', error);
      return 'No due date';
    }
  };

  const dueIn = getDueIn();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      className={`task-card glass-card w-full break-inside-avoid mb-4 transition-all duration-300 hover:shadow-lg
        ${isCompleting ? 'opacity-0 transform translate-x-full' : ''} 
        ${task.status === 'completed' ? 'opacity-80' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
        <div className="flex items-center flex-1 min-w-0">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={handleComplete}
            className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-primary text-primary focus:ring-primary"
          />
          <h3 className={`ml-2 font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 ml-7 line-clamp-2 sm:line-clamp-none">{task.description}</p>

      <div className="flex flex-wrap gap-2 ml-7">
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityStyles(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryStyles(task.category)}`}>
          {task.category}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 ml-7 text-xs text-muted-foreground">
        <Calendar size={14} className="mr-1" />
        <span>Due {task.dueDate ? dueIn : 'Not set'}</span>
        
        {task.timeSpent > 0 && (
          <>
            <span className="mx-2">•</span>
            <Clock size={14} className="mr-1" />
            <span>{task.timeSpent} min spent</span>
          </>
        )}
      </div>

      {task.createdAt && <span>{getTimeAgo(task.createdAt)}</span>}
    </motion.div>
  );
};

export default TaskCard;

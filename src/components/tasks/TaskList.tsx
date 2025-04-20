import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { useTaskContext, Task, TaskStatus, TaskCategory, TaskPriority } from '@/context/TaskContext';
import { Filter, Plus, Eye, EyeOff } from 'lucide-react';
import CustomButton from '../ui/CustomButton';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask, onEditTask }) => {
  const { tasks, loading, error, deleteTask, completeTask, filterTasks, showCompleted, setShowCompleted } = useTaskContext();
  
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = filterTasks(statusFilter, categoryFilter, priorityFilter);

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Skeleton key={index} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <CustomButton 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            <span>Filter</span>
          </CustomButton>
          
          <CustomButton 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1"
          >
            {showCompleted ? (
              <>
                <EyeOff size={16} />
                <span>Hide Completed</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Show Completed</span>
              </>
            )}
          </CustomButton>

          <CustomButton 
            onClick={onAddTask}
            className="flex items-center gap-1 w-full sm:w-auto"
            size="sm"
          >
            <Plus size={16} />
            <span>New Task</span>
          </CustomButton>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-secondary rounded-lg animate-scale-in">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="text-sm p-1 border rounded bg-background"
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')}
              className="text-sm p-1 border rounded bg-background"
            >
              <option value="all">All</option>
              <option value="coding">Coding</option>
              <option value="study">Study</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="text-sm p-1 border rounded bg-background"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="self-end">
            <CustomButton 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
            >
              Reset
            </CustomButton>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No tasks found. Create a new task to get started.</p>
          <CustomButton 
            onClick={onAddTask}
            className="mt-4"
          >
            Create Task
          </CustomButton>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={handleDeleteTask}
              onComplete={completeTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;

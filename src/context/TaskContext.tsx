import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from "sonner";
import * as taskService from '../services/taskService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define task types
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'coding' | 'study' | 'personal';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  timeSpent: number; // in minutes
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'timeSpent'>) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  filterTasks: (status: TaskStatus | 'all', category?: TaskCategory | 'all', priority?: TaskPriority | 'all') => Task[];
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  refreshTasks: () => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [showCompleted, setShowCompleted] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  // Use React Query for data fetching and caching with immediate refetch on window focus
  const { data: fetchedTasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.fetchTasks,
    staleTime: 10 * 1000, // 10 seconds (reduced from 30 seconds)
    refetchInterval: 30 * 1000, // 30 seconds (reduced from 1 minute)
    refetchOnWindowFocus: true, 
    refetchOnMount: true,
  });

  // Combine fetched tasks with optimistic updates
  const tasks = useMemo(() => {
    if (optimisticTasks.length > 0) {
      return optimisticTasks;
    }
    // Ensure fetchedTasks is an array
    return Array.isArray(fetchedTasks) ? fetchedTasks : [];
  }, [fetchedTasks, optimisticTasks]);

  // Reset optimistic tasks when fetched tasks change
  useEffect(() => {
    if (optimisticTasks.length > 0 && fetchedTasks.length > 0) {
      setOptimisticTasks([]);
    }
  }, [fetchedTasks, optimisticTasks.length]);

  // Manual refresh function to force data refresh
  const refreshTasks = useCallback(async () => {
    try {
      // Clear cache to force new fetch
      taskService.invalidateTasksCache();
      console.log('Forcing tasks refresh...');
      
      // Reset optimistic updates to avoid stale data
      setOptimisticTasks([]);
      
      // Force refetch with cache bypass
      const refreshResult = await refetch({
        cancelRefetch: true,  // Cancel any ongoing requests
      });
      
      console.log('Tasks refresh completed:', refreshResult.isSuccess ? 'success' : 'failed');
      return refreshResult.isSuccess;
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      return false;
    }
  }, [refetch]);

  // Mutations with optimistic updates
  const addTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Create optimistic task
      const optimisticTask = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        description: newTask.description || '',
        category: newTask.category,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate,
        createdAt: new Date().toISOString(),
        completedAt: null,
        timeSpent: 0
      };
      
      // Add to optimistic tasks
      setOptimisticTasks([optimisticTask, ...fetchedTasks]);
      
      return { optimisticTask };
    },
    onSuccess: async () => {
      // Force a refresh after successful mutation
      toast.success("Task created successfully");
      await refreshTasks();
    },
    onError: (error: Error) => {
      // Reset optimistic update on error
      setOptimisticTasks([]);
      toast.error(`Failed to create task: ${error.message}`);
    },
    onSettled: () => {
      // Always invalidate tasks query after mutation settles
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, task }: { taskId: string; task: Partial<Task> }) => 
      taskService.updateTask(taskId, task),
    onMutate: async ({ taskId, task }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Optimistically update local tasks
      const updatedTasks = fetchedTasks.map(t => 
        t.id === taskId ? { ...t, ...task } : t
      );
      
      setOptimisticTasks(updatedTasks);
      
      return { updatedTasks };
    },
    onSuccess: async () => {
      toast.success("Task updated successfully");
      await refreshTasks();
    },
    onError: (error: Error) => {
      setOptimisticTasks([]);
      toast.error(`Failed to update task: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Remove task from local state
      const updatedTasks = fetchedTasks.filter(t => t.id !== taskId);
      setOptimisticTasks(updatedTasks);
      
      return { updatedTasks };
    },
    onSuccess: async () => {
      toast.success("Task deleted successfully");
      await refreshTasks();
    },
    onError: (error: Error) => {
      setOptimisticTasks([]);
      toast.error(`Failed to delete task: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: taskService.completeTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Mark task as completed
      const updatedTasks = fetchedTasks.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } 
          : t
      );
      
      setOptimisticTasks(updatedTasks);
      
      return { updatedTasks };
    },
    onSuccess: async () => {
      toast.success("Task completed successfully");
      await refreshTasks();
    },
    onError: (error: Error) => {
      setOptimisticTasks([]);
      toast.error(`Failed to complete task: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Memoized filter function
  const filterTasks = useCallback((
    status: TaskStatus | 'all' = 'all', 
    category: TaskCategory | 'all' = 'all', 
    priority: TaskPriority | 'all' = 'all'
  ) => {
    // Ensure tasks is an array before filtering
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array in filterTasks:', tasks);
      return [];
    }
    
    return tasks.filter(task => 
      (showCompleted || task.status !== 'completed') &&
      (status === 'all' || task.status === status) &&
      (category === 'all' || task.category === category) &&
      (priority === 'all' || task.priority === priority)
    );
  }, [tasks, showCompleted]);

  const contextValue = useMemo(() => ({
    tasks,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    addTask: addTaskMutation.mutateAsync,
    updateTask: (taskId: string, updatedTask: Partial<Task>) => 
      updateTaskMutation.mutateAsync({ taskId, task: updatedTask }),
    deleteTask: deleteTaskMutation.mutateAsync,
    completeTask: completeTaskMutation.mutateAsync,
    filterTasks,
    showCompleted,
    setShowCompleted,
    refreshTasks,
  }), [
    tasks,
    isLoading,
    error,
    addTaskMutation.mutateAsync,
    updateTaskMutation.mutateAsync,
    deleteTaskMutation.mutateAsync,
    completeTaskMutation.mutateAsync,
    filterTasks,
    showCompleted,
    setShowCompleted,
    refreshTasks,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

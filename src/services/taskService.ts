import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/context/TaskContext';

// Cache for storing API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('[TaskService] API URL:', API_URL);

// Helper function to handle API errors with better error messages
const handleApiError = async (response: Response, context: string) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMsg = `[${context}] ${errorData.message || 'Unknown error'} (${response.status})`;
      console.error(errorMsg, { status: response.status, data: errorData });
      throw new Error(errorMsg);
    } catch (e) {
      const errorMsg = `[${context}] Server error (${response.status})`;
      console.error(errorMsg, { status: response.status });
      throw new Error(errorMsg);
    }
  }
  return response.json();
};

// Helper function to check cache
const getFromCache = (key: string) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cache
const setCache = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

// Type for creating a new task
type NewTask = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'timeSpent'>;

// Get all tasks with caching
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const cacheKey = 'tasks';
    
    // Force refresh when called from specific contexts to avoid stale data
    const forceRefresh = localStorage.getItem('forceRefreshTasks') === 'true';
    if (forceRefresh) {
      // Clear the flag after using it
      localStorage.removeItem('forceRefreshTasks');
      // Clear the cache
      responseCache.delete(cacheKey);
      console.debug('[fetchTasks] Force refreshing task data');
    }
    
    // Bypass cache if the force refresh flag is set
    if (!forceRefresh) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.debug('[fetchTasks] Using cached data');
        // Ensure cached data is an array
        return Array.isArray(cachedData) ? cachedData : [];
      }
    }

    if (import.meta.env.DEV) {
      console.debug('[fetchTasks] Requesting tasks from:', `${API_URL}/tasks`);
    }
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('[fetchTasks] Data from server is not an array:', data);
        return [];
      }
      
      console.debug('[fetchTasks] Received', data.length, 'tasks from server');
      setCache(cacheKey, data);
      return data;
    } catch (fetchError) {
      console.error('[fetchTasks] Fetch error:', fetchError);
      return []; // Return empty array instead of throwing
    }
  } catch (error) {
    console.error('[fetchTasks] Unexpected error:', error);
    return []; // Always return an array, even on error
  }
};

// Helper function to invalidate cache and force refresh
export const invalidateTasksCache = () => {
  // Clear all items from the response cache
  responseCache.clear();
  
  // Set a flag to force refresh on next fetch
  localStorage.setItem('forceRefreshTasks', 'true');
  
  // Log the cache invalidation
  console.log('[taskService] Cache cleared and force refresh flagged');
};

// Create a new task with optimistic updates
export const createTask = async (task: NewTask): Promise<Task> => {
  try {
    if (import.meta.env.DEV) {
      console.debug('[createTask] Creating:', task);
    }
    
    // Invalidate cache before the operation to ensure fresh data after
    invalidateTasksCache();
    
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    const data = await handleApiError(response, 'createTask');
    console.debug('[createTask] Successfully created task:', data);
    
    // Ensure cache is cleared after successful creation
    invalidateTasksCache();
    return formatTaskData(data);
  } catch (error) {
    console.error('[createTask]', error);
    throw error instanceof Error ? error : new Error('Failed to create task');
  }
};

// Update an existing task with optimistic updates
export const updateTask = async (taskId: string, updatedTask: Partial<Task>): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    });
    
    const data = await handleApiError(response, 'updateTask');
    // Clear tasks cache and force a refresh on next fetch
    invalidateTasksCache();
    return formatTaskData(data);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error instanceof Error ? error : new Error('Failed to update task');
  }
};

// Helper function to format task data with better type checking
export const formatTaskData = (data: any): Task => {
  try {
    if (!data || !data.id) {
      throw new Error('Invalid task data: Missing required fields');
    }

    // Convert MySQL datetime strings to ISO format with validation
    const formatDate = (dateStr: string | Date | null): string | null => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateStr);
        return null;
      }
      return date.toISOString();
    };

    // Validate enum values
    const validateEnum = <T extends string>(value: any, validValues: T[], defaultValue: T): T => {
      return validValues.includes(value) ? value : defaultValue;
    };

    return {
      id: data.id.toString(),
      title: data.title || '',
      description: data.description || '',
      category: validateEnum(data.category, ['coding', 'study', 'personal'], 'personal'),
      priority: validateEnum(data.priority, ['low', 'medium', 'high'], 'medium'),
      status: validateEnum(data.status, ['todo', 'in-progress', 'completed'], 'todo'),
      createdAt: formatDate(data.createdAt) || new Date().toISOString(),
      completedAt: formatDate(data.completedAt),
      dueDate: formatDate(data.dueDate),
      timeSpent: typeof data.timeSpent === 'number' ? Math.max(0, data.timeSpent) : 0
    };
  } catch (error) {
    console.error('Error formatting task data:', error, data);
    throw new Error('Invalid task data format');
  }
};

// Delete a task with optimistic updates
export const deleteTask = async (taskId: string): Promise<{ id: string }> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    await handleApiError(response, 'deleteTask');
    // Clear tasks cache and force a refresh on next fetch
    invalidateTasksCache();
    return { id: taskId };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error instanceof Error ? error : new Error('Failed to delete task');
  }
};

// Complete a task with optimistic updates
export const completeTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await handleApiError(response, 'completeTask');
    // Clear tasks cache and force a refresh on next fetch
    invalidateTasksCache();
    return formatTaskData(data);
  } catch (error) {
    console.error('Error in completeTask:', error);
    throw error instanceof Error ? error : new Error('Failed to complete task');
  }
};

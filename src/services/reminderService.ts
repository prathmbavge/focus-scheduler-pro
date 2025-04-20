import { API_BASE_URL } from '@/config/api';

// Cache for storing API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Log the API URL being used
console.log('Reminder Service using API URL:', API_URL);

export interface Reminder {
  id: number;
  taskId: number;
  taskTitle?: string;
  reminderTime: string;
  isNotified: boolean;
  createdAt: string;
}

// Helper function to get data from cache
const getFromCache = <T>(key: string): T | null => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

// Helper function to set data in cache
const setCache = <T>(key: string, data: T): void => {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
  const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
  console.error('API Error:', {
    status: response.status,
    statusText: response.statusText,
    errorData
  });
  throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
};

// Get all reminders
export const fetchReminders = async (): Promise<Reminder[]> => {
  try {
    const cacheKey = 'reminders';
    const cachedData = getFromCache<Reminder[]>(cacheKey);
    if (cachedData) {
      console.debug('[fetchReminders] Using cached data');
      return cachedData;
    }

    console.log('Fetching reminders from:', `${API_URL}/reminders`);

    const response = await fetch(`${API_URL}/reminders`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

// Get reminders for a specific task
export const fetchTaskReminders = async (taskId: number): Promise<Reminder[]> => {
  try {
    const cacheKey = `reminders-task-${taskId}`;
    const cachedData = getFromCache<Reminder[]>(cacheKey);
    if (cachedData) {
      console.debug(`[fetchTaskReminders] Using cached data for task ${taskId}`);
      return cachedData;
    }

    console.log(`Fetching reminders for task ${taskId} from:`, `${API_URL}/reminders/task/${taskId}`);

    const response = await fetch(`${API_URL}/reminders/task/${taskId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching reminders for task ${taskId}:`, error);
    throw error;
  }
};

// Get upcoming reminders
export const fetchUpcomingReminders = async (): Promise<Reminder[]> => {
  try {
    const cacheKey = 'upcoming-reminders';
    const cachedData = getFromCache<Reminder[]>(cacheKey);
    if (cachedData) {
      console.debug('[fetchUpcomingReminders] Using cached data');
      return cachedData;
    }

    console.log('Fetching upcoming reminders from:', `${API_URL}/reminders/upcoming`);

    const response = await fetch(`${API_URL}/reminders/upcoming`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    throw error;
  }
};

// Create a new reminder
export const createReminder = async (taskId: number, reminderTime: string): Promise<Reminder> => {
  try {
    console.log('Creating reminder:', { taskId, reminderTime });

    const response = await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskId, reminderTime })
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    
    // Clear the cache after creating a new reminder
    responseCache.delete('reminders');
    responseCache.delete(`reminders-task-${taskId}`);
    responseCache.delete('upcoming-reminders');
    
    return data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

// Mark reminder as notified
export const markReminderAsNotified = async (reminderId: number): Promise<Reminder> => {
  try {
    console.log(`Marking reminder ${reminderId} as notified`);

    const response = await fetch(`${API_URL}/reminders/${reminderId}/notify`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    
    // Clear the cache after updating a reminder
    responseCache.delete('reminders');
    responseCache.delete('upcoming-reminders');
    
    return data;
  } catch (error) {
    console.error(`Error marking reminder ${reminderId} as notified:`, error);
    throw error;
  }
};

// Delete reminder
export const deleteReminder = async (reminderId: number): Promise<{ id: number; message: string }> => {
  try {
    console.log(`Deleting reminder ${reminderId}`);

    const response = await fetch(`${API_URL}/reminders/${reminderId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    
    // Clear the cache after deleting a reminder
    responseCache.delete('reminders');
    responseCache.delete('upcoming-reminders');
    
    return data;
  } catch (error) {
    console.error(`Error deleting reminder ${reminderId}:`, error);
    throw error;
  }
}; 
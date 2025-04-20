import { useTaskContext } from './TaskContext';

/**
 * A wrapper around useTaskContext that safely handles cases where the context is not available.
 * This is useful when components might be rendered outside of a TaskProvider but still need to
 * access task-related functionality in a safe manner.
 */
export const useTaskContextSafe = () => {
  try {
    return useTaskContext();
  } catch (error) {
    // Return a dummy object if context is not available
    return {
      tasks: [],
      loading: false,
      error: null,
      addTask: async () => { console.warn('TaskContext not available'); },
      updateTask: async () => { console.warn('TaskContext not available'); },
      deleteTask: async () => { console.warn('TaskContext not available'); },
      completeTask: async () => { console.warn('TaskContext not available'); },
      filterTasks: () => [],
      showCompleted: false,
      setShowCompleted: () => { console.warn('TaskContext not available'); },
      refreshTasks: async () => {
        console.warn('TaskContext not available');
        return false;
      }
    };
  }
}; 
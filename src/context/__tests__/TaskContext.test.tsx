import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskProvider, useTaskContext } from '../TaskContext';
import * as taskService from '@/services/taskService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock taskService
vi.mock('@/services/taskService', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn(),
}));

// Test component that uses the context
const TestComponent = () => {
  const { tasks, loading, error, addTask, updateTask, deleteTask, completeTask } = useTaskContext();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="tasks-count">{tasks.length}</div>
      <button onClick={() => addTask({
        title: 'Test Task',
        description: 'Test Description',
        category: 'coding',
        priority: 'high',
        status: 'todo',
        dueDate: new Date().toISOString(),
      })}>Add Task</button>
      <button onClick={() => updateTask('1', { title: 'Updated Task' })}>Update Task</button>
      <button onClick={() => deleteTask('1')}>Delete Task</button>
      <button onClick={() => completeTask('1')}>Complete Task</button>
    </div>
  );
};

describe('TaskContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        category: 'coding',
        priority: 'high',
        status: 'todo',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        completedAt: null,
        timeSpent: 0,
      },
    ];

    (taskService.fetchTasks as any).mockResolvedValue(mockTasks);

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('should fetch tasks on mount', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        category: 'coding',
        priority: 'high',
        status: 'todo',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        completedAt: null,
        timeSpent: 0,
      },
    ];

    (taskService.fetchTasks as any).mockResolvedValue(mockTasks);

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
    });
  });

  it('should handle task creation', async () => {
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      category: 'coding',
      priority: 'high',
      status: 'todo',
      dueDate: new Date().toISOString(),
    };

    (taskService.createTask as any).mockResolvedValue({
      ...newTask,
      id: '2',
      createdAt: new Date().toISOString(),
      completedAt: null,
      timeSpent: 0,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    await act(async () => {
      screen.getByText('Add Task').click();
    });

    expect(taskService.createTask).toHaveBeenCalledWith(newTask);
  });

  it('should handle task update', async () => {
    const updatedTask = {
      title: 'Updated Task',
    };

    (taskService.updateTask as any).mockResolvedValue({
      id: '1',
      ...updatedTask,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    await act(async () => {
      screen.getByText('Update Task').click();
    });

    expect(taskService.updateTask).toHaveBeenCalledWith('1', updatedTask);
  });

  it('should handle task deletion', async () => {
    (taskService.deleteTask as any).mockResolvedValue({ id: '1' });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    await act(async () => {
      screen.getByText('Delete Task').click();
    });

    expect(taskService.deleteTask).toHaveBeenCalledWith('1');
  });

  it('should handle task completion', async () => {
    (taskService.completeTask as any).mockResolvedValue({
      id: '1',
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      </QueryClientProvider>
    );

    await act(async () => {
      screen.getByText('Complete Task').click();
    });

    expect(taskService.completeTask).toHaveBeenCalledWith('1');
  });
}); 
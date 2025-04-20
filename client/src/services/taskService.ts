import axios from 'axios';
import { API_BASE_URL } from '../config/api';

import { Task } from '../types/Task';

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tasks`);
    if (!response.data) {
      throw new Error('No data received');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch tasks');
  }
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  try {
    if (!task.title) {
      throw new Error('Task title is required');
    }

    const response = await axios.post(`${API_BASE_URL}/api/tasks`, task);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw new Error(error.response?.data?.error || 'Failed to create task');
  }
};

export const updateTask = async (taskId: number, task: Partial<Task>): Promise<Task> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, task);
    return response.data;
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
};

export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
  } catch (error: any) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
};

export const completeTask = async (taskId: number): Promise<Task> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tasks/${taskId}/complete`);
    if (!response.data) {
      throw new Error('No data received');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error completing task:', error);
    throw new Error(error.response?.data?.error || 'Failed to complete task');
  }
};

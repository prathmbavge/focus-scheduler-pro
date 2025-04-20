import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const geminiApi = {
  generateContent: async (prompt: string) => {
    try {
      const response = await api.post('/gemini/generate', { prompt });
      return response.data;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
};

export const taskApi = {
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  createTask: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  updateTask: async (id: string, taskData: any) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default api; 
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

console.log('API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false // Setting to false to avoid CORS preflight issues
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // Debug log for request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error cases
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
const handleApiError = (error: any, context: string) => {
  console.error(`${context} Error:`, error);
  throw error;
};

// API endpoints
export const geminiApi = {
  generateContent: async (prompt: string) => {
    try {
      const response = await api.post('/gemini/generate', { prompt });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Gemini API');
    }
  }
};

export const taskApi = {
  getAllTasks: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Get Tasks');
    }
  },
  createTask: async (taskData: any) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Create Task');
    }
  },
  updateTask: async (id: string, taskData: any) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Update Task');
    }
  },
  deleteTask: async (id: string) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Delete Task');
    }
  }
};

export default api; 
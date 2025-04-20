// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Validate that the API URL is set
if (!API_BASE_URL) {
    console.error('API URL is not set. Please check your environment variables.');
}

console.log('API Base URL:', API_BASE_URL);

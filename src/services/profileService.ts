import { API_BASE_URL } from '@/config/api';

// Cache for storing API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Log the API URL being used
console.log('Profile Service using API URL:', API_URL);

interface Profile {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
  createdAt: string;
  updatedAt: string;
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

// Helper function to validate profile data
const validateProfile = (data: any): Profile => {
  console.log('Validating profile data:', JSON.stringify(data, null, 2));

  if (!data || typeof data !== 'object') {
    console.error('Invalid profile data: data is not an object');
    throw new Error('Invalid profile data: data is not an object');
  }

  const requiredFields = ['id', 'username', 'email', 'name', 'role'];
  const missingFields = requiredFields.filter(field => {
    const hasField = field in data;
    console.log(`Checking field ${field}:`, hasField);
    return !hasField;
  });
  
  if (missingFields.length > 0) {
    console.error('Profile validation failed:', {
      missingFields,
      receivedData: data
    });
    throw new Error(`Invalid profile data: Missing required fields: ${missingFields.join(', ')}`);
  }

  const profile: Profile = {
    id: Number(data.id),
    username: String(data.username),
    email: String(data.email),
    name: String(data.name),
    role: String(data.role),
    preferences: data.preferences || {},
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt || data.createdAt)
  };

  console.log('Validated profile:', JSON.stringify(profile, null, 2));
  return profile;
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

export const fetchProfile = async (): Promise<Profile> => {
  try {
    const cacheKey = 'profile';
    const cachedData = getFromCache<Profile>(cacheKey);
    if (cachedData) {
      console.debug('[fetchProfile] Using cached data');
      return cachedData;
    }

    console.log('Fetching profile from:', `${API_URL}/profile/current-user`);

    const response = await fetch(`${API_URL}/profile/current-user`, {
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
    console.log('Received profile data:', JSON.stringify(data, null, 2));

    const validatedProfile = validateProfile(data);
    setCache(cacheKey, validatedProfile);
    return validatedProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
  try {
    console.log('Updating profile with data:', JSON.stringify(profileData, null, 2));

    const response = await fetch(`${API_URL}/profile/current-user`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    console.log('Received updated profile data:', JSON.stringify(data, null, 2));

    const validatedProfile = validateProfile(data);
    
    // Clear the cache after successful update
    responseCache.delete('profile');
    
    return validatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProfile, updateProfile, type Profile } from '@/services/profileService';
import { toast } from 'sonner';

interface UserContextType {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  updateUser: (data: Partial<Profile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await fetchProfile('current-user');
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = async (data: Partial<Profile>) => {
    try {
      if (!user) return;
      const updated = await updateProfile(user.userId, data);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

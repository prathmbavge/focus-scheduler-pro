import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task } from './TaskContext';
import { searchTasks } from '@/services/searchService';

interface SearchContextType {
  searchQuery: string;
  searchResults: Task[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (tasks: Task[]) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((tasks: Task[]) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = searchTasks(tasks, searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      searchResults,
      isSearching,
      setSearchQuery,
      performSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

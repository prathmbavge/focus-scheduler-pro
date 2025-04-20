import React, { useState } from 'react';
import { Bell, Moon, Search, Settings, Sun, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '@/context/SearchContext';
import { useTaskContext } from '@/context/TaskContext';

const Navbar: React.FC = () => {
  const { tasks } = useTaskContext();
  const { searchQuery, setSearchQuery, performSearch, clearSearch } = useSearch();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Add a small delay to let the transition complete
    requestAnimationFrame(() => {
      if (isDarkMode) {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(tasks);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[50] h-16 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="hidden sm:inline">Student Productivity</span>
            <span className="inline sm:hidden">StudyPro</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 mx-4 lg:mx-8 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, notes, and more..."
              className="h-9 w-full rounded-md border border-input bg-background px-10 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border border-input bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-100">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors md:hidden">
            <Search className="h-5 w-5" />
          </button>
          
          <button 
            className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-destructive"></span>
          </button>
          
          <Link to="/settings" className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <Settings className="h-5 w-5" />
          </Link>
          
          <Link 
            to="/profile"
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React from 'react';
import { useSearch } from '@/context/SearchContext';
import TaskCard from '@/components/tasks/TaskCard';
import { useTaskContext } from '@/context/TaskContext';

const SearchResults: React.FC = () => {
  const { searchResults, isSearching, searchQuery } = useSearch();
  const { completeTask, deleteTask } = useTaskContext();

  if (!isSearching) return null;

  return (
    <div className="fixed inset-x-0 top-16 z-40 bg-background/80 backdrop-blur-md border-b">
      <div className="container py-4">
        <h3 className="text-lg font-medium mb-4">
          {searchResults.length === 0 
            ? `No results found for "${searchQuery}"`
            : `Found ${searchResults.length} results for "${searchQuery}"`}
        </h3>
        
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-4">
          {searchResults.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => {}}
              onDelete={deleteTask}
              onComplete={completeTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

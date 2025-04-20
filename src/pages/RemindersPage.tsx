import React from 'react';
import { ReminderList } from '@/components/ReminderList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const RemindersPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Reminders</h1>
        <Button asChild>
          <Link to="/tasks">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ReminderList />
      </div>
    </div>
  );
};

export default RemindersPage; 
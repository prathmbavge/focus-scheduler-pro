import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import TasksContainer from '@/components/tasks/TasksContainer';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { AITaskChatBot } from '@/components/ai/AITaskChatBot';

const Tasks: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Tasks</h1>
              <p className="text-muted-foreground">Manage your tasks and stay productive</p>
            </div>
            <div className="flex gap-2">
              <AIAssistant />
              <AITaskChatBot />
            </div>
          </div>
          
          <TasksContainer />
        </div>
      </main>
    </div>
  );
};

export default Tasks;

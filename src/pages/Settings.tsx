import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import CustomButton from '@/components/ui/CustomButton';
import { Bell, CheckCircle, Moon, Save, Sparkles, User, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAI } from '@/context/AIContext';
import { useUser } from '@/context/UserContext';
import { Input } from "@/components/ui/input"; // Add this import

const Settings: React.FC = () => {
  const { user, updateUser } = useUser();
  const { isEnabled, setIsEnabled } = useAI();
  
  // Theme and notification settings
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notifyBeforeDeadline, setNotifyBeforeDeadline] = useState(true);
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(true);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: user?.name,
        email: user?.email,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  // Toggle dark mode
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

  // Replace the enableAiSuggestions state with the context value
  const toggleAIFeatures = () => {
    setIsEnabled(!isEnabled);
    toast.success(`AI features ${!isEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <Navbar />
      <Sidebar />
      
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Profile Section */}
            <section className="settings-card">
              <h2 className="settings-heading">
                <User size={20} className="text-primary" />
                User Profile
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="name" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={user?.name || ''}
                    onChange={(e) => updateUser({ ...user, name: e.target.value })}
                    className="h-10 px-3 bg-background transition-colors border border-input rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-ring hover:bg-accent/50"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    onChange={(e) => updateUser({ ...user, email: e.target.value })}
                    className="h-10 px-3 bg-background transition-colors border border-input rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-ring hover:bg-accent/50"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </section>
            
            {/* Appearance Section */}
            <section className="settings-card">
              <h2 className="settings-heading">
                <Moon size={20} className="text-primary" />
                Appearance
              </h2>
              
              <div className="settings-option" onClick={toggleDarkMode}>
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </p>
                </div>
                
                <div className="relative inline-flex h-6 w-11 items-center rounded-full 
                  transition-colors focus:outline-none
                  bg-secondary dark:bg-secondary/50">
                  <span
                    className={`${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full 
                    bg-primary transition-transform`}
                  />
                </div>
              </div>
            </section>
            
            {/* Notifications Section */}
            <section className="settings-card">
              <h2 className="settings-heading">
                <Bell size={20} className="text-primary" />
                Notifications
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 hover:bg-secondary rounded-md cursor-pointer transition-colors" onClick={() => setEnableNotifications(!enableNotifications)}>
                  <div>
                    <h3 className="font-medium">Enable Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications from the app</p>
                  </div>
                  
                  {enableNotifications ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 hover:bg-secondary rounded-md cursor-pointer transition-colors" onClick={() => setNotifyBeforeDeadline(!notifyBeforeDeadline)}>
                  <div>
                    <h3 className="font-medium">Task Deadline Reminders</h3>
                    <p className="text-sm text-muted-foreground">Get notified before task deadlines</p>
                  </div>
                  
                  {notifyBeforeDeadline ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 hover:bg-secondary rounded-md cursor-pointer transition-colors" onClick={() => setNotifyOnCompletion(!notifyOnCompletion)}>
                  <div>
                    <h3 className="font-medium">Task Completion Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified when tasks are completed</p>
                  </div>
                  
                  {notifyOnCompletion ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-muted-foreground" />
                  )}
                </div>
              </div>
            </section>
            
            {/* AI Features Section */}
            <section className="settings-card">
              <h2 className="settings-heading">
                <Sparkles size={20} className="text-primary" />
                AI Features
              </h2>
              
              <div className="settings-option" onClick={toggleAIFeatures}>
                <div>
                  <h3 className="font-medium">AI Task Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered suggestions for task management, scheduling optimization, and study patterns
                  </p>
                </div>
                
                {isEnabled ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-muted-foreground" />
                )}
              </div>

              <div className="mt-4 p-4 rounded-lg bg-accent/50 backdrop-blur-sm">
                <h4 className="font-medium mb-2">AI Features Include:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Smart task prioritization</li>
                  <li>• Schedule optimization</li>
                  <li>• Study pattern analysis</li>
                  <li>• Task suggestions based on your habits</li>
                </ul>
              </div>
            </section>
            
            <div className="flex justify-end">
              <CustomButton
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r 
                from-primary to-primary/90 hover:to-primary"
              >
                <Save size={16} />
                <span>Save Settings</span>
              </CustomButton>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;

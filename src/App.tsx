import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import { SearchProvider } from './context/SearchContext';
import { AIProvider } from './context/AIContext';
import { UserProvider } from './context/UserContext';
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import RemindersPage from "./pages/RemindersPage";
import NotFound from "./pages/NotFound";
import NewUserDialog from "./components/NewUserDialog";
import useWebSocket from "./hooks/useWebSocket";

// Create a new query client with stale time configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    },
  },
});

// Local storage key for checking first-time users
const FIRST_VISIT_KEY = 'focus-scheduler-first-visit';

// WebSocket provider component that handles connection and error states
const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { connectionError } = useWebSocket({
    autoConnect: true,
    onError: (error) => {
      console.error('WebSocket error in global provider:', error);
    }
  });

  // Render children regardless of WebSocket status - features will degrade gracefully
  return <>{children}</>;
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <UserProvider>
            <AIProvider>
              <SearchProvider>
                <TaskProvider>
                  <WebSocketProvider>
                    <AppContent />
                  </WebSocketProvider>
                </TaskProvider>
              </SearchProvider>
            </AIProvider>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Internal Content Component with access to all providers
const AppContent = () => {
  // State to track if this is a first-time user
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Setup WebSocket connection now that we have all contexts available
  useWebSocket({
    onDataReset: () => {
      // Force refresh data when a reset signal is received
      queryClient.invalidateQueries();
    }
  });
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisitedBefore) {
      console.log('First-time user detected');
      setIsFirstVisit(true);
      setDialogOpen(true);
    } else {
      setInitialized(true);
    }
  }, []);
  
  // Handle the completion of the new user setup
  const handleNewUserSetupComplete = () => {
    // Mark that the user has visited before
    localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString());
    setDialogOpen(false);
    setInitialized(true);
  };
  
  return (
    <>
      <Toaster />
      <Sonner />
      
      {/* New user setup dialog */}
      <NewUserDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onComplete={handleNewUserSetupComplete}
      />
      
      {/* Only render routes once initialization is complete or not needed */}
      {(initialized || !isFirstVisit) && (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
};

export default App;

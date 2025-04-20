import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from './TaskContext';
import { toast } from 'sonner';
import * as geminiService from '@/services/geminiService';
import type { TaskSuggestion } from '@/types/ai';

interface AIContextType {
  isEnabled: boolean;
  isApiKeyValid: boolean;
  setIsEnabled: (enabled: boolean) => void;
  validateApiKey: (apiKey?: string) => Promise<boolean>;
  getSuggestions: () => Promise<TaskSuggestion[]>;
  getNextTaskSuggestion: () => Promise<TaskSuggestion | null>;
  optimizeSchedule: (tasks: Task[]) => Promise<Task[]>;
  getChatResponse: (message: string) => Promise<string>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('aiEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);

  // Initialize API validation
  useEffect(() => {
    const validateAPI = async () => {
      try {
        console.log('Validating Gemini API key on startup...');
        const isValid = await geminiService.validateApiKey();
        console.log('API key validation result:', isValid);
        setIsApiKeyValid(isValid);
        
        if (!isValid && isEnabled) {
          toast.warning("AI features are limited due to API key issues. Some features may not work correctly.");
          // Don't disable AI completely, just show a warning
        }
      } catch (error) {
        console.error('API validation error:', error);
        setIsApiKeyValid(false);
        // Don't disable AI completely, just show a warning
        toast.warning("AI features are limited due to API issues. Some features may not work correctly.");
      }
    };

    validateAPI();
  }, [isEnabled]);

  // Persist AI enabled state
  useEffect(() => {
    localStorage.setItem('aiEnabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  const validateApiKey = async (apiKey?: string) => {
    try {
      const isValid = await geminiService.validateApiKey(apiKey);
      setIsApiKeyValid(isValid);
      
      if (isValid) {
        toast.success("API key validated successfully!");
      } else {
        toast.warning("API key validation failed. Some AI features may not work correctly.");
      }
      
      return isValid;
    } catch (error) {
      console.error('API key validation error:', error);
      setIsApiKeyValid(false);
      toast.warning("API key validation failed. Some AI features may not work correctly.");
      return false;
    }
  };

  const getSuggestions = async () => {
    if (!isEnabled) {
      toast.error("AI features are disabled. Enable them in settings to use this feature.");
      return [];
    }
    
    if (!isApiKeyValid) {
      toast.error("Invalid API key. Please check your API key in settings.");
      return [];
    }
    
    try {
      const result = await geminiService.generateTaskSuggestions("Generate 3-5 task suggestions for a productivity app user");
      console.log("AI result:", result);
      
      // If suggestions is already an array of task objects, return it directly
      if (Array.isArray(result)) {
        return result.map(suggestion => ({
          title: suggestion.title || "Untitled Task",
          description: suggestion.description || "No description",
          priority: suggestion.priority || "medium",
          category: suggestion.category || "personal",
          dueDate: suggestion.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
      
      // If suggestions is a string, try to extract structured data
      if (typeof result === 'string') {
        try {
          // Try to find JSON in the response
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            if (Array.isArray(suggestions)) {
              return suggestions.map(suggestion => ({
                title: suggestion.title || "Untitled Task",
                description: suggestion.description || "No description",
                priority: suggestion.priority || "medium",
                category: suggestion.category || "personal",
                dueDate: suggestion.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              }));
            }
          }
        } catch (parseError) {
          console.error("Error parsing suggestion text:", parseError);
        }
      }
      
      // Fallback: Create a single task with the raw text
      return [
        {
          title: "Process AI Suggestions",
          description: typeof result === 'string' ? result.substring(0, 200) + "..." : "AI generated content",
          priority: "medium",
          category: "personal",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to get AI suggestions. Please try again later.");
      return [];
    }
  };

  const getNextTaskSuggestion = async () => {
    if (!isEnabled || !isApiKeyValid) {
      toast.error("AI features are disabled or API key is invalid. Please check settings.");
      return null;
    }
    
    try {
      const suggestion = await geminiService.suggestNextTask([]);
      if (suggestion) {
        toast.success("AI task suggestion ready!");
      }
      return suggestion;
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast.error("Failed to get next task suggestion. Please try again later.");
      return null;
    }
  };

  const optimizeSchedule = async (tasks: Task[]) => {
    if (!isEnabled || !isApiKeyValid) {
      toast.error("AI features are disabled or API key is invalid. Please check settings.");
      return tasks;
    }
    
    try {
      const optimizedTasks = await geminiService.optimizeSchedule(tasks);
      
      if (!optimizedTasks || optimizedTasks.length !== tasks.length) {
        throw new Error('Invalid optimization result');
      }
      
      return optimizedTasks;
    } catch (error) {
      console.error("Schedule optimization error:", error);
      toast.error("Failed to optimize schedule. Please try again later.");
      return tasks;
    }
  };

  const getChatResponse = async (message: string) => {
    if (!isEnabled || !isApiKeyValid) {
      return "AI features are currently disabled. Please check your API key in settings.";
    }
    
    try {
      return await geminiService.getChatResponse(message);
    } catch (error) {
      console.error("AI chat error:", error);
      return "Sorry, I encountered an error processing your request. Please try again later.";
    }
  };

  const value = {
    isEnabled,
    isApiKeyValid,
    setIsEnabled,
    validateApiKey,
    getSuggestions,
    getNextTaskSuggestion,
    optimizeSchedule,
    getChatResponse
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

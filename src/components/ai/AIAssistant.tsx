import React, { useState } from 'react';
import { useAI } from '@/context/AIContext';
import { useTaskContext } from '@/context/TaskContext';
import { Sparkles } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { toast } from 'sonner';
import { TaskSuggestionDialog } from './TaskSuggestionDialog';
import type { TaskSuggestion } from '@/services/aiService';

export const AIAssistant = () => {
  const { isEnabled, getSuggestions, optimizeSchedule } = useAI();
  const { tasks, updateTask } = useTaskContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);

  const handleGetSuggestions = async () => {
    if (!isEnabled) {
      toast.error("AI features are disabled. Enable them in settings.");
      return;
    }

    const toastId = toast.loading("Getting AI suggestions...");
    
    try {
      const newSuggestions = await getSuggestions();
      if (newSuggestions?.length) {
        setSuggestions(newSuggestions);
        setDialogOpen(true);
        toast.success("AI suggestions ready!", {
          id: toastId
        });
      } else {
        toast.error("No suggestions generated", {
          id: toastId
        });
      }
    } catch (error) {
      toast.error("Failed to get suggestions", {
        id: toastId
      });
    }
  };

  const handleOptimizeSchedule = async () => {
    if (!isEnabled) {
      toast.error("AI features are disabled. Enable them in settings.");
      return;
    }

    const toastId = toast.loading("Optimizing schedule...");
    
    try {
      const optimizedTasks = await optimizeSchedule(tasks);
      
      // Validate optimized tasks before updating
      if (!Array.isArray(optimizedTasks) || optimizedTasks.length !== tasks.length) {
        throw new Error('Invalid optimization result');
      }

      // Count and apply changes
      let updatedCount = 0;
      const updates = [];

      for (const task of optimizedTasks) {
        const originalTask = tasks.find(t => t.id === task.id);
        if (originalTask && task.priority !== originalTask.priority) {
          updates.push(updateTask(task.id, { priority: task.priority }));
          updatedCount++;
        }
      }

      // Wait for all updates to complete
      await Promise.all(updates);
      
      toast.success(
        updatedCount > 0
          ? `Schedule optimized! Updated ${updatedCount} ${updatedCount === 1 ? 'task' : 'tasks'}`
          : "Schedule is already optimized",
        { id: toastId }
      );

    } catch (error) {
      console.error("Schedule optimization error:", error);
      toast.error(
        error.message || "Failed to optimize schedule", 
        { id: toastId }
      );
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <CustomButton
          variant="outline"
          size="sm"
          onClick={handleGetSuggestions}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} />
          <span>Get AI Suggestions</span>
        </CustomButton>

        <CustomButton
          variant="outline"
          size="sm"
          onClick={handleOptimizeSchedule}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} />
          <span>Optimize Schedule</span>
        </CustomButton>
      </div>

      <TaskSuggestionDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        suggestions={suggestions}
      />
    </>
  );
};

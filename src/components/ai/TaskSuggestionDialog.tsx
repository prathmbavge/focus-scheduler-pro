import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskSuggestion } from '@/services/aiService';
import { useTaskContext } from '@/context/TaskContext';
import { format } from 'date-fns';

interface TaskSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: TaskSuggestion[];
}

export function TaskSuggestionDialog({ open, onOpenChange, suggestions }: TaskSuggestionDialogProps) {
  const { addTask } = useTaskContext();

  const handleAddTask = async (suggestion: TaskSuggestion) => {
    await addTask({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      status: 'todo',
      dueDate: suggestion.dueDate
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Task Suggestions</DialogTitle>
          <DialogDescription>
            Based on your work patterns and schedule
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">{suggestion.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Due: {format(new Date(suggestion.dueDate), 'PPP')}</span>
                <Button 
                  size="sm" 
                  onClick={() => handleAddTask(suggestion)}
                >
                  Add Task
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

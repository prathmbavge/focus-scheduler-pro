import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useTaskContext, Task } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function TaskCalendar() {
  const { tasks } = useTaskContext();
  const [selected, setSelected] = useState<Date>();

  // Get dates with tasks
  const datesWithCompletedTasks = tasks
    .filter(task => task.status === 'completed')
    .map(task => new Date(task.dueDate));

  const datesWithIncompleteTasks = tasks
    .filter(task => task.status !== 'completed')
    .map(task => new Date(task.dueDate));

  // Get tasks for selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Custom modifiers for different task states
  const modifiers = {
    completed: datesWithCompletedTasks,
    incomplete: datesWithIncompleteTasks,
  };

  // Custom styles for different task states
  const modifiersStyles = {
    completed: {
      backgroundColor: 'hsl(var(--success) / 0.2)',
      borderRadius: '100%',
    },
    incomplete: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderRadius: '100%',
    }
  };

  const footer = selected ? (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Tasks due on {format(selected, 'PP')}:</h3>
      <ul className="space-y-1">
        {getTasksForDate(selected).map((task: Task) => (
          <li 
            key={task.id}
            className={cn(
              "text-sm px-3 py-2 rounded flex items-center justify-between",
              task.status === 'completed' 
                ? "bg-success/10 text-success" 
                : "bg-secondary/50"
            )}
          >
            <span className="flex items-center gap-2">
              {task.status === 'completed' ? (
                <Check size={14} className="text-success" />
              ) : (
                <Clock size={14} className="text-primary" />
              )}
              {task.title}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              task.status === 'completed'
                ? "bg-success/20 text-success"
                : "bg-primary/20 text-primary"
            )}>
              {task.status === 'completed' ? 'Done' : 'Pending'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <div className="p-4 md:p-6">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays={true}
        footer={footer}
        className={cn(
          "p-4 glass-morph rounded-lg",
          "dark:bg-card [&_.rdp-day]:dark:text-foreground",
          "w-full max-w-sm mx-auto"
        )}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          day_today: "bg-accent text-accent-foreground",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day: "h-9 w-9 text-center rounded-md transition-all data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        }}
      />
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/20" />
          <span>Pending Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success/20" />
          <span>Completed Tasks</span>
        </div>
      </div>
    </div>
  );
}

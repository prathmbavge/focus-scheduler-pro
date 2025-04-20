
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useTaskContext, Task } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { tasks, loading, error } = useTaskContext();

  // Filter tasks for the selected date
  const selectedDateTasks = tasks.filter((task) => {
    if (!date) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });

  // Generate date class names for highlighting dates with tasks
  const getDayClassNames = (day: Date): string => {
    const hasTask = tasks.some((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
    });

    return hasTask ? 'font-bold' : '';
  };

  // Get priority badge color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Calendar</h1>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    modifiersClassNames={{
                      selected: 'bg-primary text-primary-foreground',
                    }}
                    components={{
                      DayContent: ({ date: dayDate }) => (
                        <div className={getDayClassNames(dayDate)}>
                          {dayDate.getDate()}
                        </div>
                      ),
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {date ? format(date, 'MMMM d, yyyy') : 'No Date Selected'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <Skeleton key={index} className="h-24 w-full" />
                    ))}
                  </div>
                ) : selectedDateTasks.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{task.title}</h3>
                            <p className="text-muted-foreground">{task.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge>{task.category}</Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks scheduled for this date
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;

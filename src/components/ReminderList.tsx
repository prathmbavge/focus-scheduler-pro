import React, { useEffect, useState } from 'react';
import { fetchReminders, fetchUpcomingReminders, deleteReminder, markReminderAsNotified, Reminder } from '@/services/reminderService';
import { format } from 'date-fns';
import { Bell, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        setLoading(true);
        const [allReminders, upcoming] = await Promise.all([
          fetchReminders(),
          fetchUpcomingReminders()
        ]);
        setReminders(allReminders);
        setUpcomingReminders(upcoming);
        setError(null);
      } catch (err) {
        console.error('Error loading reminders:', err);
        setError('Failed to load reminders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  const handleDeleteReminder = async (id: number) => {
    try {
      await deleteReminder(id);
      setReminders(reminders.filter(reminder => reminder.id !== id));
      setUpcomingReminders(upcomingReminders.filter(reminder => reminder.id !== id));
      toast.success('Reminder deleted successfully');
    } catch (err) {
      console.error('Error deleting reminder:', err);
      toast.error('Failed to delete reminder');
    }
  };

  const handleMarkAsNotified = async (id: number) => {
    try {
      await markReminderAsNotified(id);
      setReminders(reminders.map(reminder => 
        reminder.id === id ? { ...reminder, isNotified: true } : reminder
      ));
      setUpcomingReminders(upcomingReminders.filter(reminder => reminder.id !== id));
      toast.success('Reminder marked as notified');
    } catch (err) {
      console.error('Error marking reminder as notified:', err);
      toast.error('Failed to mark reminder as notified');
    }
  };

  const formatReminderTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <Badge variant="outline" className="text-sm">
          {reminders.length} total
        </Badge>
      </div>

      {upcomingReminders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Upcoming Reminders</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    {reminder.taskTitle || `Task #${reminder.taskId}`}
                  </CardTitle>
                  <CardDescription>
                    Due: {formatReminderTime(reminder.reminderTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created: {formatReminderTime(reminder.createdAt)}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMarkAsNotified(reminder.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as Notified
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">All Reminders</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reminders.map((reminder) => (
              <Card 
                key={reminder.id} 
                className={reminder.isNotified ? "opacity-70" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className={`h-5 w-5 ${reminder.isNotified ? "text-gray-400" : "text-blue-500"}`} />
                    {reminder.taskTitle || `Task #${reminder.taskId}`}
                  </CardTitle>
                  <CardDescription>
                    Due: {formatReminderTime(reminder.reminderTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created: {formatReminderTime(reminder.createdAt)}
                  </p>
                  {reminder.isNotified && (
                    <Badge variant="secondary" className="mt-2">
                      Notified
                    </Badge>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No reminders</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any reminders yet. Create a task with a due date to get started.
          </p>
        </div>
      )}
    </div>
  );
}; 
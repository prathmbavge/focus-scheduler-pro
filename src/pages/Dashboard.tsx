import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer';
import { Task, useTaskContext } from '@/context/TaskContext';
import TaskCard from '@/components/tasks/TaskCard';
import { Calendar } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

const Dashboard: React.FC = () => {
  const { tasks, loading, error, completeTask, deleteTask } = useTaskContext();
  
  const handleEditTask = (task: Task) => {
    // This will be implemented with navigation to Tasks page with task ID
    console.log('Edit task:', task);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  // Filter tasks due today or in-progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return (
      taskDate.getTime() === today.getTime() && 
      task.status !== 'completed'
    );
  });
  
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  );

  // Combine and de-duplicate tasks
  const importantTasks = [...todayTasks, ...inProgressTasks, ...highPriorityTasks]
    .filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    )
    .slice(0, 5); // Only show top 5

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main className="pt-[4.5rem] lg:pt-20 min-h-[calc(100vh-4rem)] pl-4 pr-4 md:pl-[17rem] lg:pl-[17rem] transition-all duration-300">
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back!</h1>
              </div>
              
              <Link to="/calendar">
                <CustomButton 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  variant="outline"
                >
                  <Calendar size={16} />
                  <span>View Calendar</span>
                </CustomButton>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 h-full">
              {loading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <DashboardOverview />
              )}
            </div>
            
            <div className="lg:col-span-1 h-full">
              <PomodoroTimer />
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mt-8 mb-2">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Important Tasks</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : importantTasks.length === 0 ? (
              <div className="glass-card p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-2">No important tasks for today!</p>
                <Link to="/tasks">
                  <CustomButton 
                    variant="default"
                    className="mt-2"
                  >
                    Create Task
                  </CustomButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {importantTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onComplete={completeTask}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="glass-card p-6 rounded-xl mt-8">
            <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
            <TaskCalendar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

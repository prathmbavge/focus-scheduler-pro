import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useTaskContext } from '@/context/TaskContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, getMonth } from 'date-fns';

const Analytics: React.FC = () => {
  const { tasks } = useTaskContext();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Filter tasks based on time range
  const filteredTasks = tasks.filter(task => {
    const taskDate = parseISO(task.createdAt);
    const now = new Date();
    
    if (timeRange === 'week') {
      return isWithinInterval(taskDate, {
        start: startOfWeek(now),
        end: endOfWeek(now)
      });
    } else if (timeRange === 'month') {
      return isWithinInterval(taskDate, {
        start: startOfDay(subDays(now, 30)),
        end: endOfDay(now)
      });
    }
    
    return true; // 'all' option
  });

  // Prepare data for charts
  const tasksByCategory = {
    coding: filteredTasks.filter(task => task.category === 'coding').length,
    study: filteredTasks.filter(task => task.category === 'study').length,
    personal: filteredTasks.filter(task => task.category === 'personal').length
  };

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo').length,
    inProgress: filteredTasks.filter(task => task.status === 'in-progress').length,
    completed: filteredTasks.filter(task => task.status === 'completed').length
  };

  // Calculate completion rate
  const completionRate = filteredTasks.length > 0
    ? (tasksByStatus.completed / filteredTasks.length) * 100
    : 0;

  // Prepare time spent data by category
  const timeSpentByCategory = [
    {
      name: 'Coding',
      value: filteredTasks
        .filter(task => task.category === 'coding')
        .reduce((total, task) => total + task.timeSpent, 0),
      color: '#2563EB'
    },
    {
      name: 'Study',
      value: filteredTasks
        .filter(task => task.category === 'study')
        .reduce((total, task) => total + task.timeSpent, 0),
      color: '#8B5CF6'
    },
    {
      name: 'Personal',
      value: filteredTasks
        .filter(task => task.category === 'personal')
        .reduce((total, task) => total + task.timeSpent, 0),
      color: '#10B981'
    }
  ];

  // Prepare data for daily activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    return subDays(new Date(), 6 - i);
  });

  const dailyActivity = last7Days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    return {
      name: format(day, 'EEE'),
      completed: tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        isWithinInterval(parseISO(task.completedAt), {
          start: dayStart,
          end: dayEnd
        })
      ).length,
      created: tasks.filter(task =>
        isWithinInterval(parseISO(task.createdAt), {
          start: dayStart,
          end: dayEnd
        })
      ).length
    };
  });

  const categoryData = [
    { name: 'Coding', value: tasksByCategory.coding, color: '#2563EB' },
    { name: 'Study', value: tasksByCategory.study, color: '#8B5CF6' },
    { name: 'Personal', value: tasksByCategory.personal, color: '#10B981' }
  ];

  const statusData = [
    { name: 'To Do', value: tasksByStatus.todo, color: '#F97316' },
    { name: 'In Progress', value: tasksByStatus.inProgress, color: '#3B82F6' },
    { name: 'Completed', value: tasksByStatus.completed, color: '#4ADE80' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      <main className="pt-16 pl-16 md:pl-64 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="week">This Week</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h3>
              <p className="text-3xl font-semibold">{filteredTasks.length}</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</h3>
              <p className="text-3xl font-semibold">{completionRate.toFixed(0)}%</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Time Spent</h3>
              <p className="text-3xl font-semibold">
                {timeSpentByCategory.reduce((total, category) => total + category.value, 0)} min
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-md font-medium mb-4">Tasks by Category</h3>
              <div className="h-64">
                {filteredTasks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} Tasks`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No tasks to display</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-md font-medium mb-4">Tasks by Status</h3>
              <div className="h-64">
                {filteredTasks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        formatter={(value: number) => [`${value} Tasks`, 'Count']}
                      />
                      <Bar dataKey="value" name="Tasks">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No tasks to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl mb-8">
            <h3 className="text-md font-medium mb-4">Daily Activity</h3>
            <div className="h-72">
              {filteredTasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      name="Completed Tasks" 
                      stroke="#4ADE80" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      name="Created Tasks" 
                      stroke="#3B82F6" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No activity data to display</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl">
            <h3 className="text-md font-medium mb-4">Time Spent by Category</h3>
            <div className="h-64">
              {timeSpentByCategory.some(category => category.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSpentByCategory}>
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} minutes`, 'Time Spent']}
                    />
                    <Bar dataKey="value" name="Minutes">
                      {timeSpentByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No time tracking data to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

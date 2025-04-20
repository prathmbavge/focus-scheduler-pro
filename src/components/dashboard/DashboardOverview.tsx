import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTaskContext } from '@/context/TaskContext';

const DashboardOverview: React.FC = () => {
  const { tasks } = useTaskContext();
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'todo').length;
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Group tasks by category
  const tasksByCategory = {
    coding: tasks.filter(task => task.category === 'coding').length,
    study: tasks.filter(task => task.category === 'study').length,
    personal: tasks.filter(task => task.category === 'personal').length
  };

  // Group tasks by priority
  const tasksByPriority = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length
  };

  // Calculate total time spent (in minutes)
  const totalTimeSpent = tasks.reduce((total, task) => total + task.timeSpent, 0);
  
  // Prepare data for charts
  const COLORS = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#10B981',
    orange: '#F97316',
    red: '#EF4444'
  };

  const statusData = [
    { name: 'Completed', value: completedTasks, color: COLORS.green },
    { name: 'In Progress', value: inProgressTasks, color: COLORS.blue },
    { name: 'To Do', value: pendingTasks, color: COLORS.orange }
  ];

  const categoryData = [
    { name: 'Coding', value: tasksByCategory.coding, color: COLORS.blue },
    { name: 'Study', value: tasksByCategory.study, color: COLORS.purple },
    { name: 'Personal', value: tasksByCategory.personal, color: COLORS.green }
  ];

  const priorityData = [
    { name: 'High', value: tasksByPriority.high, color: COLORS.red },
    { name: 'Medium', value: tasksByPriority.medium, color: COLORS.orange },
    { name: 'Low', value: tasksByPriority.low, color: COLORS.green }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="text-base font-medium text-foreground">{payload[0].name}</p>
          <p className="text-lg font-semibold text-foreground">
            {`${payload[0].value} ${payload[0].value === 1 ? 'Task' : 'Tasks'}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].value / totalTasks) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium chart-label"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks Card */}
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</h3>
          <p className="text-3xl font-semibold">{totalTasks}</p>
        </div>
        
        {/* Completion Rate Card */}
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</h3>
          <p className="text-3xl font-semibold">{completionRate}%</p>
        </div>
        
        {/* Pending Tasks Card */}
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Pending Tasks</h3>
          <p className="text-3xl font-semibold">{pendingTasks}</p>
        </div>
        
        {/* Time Spent Card */}
        <div className="glass-card p-4 rounded-xl">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Time Spent</h3>
          <p className="text-3xl font-semibold">{formatTimeSpent(totalTimeSpent)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-morph rounded-xl p-6 card-hover">
          <h3 className="chart-heading">Task Distribution</h3>
          <div className="chart-container">
            {totalTasks > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius="80%"
                    innerRadius="55%"
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="transition-all duration-300 hover:brightness-110"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ outline: 'none' }}
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

        {/* Task Categories */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-md font-medium mb-6 text-foreground">Tasks by Category</h3>
          <div className="h-[300px]">
            {totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} barSize={40}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    className="transition-all duration-200"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80"
                      />
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
          <div className="chart-legend">
            {categoryData.map((entry, index) => (
              <div key={index} className="chart-legend-item">
                <span
                  className="w-3 h-3 rounded-sm transition-colors"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

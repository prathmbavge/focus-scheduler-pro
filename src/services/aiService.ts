import { Task, TaskPriority, TaskCategory } from "@/context/TaskContext";

interface TaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
}

// Mock AI responses for demonstration
const mockSuggestions: TaskSuggestion[] = [
  {
    title: "Review Data Structures",
    description: "Focus on trees, graphs, and dynamic programming concepts",
    priority: "high",
    category: "study",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
  },
  {
    title: "Practice React Hooks",
    description: "Implement custom hooks and study useEffect patterns",
    priority: "medium",
    category: "coding",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
  }
];

export const generateTaskSuggestions = async (existingTasks: Task[]): Promise<TaskSuggestion[]> => {
  // TODO: Replace with actual AI API call
  // This is a mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return mockSuggestions;
};

export const suggestNextTask = async (existingTasks: Task[]): Promise<TaskSuggestion | null> => {
  const completedTasks = existingTasks.filter(task => task.status === 'completed');
  const pendingTasks = existingTasks.filter(task => task.status !== 'completed');
  
  // Analyze patterns in completed tasks
  const mostCommonCategory = getMostCommon(completedTasks.map(t => t.category));
  
  // TODO: Replace with actual AI API call
  // For now, return a task that matches the user's pattern
  return {
    title: `Continue ${mostCommonCategory} Practice`,
    description: `Based on your completion patterns, you should focus on ${mostCommonCategory}`,
    priority: "medium",
    category: mostCommonCategory,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
};

export const optimizeSchedule = async (tasks: Task[]): Promise<Task[]> => {
  // Sort tasks based on priority and due date
  return tasks.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aWeight = priorityWeight[a.priority];
    const bWeight = priorityWeight[b.priority];
    
    if (aWeight !== bWeight) return bWeight - aWeight;
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

// Helper function to find most common item in an array
const getMostCommon = <T>(arr: T[]): T => {
  const counts = arr.reduce((acc, value) => {
    acc[value as any] = (acc[value as any] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] as T;
};

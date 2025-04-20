import { TaskPriority, TaskCategory } from '@/context/TaskContext';

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
}

import { Task } from "@/context/TaskContext";

export const searchTasks = (tasks: Task[], query: string): Task[] => {
  if (!query.trim()) return [];
  
  const searchTerms = query.toLowerCase().trim().split(' ');
  
  return tasks.filter(task => {
    const searchableText = `
      ${task.title.toLowerCase()} 
      ${task.description?.toLowerCase() || ''} 
      ${task.category.toLowerCase()}
      ${task.priority.toLowerCase()}
      ${task.status.toLowerCase()}
    `;

    return searchTerms.every(term => searchableText.includes(term));
  });
};

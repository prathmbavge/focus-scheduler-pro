import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from '@/context/TaskContext';
import type { TaskSuggestion } from '@/types/ai';

// Initialize the Google Generative AI client
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBzlqI9dbLalKsbJZvKi4IQdU4yc_QCuZ0';

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file');
}

console.log('Using API key:', GEMINI_API_KEY ? 'Key is set (not showing for security)' : 'No key found');

// Initialize the AI client with API version
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Use the correct model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Add rate limiting and retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function for making API calls with retries - using direct fetch approach
const makeGeminiRequest = async (prompt: string, apiKey: any) => {
  let lastError;
  
  // Ensure we have a valid API key
  if (!apiKey || (typeof apiKey === 'string' && apiKey.trim() === '')) {
    apiKey = 'AIzaSyBzlqI9dbLalKsbJZvKi4IQdU4yc_QCuZ0'; // Use hardcoded key as fallback
    console.log('Using fallback API key');
  }
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Making Gemini API request (attempt ${attempt + 1}/${MAX_RETRIES})`);
      console.log(`API Key status: ${apiKey ? 'Key is provided (not showing for security)' : 'No key found'}`);
      
      // Use a more direct approach based on the curl example
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        // Extract text from API response
        const textParts = data.candidates[0].content.parts
          .filter(part => part.text)
          .map(part => part.text);
        return textParts.join("\n");
      } else {
        throw new Error('No valid response content found');
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // If the API key is invalid or the model is not found, don't retry
      if (error.message && (
          error.message.includes('API key') || 
          error.message.includes('not found') ||
          error.message.includes('404')
        )) {
        console.error('API key issue detected, not retrying');
        break;
      }
      
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
      }
    }
  }
  throw lastError;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const testGenAI = new GoogleGenerativeAI(apiKey);
    const testModel = testGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Validating Gemini API key...');
    // Simple test prompt to validate the API key
    const testPrompt = "Hello, this is a test prompt to validate the API key.";
    await makeGeminiRequest(testPrompt, apiKey);
    console.log('API key validation successful');
    return true;
  } catch (error) {
    console.error('Gemini API Key validation failed:', error);
    return false;
  }
};

// Add helper function to validate suggestions
function validateSuggestion(suggestion: TaskSuggestion): boolean {
  const validPriorities = ['high', 'medium', 'low'];
  const validCategories = ['coding', 'study', 'personal'];

  try {
    return (
      typeof suggestion.title === 'string' &&
      typeof suggestion.description === 'string' &&
      validPriorities.includes(suggestion.priority.toLowerCase()) &&
      validCategories.includes(suggestion.category.toLowerCase()) &&
      !isNaN(Date.parse(suggestion.dueDate.replace(/"/g, '')))
    );
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

function cleanJSONString(text: string): string {
  // Remove any non-JSON content
  let cleaned = text.replace(/```json\s*|\s*```/g, '');
  
  // Find the first '{' or '[' character
  const startIndex = cleaned.indexOf('{') !== -1 ? 
                    Math.min(cleaned.indexOf('{'), cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity) :
                    cleaned.indexOf('[');
  
  // Find the last '}' or ']' character
  const endIndex = cleaned.lastIndexOf('}') !== -1 ?
                  Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']') !== -1 ? cleaned.lastIndexOf(']') : -Infinity) :
                  cleaned.lastIndexOf(']');
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('No valid JSON structure found');
  }
  
  // Extract only the JSON part
  cleaned = cleaned.substring(startIndex, endIndex + 1);
  
  // Fix common JSON issues
  return cleaned
    .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
    .replace(/([a-zA-Z0-9]+):/g, '"$1":') // Quote unquoted keys
    .replace(/:\s*'([^']*)'/g, ':"$1"') // Convert single quotes to double quotes
    .replace(/\n/g, ' ') // Remove newlines
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

function safeJSONParse(text: string): any {
  try {
    const cleaned = cleanJSONString(text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Original text:', text);
    console.error('Cleaned text:', cleanJSONString(text));
    throw new Error(`Invalid JSON response from AI: ${error.message}`);
  }
}

export const generateTaskSuggestions = async (
  context: string
): Promise<any> => {
  try {
    // Use the server-side proxy endpoint instead of direct Gemini API call
    const apiUrl = `${import.meta.env.VITE_API_URL}/ai/task-suggestions`;
    console.log('Using server proxy endpoint for task suggestions:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    // Return the structured suggestions if available, otherwise return the raw text
    return data.suggestions;
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    throw error;
  }
};

export async function optimizeSchedule(tasks: Task[]): Promise<Task[]> {
  try {
    const prompt = `Given these tasks, optimize their priorities based on deadlines and current status.
    Return a JSON array where each object has ONLY id and priority fields.
    Example format:
    [
      {"id": "123", "priority": "high"},
      {"id": "456", "priority": "medium"}
    ]
    Current tasks: ${JSON.stringify(tasks, null, 2)}`;

    const response = await makeGeminiRequest(prompt, GEMINI_API_KEY || '');
    const updates = safeJSONParse(response);

    // Validate the response
    if (!Array.isArray(updates)) {
      throw new Error('AI response is not an array');
    }

    return tasks.map(task => {
      const update = updates.find(u => u.id === task.id);
      return update ? { ...task, priority: update.priority } : task;
    });
  } catch (error) {
    console.error('Schedule optimization error:', error);
    throw error;
  }
}

// Update chat response to include task suggestions
export async function suggestNextTask(tasks: Task[]): Promise<TaskSuggestion | null> {
  try {
    const prompt = `Based on these existing tasks:
    ${JSON.stringify(tasks)}

    Suggest ONE next task formatted as JSON:
    {
      "title": "<specific task title>",
      "description": "<detailed description>",
      "priority": "high|medium|low",
      "category": "coding|study|personal",
      "dueDate": "<YYYY-MM-DD>"
    }

    Consider:
    - User's current task categories
    - Urgency and priorities
    - Logical next steps
    - Available time slots`;

    const response = await makeGeminiRequest(prompt, GEMINI_API_KEY || '');
    const suggestion = safeJSONParse(response);

    if (!validateSuggestion(suggestion)) {
      throw new Error('Invalid suggestion format');
    }

    return {
      ...suggestion,
      dueDate: new Date(suggestion.dueDate).toISOString(),
      priority: suggestion.priority.toLowerCase(),
      category: suggestion.category.toLowerCase()
    };

  } catch (error) {
    console.error('Next task suggestion failed:', error);
    return null;
  }
}

export const getChatResponse = async (message: string): Promise<string> => {
  try {
    const response = await makeGeminiRequest(message, GEMINI_API_KEY || '');
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get chat response');
  }
}

export async function analyzeTaskCompletion(taskTitle: string, timeSpent: number) {
  try {
    const prompt = `Analyze this completed task: "${taskTitle}" that took ${timeSpent} minutes. Provide brief feedback on time management.`;
    return await makeGeminiRequest(prompt, GEMINI_API_KEY || '');
  } catch (error) {
    console.error('Error analyzing task completion:', error);
    return 'Unable to analyze task completion at this time.';
  }
}
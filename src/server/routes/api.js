import express from 'express';
import { pool, executeQuery } from '../config/database.js';

const router = express.Router();
const API_KEY = "AIzaSyBzlqI9dbLalKsbJZvKi4IQdU4yc_QCuZ0";

// Gemini API endpoint
router.post('/gemini/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log('Handling Gemini API request');
    console.log('API Key status:', API_KEY ? 'Key is provided (not showing for security)' : 'No key found');
    
    if (!API_KEY || (typeof API_KEY === 'string' && API_KEY.trim() === '')) {
      return res.status(500).json({ error: 'API key is not configured properly' });
    }
    
    // Direct fetch approach following the curl pattern
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ error: `Failed to generate content: ${JSON.stringify(errorData)}` });
    }
    
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      // Extract text from API response
      const textParts = data.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text);
      res.json({ text: textParts.join("\n") });
    } else {
      res.status(500).json({ error: 'No valid response content found' });
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001
  });
});

// Profile endpoint
router.get('/profile/current-user', async (req, res) => {
  try {
    // Since there's no authentication yet, return a mock user profile
    res.json({
      id: 1,
      username: "demo_user",
      email: "user@example.com",
      name: "Demo User",
      role: "user",
      preferences: {
        theme: "dark",
        notifications: true
      },
      university: "Demo University",
      studyHours: "25 hours/week",
      joinDate: "2023-06-15",
      createdAt: "2023-06-15T10:00:00Z",
      updatedAt: "2023-09-20T14:30:00Z"
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET tasks endpoint
router.get('/tasks', async (req, res) => {
  try {
    console.log('Fetching tasks from database');
    
    // Try to get tasks from the database using the new executeQuery function
    try {
      const [tasks] = await executeQuery('SELECT * FROM tasks ORDER BY createdAt DESC');
      
      console.log(`Retrieved ${tasks.length} tasks from database`);
      
      // Format dates and return tasks from database even if empty array
      const formattedTasks = tasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description || '',
        category: task.category || 'personal',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
        completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
        timeSpent: task.timeSpent || 0
      }));
      
      console.log(`Returning ${formattedTasks.length} tasks from database`);
      return res.json(formattedTasks);
      
    } catch (dbError) {
      console.error('Database error fetching tasks:', dbError);
      // Only continue to fallback in case of actual database error
      console.warn('Using mock task data as fallback due to database error');
    }
    
    // Fallback to mock data ONLY if database query fails
    const mockTasks = [
      {
        id: "1001",
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the project",
        category: "coding",
        priority: "high",
        status: "todo",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        completedAt: null,
        timeSpent: 0
      },
      {
        id: "1002",
        title: "Prepare for presentation",
        description: "Create slides and practice for upcoming presentation",
        category: "personal",
        priority: "medium",
        status: "in-progress",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        timeSpent: 45
      }
    ];
    
    console.warn('Returning mock tasks');
    res.json(mockTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST task endpoint - Create a new task
router.post('/tasks', async (req, res) => {
  try {
    console.log('Creating new task with data:', JSON.stringify(req.body, null, 2));
    
    const { title, description, category, priority, status, dueDate } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    try {
      // Create task in database using executeQuery
      const query = `
        INSERT INTO tasks (title, description, category, priority, status, dueDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Format values correctly for database insertion
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const values = [
        title,
        description || '',
        category || 'personal',
        priority || 'medium',
        status || 'todo',
        formattedDueDate,
        now
      ];
      
      console.log('Executing task creation query with values:', JSON.stringify(values));
      const [result] = await executeQuery(query, values);
      console.log('Task created in database successfully with ID:', result.insertId);
      
      // Fetch the created task to return complete data
      const [createdTasks] = await executeQuery('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      
      if (createdTasks.length > 0) {
        const createdTask = createdTasks[0];
        console.log('Retrieved created task from database:', JSON.stringify(createdTask, null, 2));
        
        // Format the response data with proper ISO date formatting
        const formattedTask = {
          id: createdTask.id.toString(),
          title: createdTask.title,
          description: createdTask.description || '',
          category: createdTask.category || 'personal',
          priority: createdTask.priority || 'medium',
          status: createdTask.status || 'todo',
          dueDate: createdTask.dueDate ? new Date(createdTask.dueDate).toISOString() : null,
          createdAt: createdTask.createdAt ? new Date(createdTask.createdAt).toISOString() : null,
          completedAt: createdTask.completedAt ? new Date(createdTask.completedAt).toISOString() : null,
          timeSpent: createdTask.timeSpent || 0
        };
        
        return res.status(201).json(formattedTask);
      }
      
      // If we couldn't fetch the created task for some reason, still return a success with basic info
      return res.status(201).json({
        id: result.insertId.toString(),
        title,
        description: description || '',
        category: category || 'personal',
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        timeSpent: 0
      });
      
    } catch (dbError) {
      console.error('Database error during task creation:', dbError);
      return res.status(500).json({ error: 'Database error occurred while creating task' });
    }
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT task endpoint - Update a task
router.put('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = req.body;
    console.log(`Attempting to update task ${taskId} with data:`, updatedTask);

    try {
      // Prepare fields to update from request body
      const fieldsToUpdate = [];
      const values = [];
      
      // Build dynamic query based on provided fields
      if (updatedTask.title !== undefined) {
        fieldsToUpdate.push('title = ?');
        values.push(updatedTask.title);
      }
      
      if (updatedTask.description !== undefined) {
        fieldsToUpdate.push('description = ?');
        values.push(updatedTask.description);
      }
      
      if (updatedTask.priority !== undefined) {
        fieldsToUpdate.push('priority = ?');
        values.push(updatedTask.priority);
      }
      
      if (updatedTask.status !== undefined) {
        fieldsToUpdate.push('status = ?');
        values.push(updatedTask.status);
      }
      
      if (updatedTask.dueDate !== undefined) {
        fieldsToUpdate.push('dueDate = ?');
        values.push(updatedTask.dueDate);
      }
      
      if (updatedTask.category !== undefined) {
        fieldsToUpdate.push('category = ?');
        values.push(updatedTask.category);
      }
      
      if (updatedTask.timeEstimate !== undefined) {
        fieldsToUpdate.push('timeEstimate = ?');
        values.push(updatedTask.timeEstimate);
      }
      
      // Only proceed if there are fields to update
      if (fieldsToUpdate.length > 0) {
        // Build and execute the query
        const query = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        values.push(taskId); // Add the ID as the last parameter
        
        const [result] = await executeQuery(query, values);
        
        if (result.affectedRows > 0) {
          console.log(`Successfully updated task ${taskId}, affected rows: ${result.affectedRows}`);
          
          // Fetch the updated task to return complete data
          const [rows] = await executeQuery('SELECT * FROM tasks WHERE id = ?', [taskId]);
          
          if (rows.length > 0) {
            const task = rows[0];
            // Format dates for API response
            if (task.createdAt) task.createdAt = new Date(task.createdAt).toISOString();
            if (task.completedAt) task.completedAt = new Date(task.completedAt).toISOString();
            if (task.dueDate) task.dueDate = new Date(task.dueDate).toISOString();
            
            return res.json(task);
          }
        } else {
          console.warn(`No task found with ID: ${taskId} for update`);
          return res.status(404).json({ error: 'Task not found' });
        }
      } else {
        console.warn('No valid fields provided for update');
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }
    } catch (dbError) {
      console.error('Database error during task update:', dbError);
      // Continue to fallback response
    }
    
    // Fallback response
    console.warn('Using mock update response as fallback');
    const mockUpdatedTask = {
      id: taskId,
      ...updatedTask,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      ...mockUpdatedTask,
      note: 'This is a fallback response, actual database operation may have failed'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task endpoint - Delete a task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log(`Attempting to delete task with ID: ${taskId}`);
    
    try {
      // Delete from database using executeQuery
      const query = 'DELETE FROM tasks WHERE id = ?';
      const [result] = await executeQuery(query, [taskId]);
      
      if (result.affectedRows > 0) {
        console.log(`Successfully deleted task with ID: ${taskId}, affected rows: ${result.affectedRows}`);
        return res.status(200).json({ message: `Task ${taskId} deleted successfully` });
      } else {
        console.warn(`No task found with ID: ${taskId} for deletion`);
        return res.status(404).json({ error: 'Task not found' });
      }
    } catch (dbError) {
      console.error('Database error during task deletion:', dbError);
      // Continue to fallback
    }
    
    // Fallback response for database failures
    console.warn('Using mock deletion response as fallback');
    res.status(200).json({ 
      message: `Task ${taskId} deletion simulated successfully`,
      note: 'This is a fallback response, actual database operation may have failed'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Database connection check endpoint
router.get('/db-test', async (req, res) => {
  try {
    console.log('Database test endpoint accessed');
    const [result] = await executeQuery('SELECT 1 as connection_test');
    res.json({ 
      message: 'Database connection successful!', 
      details: 'Connected to Railway MySQL database',
      data: result 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
});

// PUT task completion endpoint - Mark a task as completed
router.put('/tasks/:id/complete', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log(`Marking task ${taskId} as completed`);
    
    try {
      // Update the task status in the database
      const query = `
        UPDATE tasks 
        SET status = 'completed', 
            completedAt = CURRENT_TIMESTAMP()
        WHERE id = ?
      `;
      
      const [result] = await executeQuery(query, [taskId]);
      
      if (result.affectedRows > 0) {
        console.log(`Successfully marked task ${taskId} as completed`);
        
        // Fetch the updated task to return complete data
        const [rows] = await executeQuery('SELECT * FROM tasks WHERE id = ?', [taskId]);
        
        if (rows.length > 0) {
          const task = rows[0];
          // Format dates for API response
          if (task.createdAt) task.createdAt = new Date(task.createdAt).toISOString();
          if (task.completedAt) task.completedAt = new Date(task.completedAt).toISOString();
          if (task.dueDate) task.dueDate = new Date(task.dueDate).toISOString();
          
          return res.json(task);
        }
      } else {
        console.warn(`No task found with ID: ${taskId} to mark as completed`);
        return res.status(404).json({ error: 'Task not found' });
      }
    } catch (dbError) {
      console.error('Database error during task completion update:', dbError);
      // Continue to fallback response
    }
    
    // Fallback response
    console.warn('Using mock completion response as fallback');
    const mockCompletedTask = {
      id: taskId,
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    
    res.json({
      ...mockCompletedTask,
      note: 'This is a fallback response, actual database operation may have failed'
    });
  } catch (error) {
    console.error('Error marking task as completed:', error);
    res.status(500).json({ error: 'Failed to mark task as completed' });
  }
});

// AI task suggestions endpoint - server-side proxy to avoid CORS issues with API keys
router.post('/ai/task-suggestions', async (req, res) => {
  try {
    const { context } = req.body;
    
    console.log('Handling AI task suggestions request with context:', context);
    console.log('API Key status:', API_KEY ? 'Key is provided (not showing for security)' : 'No key found');
    
    if (!API_KEY || (typeof API_KEY === 'string' && API_KEY.trim() === '')) {
      return res.status(500).json({ error: 'API key is not configured properly' });
    }
    
    // Create a prompt for task suggestions with structured JSON output format
    const prompt = `
      Based on the following context, suggest 3-5 tasks that might be helpful: ${context || 'Generate task suggestions for a productivity app user'}.
      
      Please format your response as a JSON array of task objects with these fields:
      - title: A short, specific task title
      - description: A detailed description of what needs to be done
      - priority: "high", "medium", or "low"
      - category: "coding", "study", or "personal"
      - dueDate: ISO date string when the task should be completed (YYYY-MM-DD)
      
      IMPORTANT: Respond with ONLY the raw JSON array without any explanation, markdown formatting, or code blocks.
      
      Example:
      [
        {
          "title": "Complete project documentation",
          "description": "Write comprehensive documentation for the project",
          "priority": "high",
          "category": "coding",
          "dueDate": "2023-07-15"
        }
      ]
    `;
    
    // Direct fetch approach following the curl pattern
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    console.log('Making request to Gemini API for task suggestions');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ error: `Failed to generate task suggestions: ${JSON.stringify(errorData)}` });
    }
    
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      // Extract text from API response
      const textParts = data.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text);
      
      const responseText = textParts.join("\n");
      console.log('Received response from Gemini API:', responseText.substring(0, 200) + '...');
      
      // Function to clean and extract JSON
      function cleanJSONString(text) {
        // Remove any markdown code blocks
        let cleaned = text.replace(/```json\s*|\s*```/g, '');
        
        // Find the first '[' character (for array)
        const startIndex = cleaned.indexOf('[');
        
        // Find the last ']' character
        const endIndex = cleaned.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          // Extract only the JSON part
          cleaned = cleaned.substring(startIndex, endIndex + 1);
        }
        
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
      
      // Try to parse the JSON from the response
      try {
        console.log('Attempting to parse JSON response');
        const cleanedJson = cleanJSONString(responseText);
        console.log('Cleaned JSON:', cleanedJson.substring(0, 200) + '...');
        
        const tasks = JSON.parse(cleanedJson);
        
        if (!Array.isArray(tasks)) {
          throw new Error('Parsed JSON is not an array');
        }
        
        console.log(`Successfully parsed JSON response with ${tasks.length} tasks`);
        return res.json({ suggestions: tasks });
      } catch (parseError) {
        console.error('Error parsing AI response as JSON:', parseError);
        
        // Fall back to regex extraction as a last resort
        try {
          const jsonRegex = /\[[\s\S]*\]/g;
          const match = responseText.match(jsonRegex);
          
          if (match && match[0]) {
            const extractedJson = match[0];
            console.log('Extracted JSON using regex:', extractedJson.substring(0, 200) + '...');
            
            const tasks = JSON.parse(extractedJson);
            console.log(`Successfully parsed extracted JSON with ${tasks.length} tasks`);
            return res.json({ suggestions: tasks });
          }
        } catch (extractError) {
          console.error('Error extracting JSON with regex:', extractError);
        }
        
        // If all parsing attempts fail, return the raw response
        return res.status(500).json({ 
          error: 'Failed to parse AI response as JSON',
          rawResponse: responseText
        });
      }
    } else {
      return res.status(500).json({ error: 'No valid response content found' });
    }
  } catch (error) {
    console.error('AI Task Suggestions Error:', error);
    return res.status(500).json({ error: 'Failed to generate task suggestions' });
  }
});

export default router;

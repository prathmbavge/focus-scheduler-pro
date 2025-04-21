const express = require('express');
const router = express.Router();
const pool = require('../config/database');  // This is already the promise pool
const { body, validationResult } = require('express-validator');

// Use our helper instead of directly requiring uuid
const { uuidv4 } = require('../utils/uuid-helper');

// Middleware to check if task exists
const checkTaskExists = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    req.task = rows[0];
    next();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
};

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty().escape(),
  body('description').trim().escape(),
  body('category').isIn(['coding', 'study', 'personal']),
  body('priority').isIn(['low', 'medium', 'high']),
  body('dueDate').isISO8601()
];

// Error checking middleware
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Helper to broadcast task changes via WebSocket
const broadcastTaskChange = (action, task) => {
  if (global.wss) {
    global.wss.broadcast({
      type: 'TASK_UPDATED',
      action,
      task,
      timestamp: new Date().toISOString()
    });
    console.log(`[WebSocket] Broadcasting ${action} for task ${task.id}`);
  }
};

// Get all tasks
router.get('/', async (req, res) => {
    try {
        // Log the request for debugging
        console.log('Fetching all tasks');
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY createdAt DESC');
        console.log(`Found ${rows?.length || 0} tasks`);
        res.json(rows || []);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get tasks by status
router.get('/status/:status', async (req, res, next) => {
  try {
    const { status } = req.params;
    const tasks = await pool.tasks.getByStatus(status);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Get tasks by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const tasks = await pool.tasks.getByCategory(category);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Get overdue tasks
router.get('/overdue', async (req, res, next) => {
  try {
    const tasks = await pool.tasks.getOverdue();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Get tasks due soon
router.get('/due-soon/:days?', async (req, res, next) => {
  try {
    const days = req.params.days ? parseInt(req.params.days) : 7;
    const tasks = await pool.tasks.getDueSoon(days);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Get task statistics
router.get('/statistics', async (req, res, next) => {
  try {
    const stats = await pool.statistics.getTaskStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Create a new task
router.post('/', async (req, res) => {
    try {
        console.log('Creating new task with data:', req.body);
        const { title, description, category, priority, dueDate } = req.body;
        const id = uuidv4();
        
        const query = `
            INSERT INTO tasks (id, title, description, category, priority, dueDate, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, 'todo', NOW())
        `;
        
        await pool.execute(query, [id, title, description, category, priority, dueDate]);
        console.log('Task inserted with ID:', id);
        
        const [newTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        
        // Broadcast the creation via WebSocket
        if (newTask && newTask.length > 0) {
            broadcastTaskChange('created', newTask[0]);
            res.status(201).json(newTask[0]);
        } else {
            console.error('Task created but could not retrieve it');
            res.status(201).json({ id, message: 'Task created but details not available' });
        }
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task', details: error.message });
    }
});

// Update task status
router.put('/:id/status', checkTaskExists, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['todo', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedTask = await pool.tasks.updateStatus(req.params.id, status);
    
    // Broadcast the status update via WebSocket
    broadcastTaskChange('status-updated', updatedTask);
    
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// Complete a task
router.put('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Completing task with ID:', id);
        
        const query = `
            UPDATE tasks
            SET status = 'completed', completedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await pool.execute(query, [id]);
        
        const [updatedTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        
        if (updatedTask.length === 0) {
            console.log('Task not found for ID:', id);
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Broadcast the completion via WebSocket
        broadcastTaskChange('completed', updatedTask[0]);
        
        res.json(updatedTask[0]);
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Failed to complete task', details: error.message });
    }
});

// Update task
router.put('/:id', checkTaskExists, validateTask, checkValidation, async (req, res, next) => {
  try {
    const { title, description, category, priority, dueDate, status } = req.body;
    const taskId = req.params.id;
    
    console.log(`Updating task ${taskId} with data:`, req.body);
    
    // Convert dueDate to MySQL format if present
    const mysqlDueDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;
    
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, category = ?, priority = ?, dueDate = ?, status = ? WHERE id = ?',
      [title, description, category, priority, mysqlDueDate, status || 'todo', taskId]
    );
    
    const [updatedTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    if (updatedTask.length === 0) {
      console.log('Task not found after update for ID:', taskId);
      return res.status(404).json({ error: 'Task not found after update' });
    }
    
    // Broadcast the update via WebSocket
    broadcastTaskChange('updated', updatedTask[0]);
    
    res.json(updatedTask[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    next(err);
  }
});

// Delete task
router.delete('/:id', checkTaskExists, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = req.task;
    
    await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
    
    // Broadcast the deletion via WebSocket
    broadcastTaskChange('deleted', { id: taskId, ...task });
    
    res.json({ id: taskId, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

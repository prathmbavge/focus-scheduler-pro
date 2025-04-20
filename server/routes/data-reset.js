/**
 * Data Reset API Endpoints
 * Provides routes for resetting application data for new users
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST /api/data-reset - Reset database to initial state
router.post('/', async (req, res) => {
  try {
    console.log('[Data Reset] Reset request received');
    
    // This is where you'd normally check authentication,
    // but for this demonstration we'll allow any request
    
    // Perform database reset asynchronously
    try {
      // Disable foreign key checks temporarily
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Get all tables in the database
      const [tables] = await pool.query('SHOW TABLES');
      console.log('[Data Reset] Tables to clear:', tables.map(t => Object.values(t)[0]).join(', '));
      
      // Delete data from each table
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        
        // Use TRUNCATE instead of DELETE for more efficient clearing
        await pool.query(`TRUNCATE TABLE ${tableName}`);
        console.log(`[Data Reset] Cleared table: ${tableName}`);
      }
      
      // Re-enable foreign key checks
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      
      // Create initial data for new users
      console.log('[Data Reset] Creating initial data for new users...');
      
      // Insert starter tasks
      const starterTasks = [
        {
          title: 'Welcome to Focus Scheduler Pro',
          description: 'This is your first task. Click the checkbox to mark it as complete!',
          category: 'personal',
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
        },
        {
          title: 'Create your first real task',
          description: 'Click the "Add Task" button to create a new task with your own details.',
          category: 'personal',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // day after tomorrow
        },
        {
          title: 'Explore the dashboard',
          description: 'Check out the dashboard for an overview of your tasks and progress.',
          category: 'personal',
          priority: 'low',
          status: 'todo',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      ];
      
      // Insert tasks one by one, ensuring fresh timestamps
      const now = new Date();
      
      for (const task of starterTasks) {
        const mysqlDueDate = task.dueDate.toISOString().slice(0, 19).replace('T', ' ');
        const mysqlCreatedAt = now.toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.query(
          'INSERT INTO tasks (title, description, category, priority, status, due_date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            task.title, 
            task.description, 
            task.category, 
            task.priority, 
            task.status, 
            mysqlDueDate,
            mysqlCreatedAt
          ]
        );
        console.log(`[Data Reset] Created starter task: ${task.title}`);
      }
      
      console.log('[Data Reset] Database reset completed successfully');
      
      // Notify WebSocket clients about the reset
      if (global.wss) {
        global.wss.broadcast({
          type: 'DATA_RESET',
          timestamp: new Date().toISOString(),
          message: 'Database has been reset to initial state'
        });
        console.log('[Data Reset] Broadcast reset notification');
      }
      
      // Return success
      res.json({
        success: true,
        message: 'Database reset completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Data Reset] Reset operation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset database',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Data Reset] Error initiating reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data-reset/status - Check reset status
router.get('/status', (req, res) => {
  res.json({
    resetAvailable: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
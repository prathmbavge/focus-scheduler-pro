const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Middleware to check if reminder exists
const checkReminderExists = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    req.reminder = rows[0];
    next();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
};

// Validation middleware
const validateReminder = [
  body('taskId').isInt().withMessage('Task ID must be an integer'),
  body('reminderTime').isISO8601().withMessage('Reminder time must be a valid ISO 8601 date')
];

// Error checking middleware
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, t.title as taskTitle 
      FROM reminders r
      JOIN tasks t ON r.taskId = t.id
      ORDER BY r.reminderTime ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get reminders for a specific task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const [rows] = await pool.query(`
      SELECT r.*, t.title as taskTitle 
      FROM reminders r
      JOIN tasks t ON r.taskId = t.id
      WHERE r.taskId = ?
      ORDER BY r.reminderTime ASC
    `, [taskId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching task reminders:', error);
    res.status(500).json({ error: 'Failed to fetch task reminders' });
  }
});

// Get upcoming reminders
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, t.title as taskTitle 
      FROM reminders r
      JOIN tasks t ON r.taskId = t.id
      WHERE r.reminderTime > NOW() AND r.isNotified = FALSE
      ORDER BY r.reminderTime ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
  }
});

// Create a new reminder
router.post('/', validateReminder, checkValidation, async (req, res) => {
  try {
    const { taskId, reminderTime } = req.body;
    
    // Check if task exists
    const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const query = `
      INSERT INTO reminders (taskId, reminderTime)
      VALUES (?, ?)
    `;
    
    const [result] = await pool.query(query, [taskId, reminderTime]);
    
    const [newReminder] = await pool.query('SELECT * FROM reminders WHERE id = ?', [result.insertId]);
    res.status(201).json(newReminder[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Mark reminder as notified
router.put('/:id/notify', checkReminderExists, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE reminders
      SET isNotified = TRUE
      WHERE id = ?
    `;
    
    await pool.query(query, [id]);
    
    const [updatedReminder] = await pool.query('SELECT * FROM reminders WHERE id = ?', [id]);
    res.json(updatedReminder[0]);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', checkReminderExists, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reminders WHERE id = ?', [id]);
    res.json({ id, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router; 
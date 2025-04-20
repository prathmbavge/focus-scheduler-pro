import { pool } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

// Function to create the required tables
export const initializeDatabase = async () => {
  console.log('Initializing database tables...');
  
  try {
    // Define the simplified task table schema for this application
    const createTasksTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'personal',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
        dueDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        timeSpent INT DEFAULT 0
      );
    `;
    
    // Create indexes for better performance
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_dueDate ON tasks(dueDate);
      CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
    `;
    
    // Execute the table creation queries
    await pool.query(createTasksTableQuery);
    
    // Try to create indexes (this might fail on some MySQL versions)
    try {
      await pool.query(createIndexesQuery);
    } catch (indexError) {
      console.warn('Warning: Could not create indexes. This is not critical:', indexError.message);
    }
    
    // Check if the tasks table was created
    const [tables] = await pool.query('SHOW TABLES');
    const tableExists = tables.some(table => 
      Object.values(table)[0] === 'tasks'
    );
    
    if (tableExists) {
      console.log('Database tables initialized successfully');
      return true;
    } else {
      console.error('Failed to create database tables');
      return false;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

// Function to perform a database health check
export const checkDatabaseHealth = async () => {
  try {
    // Test basic query
    const [result] = await pool.query('SELECT 1 as db_check');
    
    // Test tasks table
    const [tables] = await pool.query('SHOW TABLES');
    const tasksTableExists = tables.some(table => 
      Object.values(table)[0] === 'tasks'
    );
    
    if (!tasksTableExists) {
      console.warn('Tasks table does not exist, will attempt to create it');
      return {
        connected: true,
        tablesExist: false,
        error: null
      };
    }
    
    // Test inserting and querying from the tasks table
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const testTaskTitle = `Test Task ${Math.floor(Math.random() * 10000)}`;
    
    // Insert test task
    const [insertResult] = await pool.query(
      'INSERT INTO tasks (title, description, category, createdAt) VALUES (?, ?, ?, ?)',
      [testTaskTitle, 'Test description', 'test', now]
    );
    
    const testTaskId = insertResult.insertId;
    
    // Verify task was inserted
    const [selectResult] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [testTaskId]
    );
    
    // Clean up test task
    await pool.query('DELETE FROM tasks WHERE id = ?', [testTaskId]);
    
    return {
      connected: true,
      tablesExist: true,
      tasksTableOperational: selectResult.length > 0,
      error: null
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      connected: false,
      tablesExist: false,
      error: error.message
    };
  }
}; 
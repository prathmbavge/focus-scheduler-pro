/**
 * Database reset script
 * This script drops all tables and recreates the schema with initial data for new users
 */
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.temp' });

async function resetDatabase() {
  let connection;
  try {
    // Connection config
    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    };

    console.log('Connecting to database to reset tables...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Disable foreign key checks temporarily
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('Tables to drop:', tableNames.join(', '));

    // Drop each table
    for (const table of tableNames) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✓ Dropped table: ${table}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');

    console.log('✓ All tables have been dropped. Database is now empty.');
    
    // Now recreate the schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found at: ' + schemaPath);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('Recreating database schema...');
    await connection.query(schemaSQL);
    console.log('✓ Schema recreated successfully');
    
    // Create initial data for new users
    console.log('Creating initial data for new users...');
    
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
    
    for (const task of starterTasks) {
      const mysqlDueDate = task.dueDate.toISOString().slice(0, 19).replace('T', ' ');
      await connection.query(
        'INSERT INTO tasks (title, description, category, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.category, task.priority, task.status, mysqlDueDate]
      );
    }
    
    console.log('✓ Initial data created successfully');
    console.log('✓ Database has been reset and initialized for new users');

  } catch (error) {
    console.error('Failed to reset database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// If this script is called directly, run the reset
if (require.main === module) {
  resetDatabase();
} 

// Export the function for use in other scripts
module.exports = { resetDatabase }; 
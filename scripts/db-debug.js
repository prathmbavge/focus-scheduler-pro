import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Database Connection Test and Debug Tool');
  console.log('======================================');
  
  // Print DB Config (masked password)
  const maskedConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: '****' + (process.env.MYSQLPASSWORD?.slice(-4) || ''),
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
  };
  
  console.log('Database Configuration:', maskedConfig);
  
  // Try to connect
  let connection;
  try {
    console.log('\nAttempting to connect to database...');
    connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Connection successful!');
    
    // Show database info
    console.log('\nServer information:');
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`MySQL Version: ${rows[0].version}`);
    
    // Check tables
    console.log('\nChecking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('❌ No tables found in database');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    }
    
    // Check for tasks table
    const tasksTable = tables.find(table => Object.values(table)[0] === 'tasks');
    
    if (!tasksTable) {
      console.log('\n❌ Tasks table not found. Creating it...');
      
      // Create tasks table
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
      
      try {
        await connection.query(createTasksTableQuery);
        console.log('✅ Tasks table created successfully');
      } catch (err) {
        console.error('❌ Error creating tasks table:', err.message);
      }
    } else {
      console.log('\n✅ Tasks table exists');
      
      // Check tasks table structure
      console.log('\nTasks table structure:');
      const [columns] = await connection.query('SHOW COLUMNS FROM tasks');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
      });
      
      // Check for task records
      const [taskCount] = await connection.query('SELECT COUNT(*) as count FROM tasks');
      console.log(`\nTasks table has ${taskCount[0].count} records`);
      
      // Insert a test task if empty
      if (taskCount[0].count === 0) {
        console.log('Inserting a test task...');
        
        const [result] = await connection.query(
          'INSERT INTO tasks (title, description, category, priority, status) VALUES (?, ?, ?, ?, ?)',
          ['Test Task', 'This is a test task created by the debug script', 'personal', 'medium', 'todo']
        );
        
        console.log(`✅ Test task inserted with ID: ${result.insertId}`);
      }
    }
    
    console.log('\nDiagnostic tests completed successfully.');
  } catch (error) {
    console.error('❌ Database connection or query error:', error);
  } finally {
    if (connection) {
      console.log('\nClosing database connection...');
      await connection.end();
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
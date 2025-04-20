-- Start with clean slate by dropping tables in reverse dependency order
DROP TABLE IF EXISTS task_history;
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Create the task_scheduler database if it doesn't exist
CREATE DATABASE IF NOT EXISTS railway;
USE railway;

-- Create simplified tasks table without user references
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

-- Create simple indexes
CREATE INDEX idx_dueDate ON tasks(dueDate);
CREATE INDEX idx_status ON tasks(status);

-- Create users table 
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
);

-- Create sessions table for user authentication
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on token for faster session lookups
CREATE INDEX idx_token ON sessions(token);

-- Create categories table for task organization
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_per_user (name, userId)
);

-- Create task_tags table for flexible task categorization
CREATE TABLE IF NOT EXISTS task_tags (
    taskId VARCHAR(36),
    tagName VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (taskId, tagName)
);

-- Create task_history table for tracking changes
CREATE TABLE IF NOT EXISTS task_history (
    id VARCHAR(36) PRIMARY KEY,
    taskId VARCHAR(36) NOT NULL,
    fieldName VARCHAR(50) NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    changedBy VARCHAR(36)
); 
-- Create and setup database with proper collation
CREATE DATABASE IF NOT EXISTS task_scheduler
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_scheduler;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(255),
    university VARCHAR(100),
    location VARCHAR(100),
    bio TEXT,
    joinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    studyHours INT DEFAULT 0,
    lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#808080',
    userId VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES profiles(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    categoryId INT,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
    dueDate DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME DEFAULT NULL,
    timeSpent INT DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES profiles(userId) ON DELETE SET NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskId INT NOT NULL,
    reminderTime DATETIME NOT NULL,
    isNotified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for optimization
CREATE INDEX idx_tasks_userId ON tasks(userId);
CREATE INDEX idx_tasks_dueDate_status ON tasks(dueDate, status);
CREATE INDEX idx_tasks_category_priority ON tasks(categoryId, priority);
CREATE INDEX idx_tasks_created_at ON tasks(createdAt);
CREATE INDEX idx_categories_userId ON categories(userId);
CREATE INDEX idx_reminders_taskId ON reminders(taskId);
CREATE INDEX idx_reminders_time ON reminders(reminderTime); 
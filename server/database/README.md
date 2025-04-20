# Database Procedures, Triggers, and DBMS Properties

This directory contains SQL scripts and JavaScript utilities for setting up and managing the database for the Task Scheduler application.

## Overview

The database implementation includes:

1. **Stored Procedures**: Pre-compiled SQL statements for common operations
2. **Triggers**: Automatic actions that execute in response to database events
3. **Views**: Virtual tables that simplify complex queries
4. **Functions**: Reusable SQL functions for calculations and data manipulation
5. **Events**: Scheduled tasks that run automatically

## Stored Procedures

### Task Management

- `GetTasksByStatus(statusParam)`: Retrieves tasks filtered by status
- `GetTasksByCategory(categoryParam)`: Retrieves tasks filtered by category
- `GetOverdueTasks()`: Retrieves all overdue tasks
- `GetTasksDueSoon(daysAhead)`: Retrieves tasks due within the specified number of days
- `CompleteTask(taskId, timeSpentMinutes)`: Marks a task as completed and records time spent
- `UpdateTaskStatus(taskId, newStatus)`: Updates the status of a task

### Statistics

- `GetTaskStatistics()`: Retrieves summary statistics about tasks

### User Profile

- `GetUserProfileWithStats(userId)`: Retrieves a user profile with task statistics

## Triggers

1. `before_profile_update`: Updates the lastUpdated timestamp when a profile is modified
2. `after_task_status_change`: Logs task status changes to a history table
3. `after_task_completion`: Updates study hours when a study task is completed
4. `before_task_insert`: Validates task data before insertion

## Views

- `task_summary`: Provides a summary of tasks grouped by category, priority, and status
- `overdue_tasks`: Shows all overdue tasks
- `upcoming_tasks`: Shows tasks due within the next 7 days

## Functions

- `DaysUntilDue(dueDate)`: Calculates the number of days until a task is due
- `PriorityLevel(priority)`: Converts priority text to a numeric level

## Events

- `mark_overdue_tasks`: Daily event that logs overdue tasks

## Usage in Code

The database module (`server/config/database.js`) provides wrapper functions for these procedures:

```javascript
// Example: Get tasks by status
const todoTasks = await db.tasks.getByStatus('todo');

// Example: Complete a task
const completedTask = await db.tasks.complete(taskId, 120); // 120 minutes spent

// Example: Get task statistics
const stats = await db.statistics.getTaskStats();
```

## Setup

The database procedures and triggers are automatically set up when running:

```bash
node server/database/init.js
```

This script is included in the application startup process.

## Manual Setup

To manually set up just the procedures and triggers:

```bash
node server/database/setup_procedures.js
```

## Database Schema

The database schema is defined in `schema.sql` and includes tables for tasks and user profiles with appropriate indexes for performance optimization.
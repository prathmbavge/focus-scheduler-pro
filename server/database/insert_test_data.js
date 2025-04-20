const { pool } = require('../config/database');

const insertTestData = async () => {
  try {
    const testData = [
      {
        title: 'Implement User Authentication',
        description: 'Set up JWT authentication for the application',
        category: 'coding',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
        timeSpent: 180
      },
      {
        title: 'Fix CORS Issues',
        description: 'Debug and resolve CORS configuration problems',
        category: 'coding',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 60
      },
      {
        title: 'Add Unit Tests',
        description: 'Write unit tests for API endpoints',
        category: 'coding',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 0
      },
      {
        title: 'Learn React Hooks',
        description: 'Study and practice React Hooks concepts',
        category: 'study',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 120
      },
      {
        title: 'Database Design Course',
        description: 'Complete online course on database design',
        category: 'study',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 0
      },
      {
        title: 'JavaScript Advanced Topics',
        description: 'Study advanced JS concepts like closures and promises',
        category: 'study',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timeSpent: 240
      },
      {
        title: 'Weekly Planning',
        description: 'Plan tasks and goals for the week',
        category: 'personal',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        timeSpent: 30
      },
      {
        title: 'Exercise Routine',
        description: 'Complete daily workout session',
        category: 'personal',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 0
      },
      {
        title: 'Project Documentation',
        description: 'Update project documentation with recent changes',
        category: 'personal',
        priority: 'low',
        status: 'todo',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        completedAt: null,
        timeSpent: 0
      }
    ];

    for (const task of testData) {
      await pool.query(
        'INSERT INTO tasks (title, description, category, priority, status, dueDate, completedAt, timeSpent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.category, task.priority, task.status, task.dueDate, task.completedAt, task.timeSpent]
      );
    }

    console.log('Test data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting test data:', error);
    process.exit(1);
  }
};

insertTestData();
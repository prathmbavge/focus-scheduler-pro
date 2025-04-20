import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { initializeDatabase, checkDatabaseHealth } from './config/initDb.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'cache-control', 'x-request-time']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test database connection and initialize schema on startup
(async () => {
  try {
    const connected = await testConnection();
    
    if (connected) {
      console.log('Database connection test successful!');
      
      // Initialize database tables
      const initialized = await initializeDatabase();
      
      if (initialized) {
        console.log('Database schema initialized successfully!');
      } else {
        console.error('Error initializing database schema');
      }
    } else {
      console.error('Failed to connect to database. Server may not function correctly.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

// API routes
app.use('/api', apiRoutes);

// Comprehensive health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    res.json({ 
      status: dbHealth.connected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5001,
      database: {
        connected: dbHealth.connected,
        tablesExist: dbHealth.tablesExist,
        operational: dbHealth.tasksTableOperational,
        error: dbHealth.error
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
}); 
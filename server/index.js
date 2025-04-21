const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
console.log('Loading environment from:', envFile);
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const express = require('express');
const { corsMiddleware } = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { setupWebSocketServer } = require('./websocket');

const app = express();
const PORT = parseInt(process.env.PORT) || 5003;

console.log('Server configuration:', {
  port: PORT,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.VITE_API_URL
});

// Function to find an available port
async function findAvailablePort(startPort) {
  const net = require('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// Initialize database connection
const db = require('./config/database');

// Load environment variables
console.log('Environment variables loaded');
console.log('Database config:', {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQLDATABASE
});

// Apply middleware
app.use(corsMiddleware);
app.use(express.json());

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    port: PORT
  });
});

// Database connection check endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Database test endpoint accessed');
    const [rows] = await db.query('SELECT 1');
    res.json({ message: 'Database connection successful!', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// New endpoint for resetting user data (for new users)
app.post('/api/reset-data', async (req, res) => {
  try {
    console.log('Data reset endpoint accessed');
    
    // This is where we'd normally handle authentication,
    // but for this simple implementation we'll skip it
    
    // Notify WebSocket clients about the reset
    if (global.wss) {
      global.wss.broadcast({
        type: 'DATA_RESET',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Reset signal broadcast to all clients',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset data', 
      details: error.message
    });
  }
});

// Routes
console.log('Loading routes...');
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/data-reset', require('./routes/data-reset'));
app.use('/api/ai', require('./routes/ai'));
console.log('Routes loaded');

// Error handling middleware
app.use(errorHandler);

// Create HTTP server instance
const server = http.createServer(app);

// Start server with port fallback and retry logic
async function startServer(retries = 5) {
  let currentTry = 0;

  while (currentTry < retries) {
    try {
      console.log(`Attempting to start server on port ${PORT} (attempt ${currentTry + 1}/${retries})`);
      
      // Initialize WebSocket server
      const wss = setupWebSocketServer(server);
      // Store WebSocket server in global scope for access from routes
      global.wss = wss;
      
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`WebSocket server running on ws://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Database host: ${process.env.MYSQLHOST}`);
        console.log('Available endpoints:');
        console.log('- GET /api/health');
        console.log('- GET /api/db-test');
        console.log('- GET /api/profile/current-user');
        console.log('- POST /api/reset-data');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM signal. Shutting down gracefully...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });

        // Force close after 10s
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        server.close(() => process.exit(1));
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      });

      break;
    } catch (error) {
      currentTry++;
      console.error(`Failed to start server (attempt ${currentTry}/${retries}):`, error);
      
      if (currentTry === retries) {
        console.error('Max retries reached. Could not start server.');
        process.exit(1);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Initialize server
console.log('Starting server...');
startServer();
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env.temp') });

// Log database config for debugging
console.log('Environment variables loaded');
console.log('Database config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

console.log('Connecting to database...');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Prathm1234',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'task_scheduler',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
});

// Convert to promise-based pool
const promisePool = pool.promise();

// Function to attempt database connection with retries
async function connectWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await promisePool.query('SELECT 1');
      console.log('Database connected successfully');
      console.log(`Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1}/${retries} failed:`, err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All connection attempts failed. Please check your environment variables and database configuration.');
        process.exit(1);
      }
    }
  }
}

// Initialize connection
connectWithRetry();

module.exports = promisePool;

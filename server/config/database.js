const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
console.log(`Loading database config from: ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

// Map environment variables for flexibility
const DB_HOST = process.env.MYSQL_HOST || process.env.DB_HOST || process.env.MYSQLHOST;
const DB_USER = process.env.MYSQL_USER || process.env.DB_USER || process.env.MYSQLUSER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
const DB_PORT = process.env.MYSQL_PORT || process.env.DB_PORT || process.env.MYSQLPORT;
const DB_NAME = process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.MYSQLDATABASE;

// Log database config for debugging
console.log('Database environment variables loaded');
console.log('Database config:', {
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  database: DB_NAME
});

console.log('Connecting to database...');

const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  port: parseInt(DB_PORT) || 3306,
  database: DB_NAME || 'task_scheduler',
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
      console.log(`Connected to: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1}/${retries} failed:`, err);
      console.error(`Connection details: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All connection attempts failed. Please check your environment variables and database configuration.');
        // Don't exit process, allow server to run with degraded functionality
        console.warn('Running server with database functionality disabled');
      }
    }
  }
}

// Initialize connection
connectWithRetry();

module.exports = promisePool;

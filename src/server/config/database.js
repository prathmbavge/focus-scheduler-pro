import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced connection configuration
const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  connectTimeout: 30000, // 30 seconds
  ssl: {
    rejectUnauthorized: false
  }
};

// Create a pool with enhanced error handling
const pool = mysql.createPool(dbConfig);

// Handle connection errors
pool.on('connection', (connection) => {
  console.log('New database connection established');
  
  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection lost. This could be due to the server restart or connection timeout.');
    }
  });
});

// Add debug logging in development
if (process.env.NODE_ENV === 'development') {
  // Log queries in development
  const originalQuery = pool.query;
  pool.query = function (...args) {
    const queryString = args[0];
    console.debug('Executing query:', queryString.substring(0, 100) + (queryString.length > 100 ? '...' : ''));
    return originalQuery.apply(pool, args);
  };
}

// Enhanced test connection function with retries
const testConnection = async (retries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      console.log(`Connected to: ${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`);
      
      // Check if we can actually run a query
      const [result] = await connection.query('SELECT 1 as connection_test');
      console.log('Database query test successful');
      
      connection.release();
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${attempt + 1}/${retries} failed:`, error);
      lastError = error;
      
      if (attempt < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All database connection attempts failed. Last error:', lastError);
  return false;
};

// Function to handle query execution with retries
const executeQuery = async (query, params = [], retries = 2, retryDelay = 500) => {
  let lastError;
  
  for (let attempt = 0; attempt < retries + 1; attempt++) {
    try {
      console.debug(`Executing query (attempt ${attempt + 1}/${retries + 1}):`, 
        query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        'with params:', JSON.stringify(params));
        
      const result = await pool.query(query, params);
      console.debug('Query executed successfully');
      return result;
    } catch (error) {
      console.error(`Query execution failed (attempt ${attempt + 1}/${retries + 1}):`, error);
      console.error('Query:', query);
      console.error('Params:', JSON.stringify(params));
      lastError = error;
      
      // Only retry on connection-related errors
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED') {
        if (attempt < retries) {
          console.log(`Retrying database query in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      } else {
        // Don't retry on syntax errors and other non-connection issues
        break;
      }
    }
  }
  
  throw lastError;
};

export { pool, testConnection, executeQuery }; 
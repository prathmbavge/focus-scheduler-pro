const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.db') });

// Log environment variables (without sensitive data)
console.log('Database Configuration:');
console.log('Host:', process.env.MYSQLHOST);
console.log('Port:', process.env.MYSQLPORT);
console.log('Database:', process.env.MYSQLDATABASE);

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  timezone: 'Z',
  dateStrings: ['DATE', 'DATETIME'],
  ssl: {
    rejectUnauthorized: false
  }
}).promise(); // Convert to promise-based API

// Test the connection
connection.connect()
  .then(() => {
    console.log('Connected to MySQL database');
    // Test a simple query
    return connection.query('SELECT 1');
  })
  .then(() => {
    console.log('Database connection test successful');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    process.exit(1); // Exit on connection failure
  });

module.exports = connection;

/**
 * Database initialization script
 * This script initializes the database schema
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.temp') });
const mysql = require('mysql2/promise');

async function executeQuery(connection, query, description) {
  try {
    await connection.query(query);
    console.log(`✓ ${description} completed successfully`);
  } catch (error) {
    console.error(`✗ Error in ${description}:`, error.message);
    throw error;
  }
}

async function initializeDatabase() {
  let connection;
  try {
    // First connect without database to create it if needed
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    };

    console.log('Attempting to connect to MySQL server...');
    console.log('Using configuration:', {
      ...config,
      password: config.password ? '****' : 'NO PASSWORD'
    });

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to MySQL server');

    // Create and use database
    await executeQuery(
      connection,
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'railway'}`,
      'Database creation'
    );
    await executeQuery(
      connection,
      `USE ${process.env.DB_NAME || 'railway'}`,
      'Database selection'
    );

    // Read schema file
    console.log('Setting up database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found at: ' + schemaPath);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const statements = schemaSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement separately
    for (const statement of statements) {
      await executeQuery(connection, statement, 'Schema setup - ' + statement.split('\n')[0]);
    }

    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✓ Available tables:', tables.map(t => Object.values(t)[0]).join(', '));

    console.log('✓ Database setup completed successfully');

  } catch (err) {
    console.error('Error initializing database:', err);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Database access denied. Please check your credentials in .env.temp file');
      console.error('Required environment variables:');
      console.error('- DB_HOST (current: ' + (process.env.DB_HOST || 'localhost') + ')');
      console.error('- DB_USER (current: ' + (process.env.DB_USER || 'root') + ')');
      console.error('- DB_PASSWORD (current: ' + (process.env.DB_PASSWORD ? 'set' : 'not set') + ')');
      console.error('- DB_PORT (current: ' + (process.env.DB_PORT || '3306') + ')');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase();
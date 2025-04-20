require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupRailwayDatabase() {
  let connection;
  try {
    // Create connection with SSL configuration
    connection = await mysql.createConnection({
      host: 'metro.proxy.rlwy.net',
      user: 'root',
      password: 'fe5DB1HagfaCH3eE5-ge36dc3gaC5Fdh',
      port: 54492,
      database: 'railway',
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Connected to Railway MySQL database');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('Creating tables...');
    await connection.query(schemaSQL);
    console.log('Tables created successfully');

    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Created tables:', tables.map(t => Object.values(t)[0]).join(', '));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupRailwayDatabase();
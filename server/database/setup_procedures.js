/**
 * Script to set up database procedures, triggers, and DBMS properties
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../../config.json');

async function setupDatabaseProcedures() {
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      ...config.database,
      multipleStatements: true // Enable multiple statements for running SQL script
    });

    console.log('Connected to database. Setting up procedures and triggers...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'procedures_triggers.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the script by DELIMITER statements to handle stored procedures and triggers
    const statements = [];
    let currentStatement = '';
    let currentDelimiter = ';';

    // Process the SQL script line by line
    const lines = sqlScript.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip comments and empty lines
      if (line.startsWith('--') || line === '') {
        continue;
      }

      // Handle DELIMITER changes
      if (line.startsWith('DELIMITER')) {
        if (currentStatement.trim() !== '') {
          statements.push(currentStatement);
          currentStatement = '';
        }
        currentDelimiter = line.split(' ')[1];
        continue;
      }

      // Add line to current statement
      currentStatement += line + ' ';

      // Check if statement is complete
      if (line.endsWith(currentDelimiter)) {
        // If delimiter is not semicolon, replace it with semicolon for execution
        if (currentDelimiter !== ';') {
          currentStatement = currentStatement.substring(0, currentStatement.length - currentDelimiter.length) + ';';
        }
        statements.push(currentStatement);
        currentStatement = '';
      }
    }

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await connection.query(statement);
          console.log('Successfully executed statement');
        } catch (err) {
          console.error('Error executing statement:', err.message);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('Database procedures, triggers, and DBMS properties setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database procedures:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup
setupDatabaseProcedures();
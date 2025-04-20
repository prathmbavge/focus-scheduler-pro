const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.db') });

async function setupDatabase() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: process.env.MYSQLPORT,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('Connected to database');

        // Read the setup SQL file
        const setupSQL = await fs.readFile(path.join(__dirname, 'database', 'setup.sql'), 'utf8');

        // Split the SQL file into individual statements
        const statements = setupSQL
            .replace(/CREATE DATABASE.*?;/g, '') // Remove CREATE DATABASE statement
            .replace(/USE.*?;/g, '') // Remove USE statement
            .split(';')
            .filter(statement => statement.trim());

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('Executed statement successfully');
                } catch (err) {
                    console.error('Error executing statement:', err);
                    console.log('Failed statement:', statement);
                }
            }
        }

        // Verify tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Available tables:', tables.map(t => Object.values(t)[0]).join(', '));

        console.log('Database setup completed successfully');
    } catch (err) {
        console.error('Database setup failed:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
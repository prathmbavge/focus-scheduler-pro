const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.db') });

async function applyDatabaseChanges() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            port: process.env.MYSQLPORT,
            database: process.env.MYSQLDATABASE,
            multipleStatements: true
        });

        console.log('Connected to database');

        // Read and execute table creation
        console.log('Creating tables...');
        const createTables = fs.readFileSync(path.join(__dirname, 'create_tables.sql'), 'utf8');
        await connection.query(createTables);
        console.log('Tables created successfully');

        // Read and execute schema update
        console.log('Updating schema...');
        const schemaUpdate = fs.readFileSync(path.join(__dirname, 'update_schema.sql'), 'utf8');
        await connection.query(schemaUpdate);
        console.log('Schema update applied successfully');

        // Read and execute views
        console.log('Creating views...');
        const views = fs.readFileSync(path.join(__dirname, 'views.sql'), 'utf8');
        await connection.query(views);
        console.log('Views created successfully');

        // Verify database structure
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Available tables:', tables.map(t => Object.values(t)[0]));

        const [viewsList] = await connection.query('SHOW FULL TABLES WHERE TABLE_TYPE LIKE "VIEW"');
        console.log('Available views:', viewsList.map(v => Object.values(v)[0]));

    } catch (error) {
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the script
applyDatabaseChanges()
    .then(() => {
        console.log('Database changes applied successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Failed to apply database changes:', error.message);
        process.exit(1);
    }); 
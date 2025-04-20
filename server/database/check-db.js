/**
 * Script to check if the database is properly set up
 */
const db = require('../config/database');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    const connection = await db.pool.getConnection();
    console.log('Database connection successful!');
    connection.release();

    // Check if tasks table exists
    console.log('Checking tasks table...');
    const [tables] = await db.pool.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'tasks'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (tables.length === 0) {
      console.error('Tasks table does not exist!');
      console.log('Please run the database setup script: npm run setup-db');
      process.exit(1);
    }

    console.log('Tasks table exists.');

    // Check if stored procedures exist
    console.log('Checking stored procedures...');
    const [procedures] = await db.pool.execute(
      "SELECT routine_name FROM information_schema.routines WHERE routine_schema = ? AND routine_type = 'PROCEDURE'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (procedures.length === 0) {
      console.warn('No stored procedures found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${procedures.length} stored procedures:`);
      procedures.forEach(proc => console.log(`- ${proc.routine_name}`));
    }

    // Check if triggers exist
    console.log('\nChecking triggers...');
    const [triggers] = await db.pool.execute(
      "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = ?",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (triggers.length === 0) {
      console.warn('No triggers found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${triggers.length} triggers:`);
      triggers.forEach(trigger => console.log(`- ${trigger.trigger_name}`));
    }

    console.log('\nDatabase check completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();/**
 * Script to check if the database is properly set up
 */
const db = require('../config/database');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    const connection = await db.pool.getConnection();
    console.log('Database connection successful!');
    connection.release();

    // Check if tasks table exists
    console.log('Checking tasks table...');
    const [tables] = await db.pool.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'tasks'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (tables.length === 0) {
      console.error('Tasks table does not exist!');
      console.log('Please run the database setup script: npm run setup-db');
      process.exit(1);
    }

    console.log('Tasks table exists.');

    // Check if stored procedures exist
    console.log('Checking stored procedures...');
    const [procedures] = await db.pool.execute(
      "SELECT routine_name FROM information_schema.routines WHERE routine_schema = ? AND routine_type = 'PROCEDURE'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (procedures.length === 0) {
      console.warn('No stored procedures found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${procedures.length} stored procedures:`);
      procedures.forEach(proc => console.log(`- ${proc.routine_name}`));
    }

    // Check if triggers exist
    console.log('\nChecking triggers...');
    const [triggers] = await db.pool.execute(
      "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = ?",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (triggers.length === 0) {
      console.warn('No triggers found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${triggers.length} triggers:`);
      triggers.forEach(trigger => console.log(`- ${trigger.trigger_name}`));
    }

    console.log('\nDatabase check completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();/**
 * Script to check if the database is properly set up
 */
const db = require('../config/database');

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    const connection = await db.pool.getConnection();
    console.log('Database connection successful!');
    connection.release();

    // Check if tasks table exists
    console.log('Checking tasks table...');
    const [tables] = await db.pool.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'tasks'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (tables.length === 0) {
      console.error('Tasks table does not exist!');
      console.log('Please run the database setup script: npm run setup-db');
      process.exit(1);
    }

    console.log('Tasks table exists.');

    // Check if stored procedures exist
    console.log('Checking stored procedures...');
    const [procedures] = await db.pool.execute(
      "SELECT routine_name FROM information_schema.routines WHERE routine_schema = ? AND routine_type = 'PROCEDURE'",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (procedures.length === 0) {
      console.warn('No stored procedures found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${procedures.length} stored procedures:`);
      procedures.forEach(proc => console.log(`- ${proc.routine_name}`));
    }

    // Check if triggers exist
    console.log('\nChecking triggers...');
    const [triggers] = await db.pool.execute(
      "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = ?",
      [process.env.DB_NAME || 'task_scheduler']
    );

    if (triggers.length === 0) {
      console.warn('No triggers found!');
      console.log('Please run the database setup script: npm run setup-db');
    } else {
      console.log(`Found ${triggers.length} triggers:`);
      triggers.forEach(trigger => console.log(`- ${trigger.trigger_name}`));
    }

    console.log('\nDatabase check completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
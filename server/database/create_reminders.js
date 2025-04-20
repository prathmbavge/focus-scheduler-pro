const { pool } = require('../config/database');

async function createReminders() {
    try {
        console.log('Connecting to database...');
        
        // Get existing tasks
        const [tasks] = await pool.query('SELECT id, title, dueDate FROM tasks WHERE dueDate IS NOT NULL');
        
        console.log(`Found ${tasks.length} tasks with due dates:`, tasks);
        
        if (tasks.length === 0) {
            console.log('No tasks found with due dates. Exiting...');
            return;
        }
        
        // Create reminders for each task
        for (const task of tasks) {
            try {
                // Create a reminder 1 hour before the due date
                const reminderTime = new Date(task.dueDate);
                reminderTime.setHours(reminderTime.getHours() - 1);
                
                const [result] = await pool.query(
                    'INSERT INTO reminders (taskId, reminderTime) VALUES (?, ?)',
                    [task.id, reminderTime]
                );
                
                console.log(`Created reminder for task "${task.title}" (ID: ${task.id}) at ${reminderTime}`);
                console.log('Insert result:', result);
            } catch (taskError) {
                console.error(`Error creating reminder for task ${task.id}:`, taskError);
            }
        }
        
        console.log('Finished processing all tasks');
    } catch (error) {
        console.error('Error in createReminders:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

createReminders(); 
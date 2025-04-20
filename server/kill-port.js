const { exec } = require('child_process');

const PORT = process.env.PORT || 5000;

// For Windows
const findProcess = `netstat -ano | findstr :${PORT}`;

exec(findProcess, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error finding process: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }
  
  console.log('Processes using port 5000:');
  console.log(stdout);
  
  // Extract PID from the output
  const lines = stdout.trim().split('\n');
  if (lines.length > 0) {
    const pidMatches = lines[0].match(/\s+(\d+)$/);
    if (pidMatches && pidMatches[1]) {
      const pid = pidMatches[1];
      console.log(`Found process with PID: ${pid}`);
      
      // Kill the process
      exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing process: ${killError.message}`);
          return;
        }
        
        if (killStderr) {
          console.error(`Kill error: ${killStderr}`);
          return;
        }
        
        console.log(`Process killed: ${killStdout}`);
        console.log('You can now restart your server.');
      });
    } else {
      console.log('Could not extract PID from the output.');
    }
  } else {
    console.log('No processes found using port 5000.');
  }
});
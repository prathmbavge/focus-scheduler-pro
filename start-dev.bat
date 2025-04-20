@echo off
echo Starting development servers...

:: Start the backend server
start cmd /k "cd server && npm install && npm run dev"

:: Wait for backend to start
timeout /t 5

:: Start the frontend
start cmd /k "npm install && npm run dev"

echo Development servers started!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173 
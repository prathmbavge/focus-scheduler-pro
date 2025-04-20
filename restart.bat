@echo off
echo Killing processes on port 5000 and 5001...
node server/kill-port.js

echo Updating environment variables...
echo PORT=5001 > .env.temp
echo FRONTEND_URL=http://localhost:8080 >> .env.temp
echo ACCESS_CONTROL_ALLOW_ORIGIN=http://localhost:8080 >> .env.temp
echo VITE_API_BASE_URL=http://localhost:5001/api >> .env.temp
echo NODE_ENV=development >> .env.temp
echo DB_HOST=localhost >> .env.temp
echo DB_USER=root >> .env.temp
echo DB_PASSWORD=Prathm1234 >> .env.temp
echo DB_NAME=task_scheduler >> .env.temp
echo VITE_GEMINI_API_KEY=AIzaSyDummyKeyForTesting >> .env.temp

echo Initializing database with procedures and triggers...
node server/database/init.js

echo Starting server on port 5001...
cd server
start cmd /k "npm run dev"
cd ..

echo Starting client on port 8080...
start cmd /k "npm run dev"

echo Done! The application should now be running with the correct configuration.
echo Server: http://localhost:5001
echo Client: http://localhost:8080
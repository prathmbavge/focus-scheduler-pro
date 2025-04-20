require('dotenv').config();
console.log('Environment variables:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('ACCESS_CONTROL_ALLOW_ORIGIN:', process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
console.log('NODE_ENV:', process.env.NODE_ENV);
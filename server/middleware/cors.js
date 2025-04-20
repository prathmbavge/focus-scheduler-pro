require('dotenv').config();

// Enhanced CORS middleware with unified configuration
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Unified allowed origins list
  const allowedOrigins = [
    'http://localhost:3000',  // Vite development server
    'http://localhost:8080',  // Default development
    'http://localhost:5173',  // Vite default
    'http://localhost:5001',  // Alternative development
    'http://localhost:5002',  // New server port
    'https://timespherepro.vercel.app',  // Production
    'https://focus-scheduler-pro-1.onrender.com',  // Production alternative
    'https://focus-scheduler-pro.vercel.app',  // Vercel deployment
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean); // Remove any undefined/null values

  // Log request details in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`CORS: ${req.method} ${req.url} from origin: ${origin || 'unknown'}`);
    console.log('Allowed origins:', allowedOrigins);
  }

  // Set CORS headers if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header(
      'Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept, Origin, X-Auth-Token, x-access-token, X-Requested-With, Content-Range, Content-Disposition, Content-Description, Accept-Ranges, Range'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Disposition, Content-Description, Accept-Ranges, Range');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`Origin ${origin} not allowed`);
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// This is a backup middleware that ensures the CORS headers are set
const corsHeaderMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://timespherepro.vercel.app',
    'https://focus-scheduler-pro-1.onrender.com',
    'https://focus-scheduler-pro.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean);

  // Double-check that the CORS headers are set correctly
  if (!res.getHeader('Access-Control-Allow-Origin') && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  if (!res.getHeader('Access-Control-Allow-Methods')) {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  }
  
  if (!res.getHeader('Access-Control-Allow-Headers')) {
    res.header(
      'Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept, Origin, X-Auth-Token, x-access-token, X-Requested-With, Content-Range, Content-Disposition, Content-Description, Accept-Ranges, Range'
    );
  }
  
  if (!res.getHeader('Access-Control-Allow-Credentials')) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (!res.getHeader('Access-Control-Expose-Headers')) {
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Disposition, Content-Description, Accept-Ranges, Range');
  }

  if (!res.getHeader('Access-Control-Max-Age')) {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  next();
};

module.exports = {
  corsMiddleware,
  corsHeaderMiddleware
};
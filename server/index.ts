import express from 'express';
import cors from 'cors';
import { profileRouter } from './routes/profile';
import { taskRouter } from './routes/tasks';

const app = express();
const port = 5001;
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5001',
        'https://timespherepro.vercel.app',
        'https://focus-scheduler-pro-1.onrender.com',
        'https://focus-scheduler-pro.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(isDevelopment && { stack: err.stack })
        }
    });
});

// Routes
app.use('/api/profile', profileRouter);
app.use('/api/tasks', taskRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
}); 
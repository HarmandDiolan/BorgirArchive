import express from 'express';
import cors from 'cors';
import corsOptions from './config/cors.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'MONGODB_URI'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.warn('Warning: Missing required environment variables:', missingEnvVars);
}

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Borgir Archive API is running!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined
    };
    res.json(health);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/videos', videoRoutes);

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ 
        message: 'Route not found',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Available routes:');
    console.log('- /');
    console.log('- /health');
    console.log('- /api/test');
    console.log('- /api/auth/*');
    console.log('- /api/admin/*');
    console.log('- /api/videos/*');
    
    if (missingEnvVars.length > 0) {
        console.warn('Warning: Missing required environment variables:', missingEnvVars);
    }
}); 
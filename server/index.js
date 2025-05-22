import express from 'express';
import cors from 'cors';
import corsOptions from './config/cors.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import dotenv from 'dotenv';
import { connectToDatabase, checkConnection } from './utils/db.js';
import mongoose from 'mongoose';

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
    console.warn('⚠️ Warning: Missing required environment variables:', missingEnvVars);
}

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        console.log('🔄 Attempting database connection for request:', req.method, req.url);
        
        // Skip database connection for health check
        if (req.path === '/health') {
            return next();
        }
        
        await connectToDatabase();
        const isConnected = await checkConnection();
        
        if (!isConnected) {
            console.error('❌ Database connection check failed');
            return res.status(500).json({ 
                message: 'Database connection error',
                details: 'Connection check failed',
                state: mongoose.connection.readyState
            });
        }
        
        console.log('✅ Database connection successful');
        next();
    } catch (error) {
        console.error('❌ Database connection error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Database connection error',
            details: error.message,
            state: mongoose.connection.readyState
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/videos', videoRoutes);

// Root route
app.get('/', async (req, res) => {
    console.log('Root route accessed');
    const isConnected = await checkConnection();
    res.json({ 
        message: 'Borgir Archive API is running!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: {
            status: isConnected ? 'connected' : 'disconnected',
            state: mongoose.connection.readyState
        }
    });
});

// Test route
app.get('/api/test', async (req, res) => {
    console.log('Test route accessed');
    const isConnected = await checkConnection();
    res.json({ 
        message: 'Server is working!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        database: {
            status: isConnected ? 'connected' : 'disconnected',
            state: mongoose.connection.readyState
        }
    });
});

// Health check route
app.get('/health', async (req, res) => {
    try {
        console.log('Health check accessed');
        const isConnected = await checkConnection();
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            mongodb: {
                status: isConnected ? 'connected' : 'disconnected',
                state: mongoose.connection.readyState,
                uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing'
            }
        };
        res.json(health);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            details: {
                name: error.name,
                code: error.code
            }
        });
    }
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
    console.log('404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl,
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
        details: {
            name: err.name,
            code: err.code
        },
        timestamp: new Date().toISOString()
    });
});

// Export the Express API
export default app; 
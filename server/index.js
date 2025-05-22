import express from 'express';
import cors from 'cors';
import corsOptions from './config/cors.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import dotenv from 'dotenv';
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
    console.warn('Warning: Missing required environment variables:', missingEnvVars);
}

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/videos', videoRoutes);

// Root route
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ 
        message: 'Borgir Archive API is running!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ 
        message: 'Server is working!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    console.log('Health check accessed');
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
        memory: process.memoryUsage(),
        uptime: process.uptime()
    };
    res.json(health);
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
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('=================================');
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
    console.log('=================================');
}); 
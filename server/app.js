import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import corsOptions from './config/cors.js'
import auth from './routes/auth.js';
import addUser from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Present' : 'Missing');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        console.log('Using cached database connection');
        return cachedDb;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const client = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        cachedDb = client;
        console.log('✅ Connected to MongoDB successfully');
        return client;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Borgir Archive API is running!',
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', auth);
app.use('/api/admin', addUser);
app.use('/api/videos', videoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 8000;
    app.listen(port, async () => {
        try {
            await connectToDatabase();
            console.log(`✅ Server is running on port ${port}`);
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}

// Export for Vercel
export default async function handler(req, res) {
    try {
        // Connect to database
        await connectToDatabase();
        
        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
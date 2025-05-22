import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import corsOptions from './config/cors.js'
import auth from './routes/auth.js';
import addUser from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
const app = express()
dotenv.config()

// Debug logging
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Present' : 'Missing');

const port = process.env.PORT || 8000

app.use(cors(corsOptions));

app.use(express.json());

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            
            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries} failed:`, error.message);
            
            if (retries === maxRetries) {
                console.error('❌ Max retries reached. Could not connect to MongoDB');
                return false;
            }
            
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
};

// Connection event handlers
mongoose.connection.on('disconnected', () => {
    console.log('❌ Disconnected from MongoDB');
    // Attempt to reconnect
    connectWithRetry();
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

// Start server only after successful database connection
const startServer = async () => {
    const connected = await connectWithRetry();
    if (connected) {
        app.listen(port, () => {
            console.log(`✅ Server is running on port ${port}`);
        });
    } else {
        console.error('❌ Server startup failed due to database connection issues');
        process.exit(1);
    }
};

// Routes
app.use('/api/auth', auth);
app.use('/api/admin', addUser);
app.use('/api/videos', videoRoutes);

// Start the server
startServer();
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import auth from './routes/auth.js';
import addUser from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import corsOptions from './config/cors.js';

const app = express()
dotenv.config()

const port = process.env.PORT

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/admin', addUser);
app.use('/api/videos', videoRoutes);

//Connection
const connect = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            if (mongoose.connection.readyState === 1) {
                console.log('Already connected to MongoDB');
                return;
            }

            const mongoUri = process.env.MONGODB_URI || process.env.MONGODB;
            if (!mongoUri) {
                console.error('MongoDB URI is not set in environment variables');
                throw new Error('MongoDB connection string not found in environment variables');
            }

            // Log the first few characters of the URI for debugging (safely)
            const uriPreview = mongoUri.substring(0, 20) + '...';
            console.log(`Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
            console.log(`Connection URI preview: ${uriPreview}`);
            console.log('Current connection state:', mongoose.connection.readyState);

            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4, // Force IPv4
                maxPoolSize: 10,
                minPoolSize: 5,
                retryWrites: true,
                w: 'majority'
            });
            
            console.log('Connected to MongoDB successfully');
            console.log('Connection state after connect:', mongoose.connection.readyState);
            return;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                state: mongoose.connection.readyState
            });
            
            if (i === retries - 1) {
                console.error('All MongoDB connection attempts failed');
                process.exit(1);
            }
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Add more detailed connection event logging
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
    // Attempt to reconnect
    connect();
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        state: mongoose.connection.readyState
    });
});

// Add connection state logging
setInterval(() => {
    console.log('Current MongoDB connection state:', mongoose.connection.readyState);
}, 30000); // Log every 30 seconds

// Connect to database before starting the server
connect().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log('Environment:', process.env.NODE_ENV);
        console.log('MongoDB URI is set:', !!(process.env.MONGODB_URI || process.env.MONGODB));
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
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
const connect = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            const mongoUri = process.env.MONGODB_URI || process.env.MONGODB;
            if (!mongoUri) {
                throw new Error('MongoDB connection string not found in environment variables');
            }
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit if we can't connect to the database
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Connect to database before starting the server
connect().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
    console.log('🔌 Attempting database connection...');
    console.log('Current connection state:', mongoose.connection.readyState);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');

    if (isConnected) {
        console.log('✅ Using existing database connection');
        return;
    }

    try {
        console.log('🔄 Connecting to MongoDB...');
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB connected successfully');
        console.log('Connection details:', {
            host: db.connection.host,
            port: db.connection.port,
            name: db.connection.name,
            readyState: db.connection.readyState
        });
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        isConnected = false;
        throw error;
    }
};

export const checkConnection = () => {
    const state = mongoose.connection.readyState;
    console.log('🔍 Checking database connection state:', state);
    return state === 1;
}; 
import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
    console.log('🔌 Attempting database connection...');
    console.log('Current connection state:', mongoose.connection.readyState);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');

    // If already connected, return
    if (mongoose.connection.readyState === 1) {
        console.log('✅ Using existing database connection');
        isConnected = true;
        return;
    }

    // If connecting, wait for connection
    if (mongoose.connection.readyState === 2) {
        console.log('⚠️ Connection in progress, waiting...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Connection completed');
            isConnected = true;
            return;
        }
    }

    try {
        console.log('🔄 Connecting to MongoDB...');
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 1,
            minPoolSize: 0,
            maxIdleTimeMS: 60000,
            waitQueueTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB connected successfully');
        console.log('Connection details:', {
            host: db.connection.host,
            port: db.connection.port,
            name: db.connection.name,
            readyState: db.connection.readyState
        });

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
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

export const checkConnection = async () => {
    const state = mongoose.connection.readyState;
    console.log('🔍 Checking database connection state:', state);
    
    // If disconnected, try to reconnect
    if (state === 0) {
        console.log('⚠️ Database disconnected, attempting to reconnect...');
        try {
            await connectToDatabase();
            return mongoose.connection.readyState === 1;
        } catch (error) {
            console.error('❌ Reconnection failed:', error);
            return false;
        }
    }
    
    // If connecting, wait for connection
    if (state === 2) {
        console.log('⚠️ Database is connecting, waiting...');
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (mongoose.connection.readyState === 0) {
                    try {
                        await connectToDatabase();
                    } catch (error) {
                        console.error('❌ Connection failed after wait:', error);
                    }
                }
                resolve(mongoose.connection.readyState === 1);
            }, 5000);
        });
    }
    
    return state === 1;
}; 
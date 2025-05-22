import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = db.connections[0].readyState === 1;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};

export const checkConnection = () => {
    return mongoose.connection.readyState === 1;
}; 
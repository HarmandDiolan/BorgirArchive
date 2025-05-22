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

app.use('/api/auth', auth);
app.use('/api/admin', addUser);
app.use('/api/videos', videoRoutes);

//Connection
const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB');
    }catch(error){
        console.log(error);
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB')
})

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB')
})

app.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
});